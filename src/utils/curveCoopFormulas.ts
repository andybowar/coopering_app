import type { Point, CurveCoopInputs, CurveCoopOutputs, StaveInfo } from '../types/curveCoop';

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Format a number to specified decimal places
 */
export function formatResult(value: number, decimals: number = 1): number {
  return Number(value.toFixed(decimals));
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Normalize and minimally smooth a curve
 * Scales to real-world dimensions and applies gentle smoothing (max ±0.125" change per point)
 */
export function normalizeAndSmoothCurve(
  points: Point[],
  totalLength: number,
  totalHeight: number
): Point[] {
  if (points.length < 2) return points;

  // Find bounds of drawing
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));

  const drawingWidth = maxX - minX;
  const drawingHeight = maxY - minY;

  if (drawingWidth === 0 || drawingHeight === 0) return points;

  // Scale to real-world inches
  const scaleX = totalLength / drawingWidth;
  const scaleY = totalHeight / drawingHeight;

  // Normalize to real-world coordinates
  // Note: Flip Y axis since canvas Y increases downward but we want Y to increase upward
  const normalized: Point[] = points.map(p => ({
    x: (p.x - minX) * scaleX,
    y: (maxY - p.y) * scaleY
  }));

  // Apply minimal smoothing with max ±0.125" constraint
  const maxChange = 0.125; // inches
  const smoothed: Point[] = [normalized[0]]; // Keep first point unchanged

  for (let i = 1; i < normalized.length - 1; i++) {
    const prev = normalized[i - 1];
    const curr = normalized[i];
    const next = normalized[i + 1];

    // Calculate average (simple smoothing)
    const avgX = (prev.x + curr.x + next.x) / 3;
    const avgY = (prev.y + curr.y + next.y) / 3;

    // Calculate change from original
    const changeX = avgX - curr.x;
    const changeY = avgY - curr.y;

    // Constrain change to max ±0.125"
    const constrainedX = curr.x + Math.max(-maxChange, Math.min(maxChange, changeX));
    const constrainedY = curr.y + Math.max(-maxChange, Math.min(maxChange, changeY));

    smoothed.push({ x: constrainedX, y: constrainedY });
  }

  // Keep last point unchanged
  smoothed.push(normalized[normalized.length - 1]);

  return smoothed;
}

/**
 * Resample curve to have exactly N evenly-spaced points
 */
export function resampleCurve(points: Point[], numPoints: number): Point[] {
  if (points.length < 2) return points;

  // Calculate total length of curve
  let totalLength = 0;
  const segmentLengths: number[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const len = distance(points[i], points[i + 1]);
    segmentLengths.push(len);
    totalLength += len;
  }

  // Resample at even intervals
  const resampled: Point[] = [points[0]]; // Start with first point
  const targetLength = totalLength / (numPoints - 1);

  let currentLength = 0;
  let pointIndex = 0;

  for (let i = 1; i < numPoints - 1; i++) {
    const targetDist = i * targetLength;

    // Find the segment containing this distance
    while (currentLength + segmentLengths[pointIndex] < targetDist && pointIndex < segmentLengths.length - 1) {
      currentLength += segmentLengths[pointIndex];
      pointIndex++;
    }

    // Interpolate within the segment
    const remainingDist = targetDist - currentLength;
    const segmentRatio = remainingDist / segmentLengths[pointIndex];

    const p1 = points[pointIndex];
    const p2 = points[pointIndex + 1];

    resampled.push({
      x: p1.x + (p2.x - p1.x) * segmentRatio,
      y: p1.y + (p2.y - p1.y) * segmentRatio
    });
  }

  // Add the last point
  resampled.push(points[points.length - 1]);

  return resampled;
}

/**
 * Calculate angle between three points (angle at p2)
 * Returns angle in degrees
 */
export function calculateAngle(p1: Point, p2: Point, p3: Point): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const det = v1.x * v2.y - v1.y * v2.x;
  const angle = Math.atan2(det, dot);

  return toDegrees(angle);
}

/**
 * Calculate blade tilt angle from the angle between two segments
 * Blade tilt is 0° when perpendicular to table
 * Note: This gives half of the joint angle (e.g., 90° joint → 45° blade tilt)
 */
export function calculateBladeTilt(segmentAngle: number): number {
  // When segments are straight (180°), blade tilt is 0°
  // When segments curve, blade tilt = (180° - segmentAngle) / 2
  // This is half of the deviation from straight
  const bladeTilt = (180 - Math.abs(segmentAngle)) / 2;
  return bladeTilt;
}

/**
 * Calculate coopering angles for staves based on drawn curve
 */
