import type { EllipseInputs, EllipseOutputs, EllipseStaveInfo } from '../types/ellipse';

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Format a number to specified decimal places
 */
function formatResult(value: number, decimals: number = 1): number {
  return Number(value.toFixed(decimals));
}

/**
 * Calculate a point on the ellipse at parameter t
 */
function getEllipsePoint(a: number, b: number, t: number): { x: number; y: number } {
  return {
    x: a * Math.cos(t),
    y: b * Math.sin(t)
  };
}

/**
 * Calculate distance between two points
 */
function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the tangent angle at a point on the ellipse
 * Returns the angle of the tangent line in radians
 */
function getTangentAngle(a: number, b: number, t: number): number {
  // Derivative: dx/dt = -a*sin(t), dy/dt = b*cos(t)
  // Tangent angle = atan2(dy/dt, dx/dt)
  const dx = -a * Math.sin(t);
  const dy = b * Math.cos(t);
  return Math.atan2(dy, dx);
}

/**
 * Calculate blade tilt angle between two segments
 * This is half of the angle change between the tangent lines
 */
function calculateBladeTilt(tangentAngle1: number, tangentAngle2: number): number {
  let angleDiff = tangentAngle2 - tangentAngle1;

  // Normalize angle difference to [-π, π]
  while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
  while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

  // Blade tilt is half the angle change
  return Math.abs(angleDiff) / 2;
}

/**
 * Calculate ellipse coopering from number of staves
 */
export function calculateEllipseFromStaves(
  length: number,
  width: number,
  numberOfStaves: number,
  anglePrecision: number = 1,
  staveThickness: number = 0
): EllipseOutputs {
  if (length <= 0 || width <= 0 || numberOfStaves < 4) {
    throw new Error('Invalid inputs');
  }

  // Semi-major and semi-minor axes
  const a = length / 2;
  const b = width / 2;

  // Divide full ellipse (0 to 2π) into numberOfStaves segments
  const angleStep = (2 * Math.PI) / numberOfStaves;

  // Get all points on the ellipse
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= numberOfStaves; i++) {
    const t = (i * angleStep) % (2 * Math.PI);
    points.push(getEllipsePoint(a, b, t));
  }

  // Calculate blade tilt angles at all joints based on chord directions
  const jointBladeTilts: number[] = [];
  for (let i = 0; i <= numberOfStaves; i++) {
    // Get the three points around this joint
    const prevIdx = (i - 1 + numberOfStaves) % numberOfStaves;
    const currIdx = i % numberOfStaves;
    const nextIdx = (i + 1) % numberOfStaves;

    const p1 = points[prevIdx];
    const p2 = points[currIdx];
    const p3 = points[nextIdx];

    // Calculate chord directions (angles of the chords)
    const chord1Angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const chord2Angle = Math.atan2(p3.y - p2.y, p3.x - p2.x);

    // Blade tilt is half the angle between the two chords
    const bladeTiltRad = calculateBladeTilt(chord1Angle, chord2Angle);

    jointBladeTilts.push(toDegrees(bladeTiltRad));
  }

  // Now create staves with blade tilts at both ends
  const staves: EllipseStaveInfo[] = [];

  for (let i = 0; i < numberOfStaves; i++) {
    const t1 = i * angleStep;
    const t2 = (i + 1) * angleStep;

    // Get points on the ellipse
    const p1 = getEllipsePoint(a, b, t1);
    const p2 = getEllipsePoint(a, b, t2);

    // Calculate chord length (concave width)
    const concaveWidth = distance(p1.x, p1.y, p2.x, p2.y);

    // Calculate convex width if thickness is specified
    let convexWidth: number | undefined = undefined;
    if (staveThickness > 0) {
      // For ellipse with thickness, approximate by scaling both axes
      const scaleA = (a + staveThickness) / a;
      const scaleB = (b + staveThickness) / b;
      const outerA = a * scaleA;
      const outerB = b * scaleB;
      const outerP1 = getEllipsePoint(outerA, outerB, t1);
      const outerP2 = getEllipsePoint(outerA, outerB, t2);
      convexWidth = distance(outerP1.x, outerP1.y, outerP2.x, outerP2.y);
    }

    const stave: EllipseStaveInfo = {
      index: i + 1,
      startAngle: formatResult(toDegrees(t1), 2),
      endAngle: formatResult(toDegrees(t2), 2),
      startBladeTilt: formatResult(jointBladeTilts[i], anglePrecision),
      endBladeTilt: formatResult(jointBladeTilts[i + 1], anglePrecision),
      concaveWidth: formatResult(concaveWidth, 4)
    };

    if (convexWidth !== undefined) {
      stave.convexWidth = formatResult(convexWidth, 4);
    }

    staves.push(stave);
  }

  return {
    staves,
    totalStaves: numberOfStaves
  };
}

/**
 * Calculate ellipse coopering from desired stave width
 * Finds the number of staves that gives an average width closest to the desired width
 */
export function calculateEllipseFromWidth(
  length: number,
  width: number,
  desiredStaveWidth: number,
  anglePrecision: number = 1,
  staveThickness: number = 0
): EllipseOutputs {
  if (length <= 0 || width <= 0 || desiredStaveWidth <= 0) {
    throw new Error('Invalid inputs');
  }

  const a = length / 2;
  const b = width / 2;

  // Try different numbers of staves to find the best match
  let bestNumberOfStaves = 4;
  let smallestDifference = Infinity;

  // Search from 4 to a reasonable maximum (200 staves for full ellipse)
  for (let testStaves = 4; testStaves <= 200; testStaves++) {
    const angleStep = (2 * Math.PI) / testStaves;
    let totalChordLength = 0;

    // Calculate total chord length for this number of staves
    for (let i = 0; i < testStaves; i++) {
      const t1 = i * angleStep;
      const t2 = (i + 1) * angleStep;
      const p1 = getEllipsePoint(a, b, t1);
      const p2 = getEllipsePoint(a, b, t2);
      const chordLength = distance(p1.x, p1.y, p2.x, p2.y);
      totalChordLength += chordLength;
    }

    const averageWidth = totalChordLength / testStaves;
    const difference = Math.abs(averageWidth - desiredStaveWidth);

    if (difference < smallestDifference) {
      smallestDifference = difference;
      bestNumberOfStaves = testStaves;
    }

    // Early exit if we found an exact or very close match
    if (difference < 0.001) {
      break;
    }
  }

  // Use the best number of staves we found
  return calculateEllipseFromStaves(length, width, bestNumberOfStaves, anglePrecision, staveThickness);
}
