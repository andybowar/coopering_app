import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue';

interface Point {
  x: number;
  y: number;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;

/**
 * Pan & zoom for an <svg>. Bind `transformAttr(cx, cy)` to a <g> wrapping the
 * drawing, where (cx, cy) is the drawing's centre in viewBox units.
 *
 * Touch: one finger pans, two fingers pinch, double tap resets.
 * Mouse: drag pans, wheel (or trackpad pinch) zooms toward the cursor,
 * double-click resets.
 */
export function usePinchZoom(elementRef: Ref<SVGElement | null>) {
  const scale = ref(1);
  // Pan offset in viewBox units (applied on top of the centre-based scaling).
  const translateX = ref(0);
  const translateY = ref(0);

  // Centre passed to transformAttr; needed to zoom about an arbitrary point.
  let centerX = 0;
  let centerY = 0;

  let initialDistance = 0;
  let initialScale = 1;
  let lastTouchEnd = 0;
  let isDragging = false;
  let lastPoint: Point | null = null;
  let isSetup = false;

  function clampScale(s: number): number {
    return Math.min(Math.max(s, MIN_SCALE), MAX_SCALE);
  }

  /** Convert client (screen) coordinates to the svg's viewBox coordinates. */
  function toSvgPoint(clientX: number, clientY: number): Point {
    const el = elementRef.value as SVGGraphicsElement | null;
    const ctm = el?.getScreenCTM?.();
    if (!ctm) return { x: clientX, y: clientY };
    const inv = ctm.inverse();
    return {
      x: inv.a * clientX + inv.c * clientY + inv.e,
      y: inv.b * clientX + inv.d * clientY + inv.f
    };
  }

  /** Pan by a screen-space delta, converted to viewBox units. */
  function panBy(fromClient: Point, toClient: Point) {
    const a = toSvgPoint(fromClient.x, fromClient.y);
    const b = toSvgPoint(toClient.x, toClient.y);
    translateX.value += b.x - a.x;
    translateY.value += b.y - a.y;
  }

  /** Zoom to `newScale`, keeping the content under client point (x, y) fixed. */
  function zoomAt(newScale: number, clientX: number, clientY: number) {
    const s = scale.value;
    const s2 = clampScale(newScale);
    if (s2 === s) return;
    const m = toSvgPoint(clientX, clientY);
    // Rendered position: p * s + offset, where offset = t + c * (1 - s).
    const offX = translateX.value + centerX * (1 - s);
    const offY = translateY.value + centerY * (1 - s);
    const newOffX = m.x - ((m.x - offX) * s2) / s;
    const newOffY = m.y - ((m.y - offY) * s2) / s;
    translateX.value = newOffX - centerX * (1 - s2);
    translateY.value = newOffY - centerY * (1 - s2);
    scale.value = s2;
  }

  // ---- Touch -------------------------------------------------------------

  function getDistance(t1: Touch, t2: Touch): number {
    return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
  }

  function getMidpoint(t1: Touch, t2: Touch): Point {
    return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
  }

  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      event.preventDefault();
      isDragging = false;
      initialDistance = getDistance(event.touches[0], event.touches[1]);
      initialScale = scale.value;
      lastPoint = getMidpoint(event.touches[0], event.touches[1]);
    } else if (event.touches.length === 1) {
      isDragging = true;
      lastPoint = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (event.touches.length === 2 && initialDistance > 0) {
      event.preventDefault();
      const mid = getMidpoint(event.touches[0], event.touches[1]);
      const ratio = getDistance(event.touches[0], event.touches[1]) / initialDistance;
      if (lastPoint) panBy(lastPoint, mid);
      zoomAt(initialScale * ratio, mid.x, mid.y);
      lastPoint = mid;
    } else if (event.touches.length === 1 && isDragging && lastPoint) {
      event.preventDefault();
      const p = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      panBy(lastPoint, p);
      lastPoint = p;
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    if (event.touches.length === 0) {
      isDragging = false;
      lastPoint = null;
      initialDistance = 0;
      const now = Date.now();
      if (now - lastTouchEnd < 300) resetZoom();
      lastTouchEnd = now;
    } else if (event.touches.length === 1) {
      // One finger lifted mid-pinch: continue as a pan.
      isDragging = true;
      initialDistance = 0;
      lastPoint = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
  }

  // ---- Mouse -------------------------------------------------------------

  function handlePointerDown(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    event.preventDefault();
    isDragging = true;
    lastPoint = { x: event.clientX, y: event.clientY };
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    elementRef.value?.classList.add('is-panning');
  }

  function handlePointerMove(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || !isDragging || !lastPoint) return;
    const p = { x: event.clientX, y: event.clientY };
    panBy(lastPoint, p);
    lastPoint = p;
  }

  function handlePointerUp(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return;
    isDragging = false;
    lastPoint = null;
    elementRef.value?.classList.remove('is-panning');
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    // Normalise line/page deltas to pixels.
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
    // Trackpad pinch arrives as ctrl+wheel with small deltas; boost it.
    const sensitivity = event.ctrlKey ? 0.01 : 0.0015;
    const factor = Math.exp(-event.deltaY * unit * sensitivity);
    zoomAt(scale.value * factor, event.clientX, event.clientY);
  }

  function handleDblClick(event: MouseEvent) {
    event.preventDefault();
    resetZoom();
  }

  function resetZoom() {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
  }

  // ---- Wiring ------------------------------------------------------------

  const listeners: [string, EventListener, AddEventListenerOptions?][] = [
    ['touchstart', handleTouchStart as EventListener, { passive: false }],
    ['touchmove', handleTouchMove as EventListener, { passive: false }],
    ['touchend', handleTouchEnd as EventListener],
    ['pointerdown', handlePointerDown as EventListener],
    ['pointermove', handlePointerMove as EventListener],
    ['pointerup', handlePointerUp as EventListener],
    ['pointercancel', handlePointerUp as EventListener],
    ['wheel', handleWheel as EventListener, { passive: false }],
    ['dblclick', handleDblClick as EventListener]
  ];

  let boundElement: SVGElement | null = null;

  function setupListeners() {
    const el = elementRef.value;
    if (!el || isSetup) return;
    for (const [type, fn, opts] of listeners) el.addEventListener(type, fn, opts);
    el.classList.add('pan-zoom');
    boundElement = el;
    isSetup = true;
  }

  function removeListeners() {
    if (!boundElement || !isSetup) return;
    for (const [type, fn] of listeners) boundElement.removeEventListener(type, fn);
    boundElement.classList.remove('pan-zoom', 'is-panning');
    boundElement = null;
    isSetup = false;
  }

  // The svg may be v-if'd in after mount (e.g. once results exist).
  watch(() => elementRef.value, (el) => {
    if (el !== boundElement) removeListeners();
    if (el) setupListeners();
  }, { immediate: true });

  onMounted(setupListeners);
  onUnmounted(removeListeners);

  const transformStyle = () =>
    `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`;

  const transformAttr = (cx: number = 0, cy: number = 0) => {
    centerX = cx;
    centerY = cy;
    const s = scale.value;
    const x = translateX.value + cx * (1 - s);
    const y = translateY.value + cy * (1 - s);
    return `translate(${x}, ${y}) scale(${s})`;
  };

  const inverseScale = () => 1 / scale.value;

  return {
    scale,
    translateX,
    translateY,
    transformStyle,
    transformAttr,
    inverseScale,
    resetZoom
  };
}
