import type { EllipseInputs, EllipseOutputs, EllipseStaveInfo } from '../types/ellipse';

/**
 * Fewest staves a closed cross-section can be built from.
 *
 * A triangle is a legitimate (if unusual) coopering job, and the sampling math
 * below handles it exactly, so the floor is 3 rather than 4.
 */
export const MIN_STAVES = 3;

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
  if (length <= 0 || width <= 0 || numberOfStaves < MIN_STAVES) {
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
  let bestNumberOfStaves = MIN_STAVES;
  let smallestDifference = Infinity;

  // Search from MIN_STAVES to a reasonable maximum (200 staves for full ellipse)
  for (let testStaves = MIN_STAVES; testStaves <= 200; testStaves++) {
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

/**
 * Calculate circle (cylinder) coopering from a known diameter.
 *
 * A circle is an ellipse with equal axes, so this mirrors the diameter into
 * both axes and reuses the ellipse solver. Every stave comes out identical.
 */
export function calculateCircleFromDiameter(
  diameter: number,
  numberOfStaves: number,
  anglePrecision: number = 1,
  staveThickness: number = 0
): EllipseOutputs {
  if (diameter <= 0 || numberOfStaves < MIN_STAVES) {
    throw new Error('Invalid inputs');
  }

  const results = calculateEllipseFromStaves(
    diameter,
    diameter,
    numberOfStaves,
    anglePrecision,
    staveThickness
  );

  return { ...results, diameter: formatResult(diameter, 4) };
}

/**
 * Calculate circle (cylinder) coopering from a known stave width.
 *
 * Solves for the diameter that a given number of staves of a given width will
 * close into, then reuses the ellipse solver for the rest.
 *
 * Staves are chords of the circle, so for N staves of width w:
 *   w = D * sin(pi/N)  =>  D = w / sin(pi/N)
 *
 * Note this is a different question from the ellipse's from-stave-width mode,
 * which holds the dimensions fixed and solves for the stave count instead.
 */
export function calculateCircleFromStaveWidth(
  staveWidth: number,
  numberOfStaves: number,
  anglePrecision: number = 1,
  staveThickness: number = 0
): EllipseOutputs {
  if (staveWidth <= 0 || numberOfStaves < MIN_STAVES) {
    throw new Error('Invalid inputs');
  }

  const diameter = staveWidth / Math.sin(Math.PI / numberOfStaves);

  const results = calculateEllipseFromStaves(
    diameter,
    diameter,
    numberOfStaves,
    anglePrecision,
    staveThickness
  );

  return { ...results, diameter: formatResult(diameter, 4) };
}

/**
 * Calculate conical circle coopering: a cone or truncated cone (frustum).
 *
 * Both ends are circles of different diameters, so every stave is an identical
 * symmetric trapezoid. Mirrors each diameter into both axes and reuses the
 * conical ellipse solver.
 *
 * Declared after calculateConicalEllipseFromStaves is defined at module scope;
 * function declarations hoist, so the ordering here is only for readability.
 */
export function calculateConicalCircleFromDiameters(
  frontDiameter: number,
  backDiameter: number,
  depth: number,
  numberOfStaves: number,
  anglePrecision: number = 1,
  staveThickness: number = 0
): EllipseOutputs {
  if (frontDiameter <= 0 || backDiameter <= 0 || depth <= 0 || numberOfStaves < MIN_STAVES) {
    throw new Error('Invalid inputs');
  }

  const results = calculateConicalEllipseFromStaves(
    frontDiameter,
    frontDiameter,
    backDiameter,
    backDiameter,
    depth,
    numberOfStaves,
    anglePrecision,
    staveThickness
  );

  return { ...results, diameter: formatResult(frontDiameter, 4) };
}

/**
 * Calculate conical ellipse coopering from number of staves
 */
export function calculateConicalEllipseFromStaves(
  frontLength: number,
  frontWidth: number,
  backLength: number,
  backWidth: number,
  depth: number,
  numberOfStaves: number,
  anglePrecision: number = 1,
  staveThickness: number = 0
): EllipseOutputs {
  if (frontLength <= 0 || frontWidth <= 0 || backLength <= 0 || backWidth <= 0 || depth <= 0 || numberOfStaves < MIN_STAVES) {
    throw new Error('Invalid inputs');
  }

  // Calculate front ellipse staves
  const frontResults = calculateEllipseFromStaves(frontLength, frontWidth, numberOfStaves, anglePrecision, 0);
  // Calculate back ellipse staves
  const backResults = calculateEllipseFromStaves(backLength, backWidth, numberOfStaves, anglePrecision, 0);

  // Merge results to create conical staves
  const staves: EllipseStaveInfo[] = [];

  for (let i = 0; i < numberOfStaves; i++) {
    const frontStave = frontResults.staves[i];
    const backStave = backResults.staves[i];

    // Calculate taper angle (always positive, from narrow to wide).
    // The stave is a symmetric trapezoid, so the total width change is split
    // evenly between its two long edges: each edge moves widthDiff/2.
    const widthDiff = Math.abs(backStave.concaveWidth - frontStave.concaveWidth);
    const taperAngleRad = Math.atan(widthDiff / (2 * depth));
    const taperAngle = formatResult(toDegrees(taperAngleRad), anglePrecision);

    // Rise/run form of the same taper, for marking out instead of setting an
    // angle. Equal to depth * tan(taperAngle), but taken directly from the
    // width difference to avoid rounding through the angle.
    const taperRise = widthDiff / 2;

    const stave: EllipseStaveInfo = {
      index: i + 1,
      startAngle: frontStave.startAngle,
      endAngle: frontStave.endAngle,
      startBladeTilt: frontStave.startBladeTilt,
      endBladeTilt: frontStave.endBladeTilt,
      concaveWidth: frontStave.concaveWidth,
      sideBConcaveWidth: formatResult(backStave.concaveWidth, 4),
      length: formatResult(depth, 4),
      taperAngle: taperAngle,
      taperRise: formatResult(taperRise, 4),
      taperRun: formatResult(depth, 4)
    };

    // Add convex widths if thickness is specified
    if (staveThickness > 0) {
      // Calculate front convex width
      const frontA = frontLength / 2;
      const frontB = frontWidth / 2;
      const scaleAFront = (frontA + staveThickness) / frontA;
      const scaleBFront = (frontB + staveThickness) / frontB;
      const outerAFront = frontA * scaleAFront;
      const outerBFront = frontB * scaleBFront;

      const t1 = toRadians(frontStave.startAngle);
      const t2 = toRadians(frontStave.endAngle);
      const outerP1Front = getEllipsePoint(outerAFront, outerBFront, t1);
      const outerP2Front = getEllipsePoint(outerAFront, outerBFront, t2);
      stave.convexWidth = formatResult(distance(outerP1Front.x, outerP1Front.y, outerP2Front.x, outerP2Front.y), 4);

      // Calculate back convex width
      const backA = backLength / 2;
      const backB = backWidth / 2;
      const scaleABack = (backA + staveThickness) / backA;
      const scaleBBack = (backB + staveThickness) / backB;
      const outerABack = backA * scaleABack;
      const outerBBack = backB * scaleBBack;

      const outerP1Back = getEllipsePoint(outerABack, outerBBack, t1);
      const outerP2Back = getEllipsePoint(outerABack, outerBBack, t2);
      stave.sideBConvexWidth = formatResult(distance(outerP1Back.x, outerP1Back.y, outerP2Back.x, outerP2Back.y), 4);
    }

    staves.push(stave);
  }

  return {
    staves,
    totalStaves: numberOfStaves
  };
}

/**
 * Calculate conical ellipse coopering from desired stave width
 */
export function calculateConicalEllipseFromWidth(
  frontLength: number,
  frontWidth: number,
  backLength: number,
  backWidth: number,
  depth: number,
  desiredStaveWidth: number,
  anglePrecision: number = 1,
  staveThickness: number = 0
): EllipseOutputs {
  // Use the average of front and back ellipses to determine stave count
  const avgLength = (frontLength + backLength) / 2;
  const avgWidth = (frontWidth + backWidth) / 2;

  // Find best number of staves using average dimensions
  const tempResults = calculateEllipseFromWidth(avgLength, avgWidth, desiredStaveWidth, anglePrecision, 0);
  const numberOfStaves = tempResults.totalStaves;

  // Calculate conical with that number of staves
  return calculateConicalEllipseFromStaves(
    frontLength, frontWidth, backLength, backWidth, depth,
    numberOfStaves, anglePrecision, staveThickness
  );
}