export function calculateCurveCoop(
  drawnPoints: Point[],
  inputs: CurveCoopInputs,
  anglePrecision: number = 1
): CurveCoopOutputs {
  const { totalLength, totalHeight, numberOfStaves } = inputs;

  if (!totalLength || !totalHeight || !numberOfStaves || drawnPoints.length < 2) {
    throw new Error('Invalid inputs');
  }

  // Normalize and minimally smooth the curve to real-world dimensions
  const normalizedCurve = normalizeAndSmoothCurve(drawnPoints, totalLength, totalHeight);

  // Resample curve to have exactly numberOfStaves + 1 points (one per joint + ends)
  const resampledPoints = resampleCurve(normalizedCurve, numberOfStaves + 1);

  // Calculate angles at each joint
  const staves: StaveInfo[] = [];

  for (let i = 0; i < numberOfStaves; i++) {
    const p1 = resampledPoints[i];
    const p2 = resampledPoints[i + 1];
    const p3 = resampledPoints[Math.min(numberOfStaves, i + 2)];

    // Calculate angle between segments
    let segmentAngle: number;
    if (i === 0) {
      // First stave - calculate angle at first joint
      segmentAngle = calculateAngle(p1, p2, p3);
    } else if (i === numberOfStaves - 1) {
      // Last stave - calculate angle at last joint
      const p0 = resampledPoints[i - 1];
      segmentAngle = calculateAngle(p0, p1, p2);
    } else {
      // Middle staves - calculate angle at joint
      segmentAngle = calculateAngle(p1, p2, p3);
    }

    // Convert segment angle to blade tilt angle
    const bladeTiltAngle = calculateBladeTilt(segmentAngle);

    // Calculate pixel width of this segment
    const pixelWidth = distance(resampledPoints[i], resampledPoints[i + 1]);

    staves.push({
      index: i + 1,
      bladeTiltAngle: formatResult(bladeTiltAngle, anglePrecision),
      width: pixelWidth // Will be scaled later
    });
  }

  // Calculate total pixel width of curve
  const totalPixelWidth = staves.reduce((sum, s) => sum + s.width, 0);

  // Scale stave widths to real-world units
  const scaleFactor = totalLength / totalPixelWidth;
  staves.forEach(stave => {
    stave.width = formatResult(stave.width * scaleFactor, 4);
  });

  // Calculate statistics
  const totalAngleChange = staves.reduce((sum, s) => sum + Math.abs(s.bladeTiltAngle), 0);
  const averageStaveWidth = totalLength / numberOfStaves;

  return {
    staves,
    totalAngleChange: formatResult(totalAngleChange),
    averageStaveWidth: formatResult(averageStaveWidth, 4),
    normalizedPoints: resampledPoints
  };
}

/**
 * Calculate coopering angles for a circular arc
 */
export function calculateRadiusCoop(
  radius: number,
  chordLength: number,
  numberOfStaves: number,
  anglePrecision: number = 1,
  staveThickness: number = 0
): CurveCoopOutputs {
  if (radius <= 0 || chordLength <= 0 || numberOfStaves < 2) {
    throw new Error('Invalid inputs');
  }

  // Calculate central angle from chord length
  // chord = 2 * radius * sin(angle/2)
  // angle = 2 * arcsin(chord / (2 * radius))
  const halfAngleRad = Math.asin(chordLength / (2 * radius));
  const centralAngleRad = 2 * halfAngleRad;
  const centralAngleDeg = toDegrees(centralAngleRad);

  // Calculate actual arc length from central angle
  const arcLength = radius * centralAngleRad;

  // Each stave subtends this angle
  const anglePerStaveRad = centralAngleRad / numberOfStaves;
  const anglePerStaveDeg = centralAngleDeg / numberOfStaves;

  // Blade tilt is half of the angle change at each joint
  const bladeTiltAngle = anglePerStaveDeg / 2;

  // Calculate stave width as chord length (concave - inner radius)
  const concaveWidth = 2 * radius * Math.sin(anglePerStaveRad / 2);

  // Calculate convex width if thickness is specified (outer radius)
  const outerRadius = radius + staveThickness;
  const convexWidth = staveThickness > 0 ? 2 * outerRadius * Math.sin(anglePerStaveRad / 2) : undefined;

  // Generate staves (all have the same blade tilt)
  const staves: StaveInfo[] = [];
  for (let i = 0; i < numberOfStaves; i++) {
    const stave: StaveInfo = {
      index: i + 1,
      bladeTiltAngle: formatResult(bladeTiltAngle, anglePrecision),
      width: formatResult(concaveWidth, 4)
    };
    if (convexWidth !== undefined) {
      stave.convexWidth = formatResult(convexWidth, 4);
    }
    staves.push(stave);
  }

  // Generate points along the arc for visualization
  const points: Point[] = [];
  const startAngle = -centralAngleRad / 2; // Center the arc
  const minCos = Math.cos(centralAngleRad / 2);
  const maxY = radius * (1 - minCos); // Maximum height at ends

  for (let i = 0; i <= numberOfStaves; i++) {
    const angle = startAngle + (i * centralAngleRad / numberOfStaves);
    // Arc curves upward (concave up): center is lowest, ends are highest
    const x = arcLength / 2 + radius * Math.sin(angle);
    const y = maxY - radius * (Math.cos(angle) - minCos);
    points.push({ x, y });
  }

  const totalAngleChange = bladeTiltAngle * (numberOfStaves - 1);

  return {
    staves,
    totalAngleChange: formatResult(totalAngleChange),
    averageStaveWidth: formatResult(concaveWidth, 4),
    normalizedPoints: points
  };
}

