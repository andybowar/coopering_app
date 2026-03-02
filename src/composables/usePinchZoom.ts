import { ref, onMounted, onUnmounted, watch } from 'vue';

interface Point {
  x: number;
  y: number;
}

export function usePinchZoom(elementRef: any) {
  const scale = ref(1);
  const translateX = ref(0);
  const translateY = ref(0);

  let initialDistance = 0;
  let initialScale = 1;
  let lastTouchEnd = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initialTranslateX = 0;
  let initialTranslateY = 0;
  let isSetup = false;

  function getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getMidpoint(touch1: Touch, touch2: Touch): Point {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }

  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      // Pinch gesture
      event.preventDefault();
      initialDistance = getDistance(event.touches[0], event.touches[1]);
      initialScale = scale.value;
    } else if (event.touches.length === 1) {
      // Potential drag
      isDragging = true;
      dragStartX = event.touches[0].clientX;
      dragStartY = event.touches[0].clientY;
      initialTranslateX = translateX.value;
      initialTranslateY = translateY.value;
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (event.touches.length === 2) {
      // Pinch zoom
      event.preventDefault();
      const currentDistance = getDistance(event.touches[0], event.touches[1]);
      const scaleChange = currentDistance / initialDistance;
      const newScale = initialScale * scaleChange;

      // Limit scale between 0.5 and 5
      scale.value = Math.min(Math.max(newScale, 0.5), 5);
    } else if (event.touches.length === 1 && isDragging) {
      // Pan/drag
      event.preventDefault();
      const deltaX = event.touches[0].clientX - dragStartX;
      const deltaY = event.touches[0].clientY - dragStartY;

      translateX.value = initialTranslateX + deltaX;
      translateY.value = initialTranslateY + deltaY;
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    if (event.touches.length === 0) {
      isDragging = false;

      // Double tap to reset
      const now = Date.now();
      if (now - lastTouchEnd < 300) {
        resetZoom();
      }
      lastTouchEnd = now;
    } else if (event.touches.length === 1) {
      // One finger left, reset drag state
      isDragging = true;
      dragStartX = event.touches[0].clientX;
      dragStartY = event.touches[0].clientY;
      initialTranslateX = translateX.value;
      initialTranslateY = translateY.value;
    }
  }

  function resetZoom() {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
  }

  function setupListeners() {
    if (!elementRef.value || isSetup) return;

    const element = elementRef.value;
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    isSetup = true;
  }

  function removeListeners() {
    if (!elementRef.value || !isSetup) return;

    const element = elementRef.value;
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('touchend', handleTouchEnd);
    isSetup = false;
  }

  // Watch for when the ref becomes available
  watch(() => elementRef.value, (newVal) => {
    if (newVal && !isSetup) {
      setupListeners();
    }
  }, { immediate: true });

  onMounted(() => {
    setupListeners();
  });

  onUnmounted(() => {
    removeListeners();
  });

  const transformStyle = () => {
    return `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`;
  };

  const transformAttr = (centerX: number = 0, centerY: number = 0) => {
    // To scale around a center point in SVG, we need:
    // translate(cx, cy) scale(s) translate(-cx, -cy) with user pan added
    const s = scale.value;
    const adjustedX = translateX.value + centerX * (1 - s);
    const adjustedY = translateY.value + centerY * (1 - s);
    return `translate(${adjustedX}, ${adjustedY}) scale(${s})`;
  };

  const inverseScale = () => {
    return 1 / scale.value;
  };

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