/**
 * Calculate coopering angles for a tapered arc (different front and back radii)
 */
export function calculateTaperedCoop(
  frontRadius: number,
  backRadius: number,
  frontChordLength: number,
  depth: number,
  numberOfStaves: number,
  anglePrecision: number = 1,
  staveThickness: number = 0
): CurveCoopOutputs {
  if (frontRadius <= 0 || backRadius <= 0 || frontChordLength <= 0 || depth <= 0 || numberOfStaves < 2) {
    throw new Error('Invalid inputs');
  }

  // Calculate central angle from front chord length
  // chord = 2 * radius * sin(angle/2)
  const halfAngleRad = Math.asin(frontChordLength / (2 * frontRadius));
  const centralAngleRad = 2 * halfAngleRad;
  const centralAngleDeg = toDegrees(centralAngleRad);

  // Calculate actual arc lengths (for visualization)
  const frontArcLength = frontRadius * centralAngleRad;
  const backArcLength = backRadius * centralAngleRad;

  // Each stave subtends this angle
  const anglePerStaveRad = centralAngleRad / numberOfStaves;
  const anglePerStaveDeg = centralAngleDeg / numberOfStaves;

  // Blade tilt is constant along the stave length
  const bladeTiltAngle = anglePerStaveDeg / 2;

  // Calculate stave dimensions as chord lengths
  // Front concave (inner radius)
  const frontConcaveWidth = 2 * frontRadius * Math.sin(anglePerStaveRad / 2);
  // Back concave (inner radius)
  const backConcaveWidth = 2 * backRadius * Math.sin(anglePerStaveRad / 2);

  // Calculate convex widths if thickness is specified (outer radius)
  const frontOuterRadius = frontRadius + staveThickness;
  const backOuterRadius = backRadius + staveThickness;
  const frontConvexWidth = staveThickness > 0 ? 2 * frontOuterRadius * Math.sin(anglePerStaveRad / 2) : undefined;
  const backConvexWidth = staveThickness > 0 ? 2 * backOuterRadius * Math.sin(anglePerStaveRad / 2) : undefined;

  // Calculate taper angle (angle from perpendicular)
  const widthDifference = frontConcaveWidth - backConcaveWidth;
  const taperAngleRad = Math.atan(widthDifference / (2 * depth));
  const taperAngle = toDegrees(taperAngleRad);

  // Rise/run form of the same taper, for marking out instead of setting an
  // angle: over the stave length (run), each long edge moves in by half the
  // width difference (rise). Taken directly from the widths to avoid rounding
  // through the angle.
  const taperRise = Math.abs(widthDifference) / 2;

  // Generate staves
  const staves: StaveInfo[] = [];
  for (let i = 0; i < numberOfStaves; i++) {
    const stave: StaveInfo = {
      index: i + 1,
      bladeTiltAngle: formatResult(bladeTiltAngle, anglePrecision),
      width: formatResult(frontConcaveWidth, 4),
      backWidth: formatResult(backConcaveWidth, 4),
      length: formatResult(depth, 4),
      taperAngle: formatResult(taperAngle, anglePrecision),
      taperRise: formatResult(taperRise, 4),
      taperRun: formatResult(depth, 4)
    };
    if (frontConvexWidth !== undefined && backConvexWidth !== undefined) {
      stave.convexWidth = formatResult(frontConvexWidth, 4);
      stave.backConvexWidth = formatResult(backConvexWidth, 4);
    }
    staves.push(stave);
  }

  // Generate points for front and back arcs
  const frontPoints: Point[] = [];
  const backPoints: Point[] = [];
  const startAngle = -centralAngleRad / 2;
  const frontMinCos = Math.cos(centralAngleRad / 2);
  const backMinCos = frontMinCos; // Same angle
  const frontMaxY = frontRadius * (1 - frontMinCos);
  const backMaxY = backRadius * (1 - backMinCos);

  for (let i = 0; i <= numberOfStaves; i++) {
    const angle = startAngle + (i * centralAngleRad / numberOfStaves);

    // Front arc
    const frontX = frontArcLength / 2 + frontRadius * Math.sin(angle);
    const frontY = frontMaxY - frontRadius * (Math.cos(angle) - frontMinCos);
    frontPoints.push({ x: frontX, y: frontY });

    // Back arc (scaled to show behind front arc)
    const backX = frontArcLength / 2 + backRadius * Math.sin(angle);
    const backY = backMaxY - backRadius * (Math.cos(angle) - backMinCos);
    backPoints.push({ x: backX, y: backY });
  }

  // Use front arc for main visualization
  const totalAngleChange = bladeTiltAngle * (numberOfStaves - 1);
  const averageStaveWidth = (frontConcaveWidth + backConcaveWidth) / 2;

  return {
    staves,
    totalAngleChange: formatResult(totalAngleChange),
    averageStaveWidth: formatResult(averageStaveWidth, 4),
    normalizedPoints: frontPoints,
    backNormalizedPoints: backPoints
  };
}
