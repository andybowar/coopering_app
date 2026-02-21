import type { TrigInputs, TrigOutputs } from '../types/trigonometry';

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
export function formatResult(value: number, decimals: number = 2): number {
  return Number(value.toFixed(decimals));
}

/**
 * Calculate all triangle parameters from 2 known values
 *
 * Handles all valid input combinations:
 * - Two sides: (a,b), (a,c), (b,c)
 * - One side + one angle: (a,A), (a,B), (b,A), (b,B), (c,A), (c,B)
 *
 * @param inputs - The triangle inputs (exactly 2 values should be provided)
 * @returns TrigOutputs with all calculated values
 */
export function calculateTriangle(inputs: TrigInputs): TrigOutputs {
  const { a, b, c, angleA, angleB } = inputs;

  // Count how many values are provided
  const providedCount = [a, b, c, angleA, angleB].filter(v => v !== undefined && v !== null && v !== 0).length;

  if (providedCount !== 2) {
    throw new Error('Exactly 2 values must be provided');
  }

  let resultA: number, resultB: number, resultC: number, resultAngleA: number, resultAngleB: number;

  // Two sides provided
  if (a !== undefined && a > 0 && b !== undefined && b > 0) {
    // Case: a, b known
    resultA = a;
    resultB = b;
    resultC = Math.sqrt(a * a + b * b);
    resultAngleA = toDegrees(Math.atan(a / b));
    resultAngleB = 90 - resultAngleA;
  } else if (a !== undefined && a > 0 && c !== undefined && c > 0) {
    // Case: a, c known
    if (a >= c) throw new Error('Hypotenuse must be longer than other sides');
    resultA = a;
    resultC = c;
    resultB = Math.sqrt(c * c - a * a);
    resultAngleA = toDegrees(Math.asin(a / c));
    resultAngleB = 90 - resultAngleA;
  } else if (b !== undefined && b > 0 && c !== undefined && c > 0) {
    // Case: b, c known
    if (b >= c) throw new Error('Hypotenuse must be longer than other sides');
    resultB = b;
    resultC = c;
    resultA = Math.sqrt(c * c - b * b);
    resultAngleB = toDegrees(Math.asin(b / c));
    resultAngleA = 90 - resultAngleB;
  }
  // One side + one angle provided
  else if (a !== undefined && a > 0 && angleA !== undefined && angleA > 0) {
    // Case: a, A known
    resultA = a;
    resultAngleA = angleA;
    resultAngleB = 90 - angleA;
    const angleARad = toRadians(angleA);
    resultB = a / Math.tan(angleARad);
    resultC = a / Math.sin(angleARad);
  } else if (a !== undefined && a > 0 && angleB !== undefined && angleB > 0) {
    // Case: a, B known
    resultA = a;
    resultAngleB = angleB;
    resultAngleA = 90 - angleB;
    const angleBRad = toRadians(angleB);
    resultB = a * Math.tan(angleBRad);
    resultC = a / Math.cos(angleBRad);
  } else if (b !== undefined && b > 0 && angleA !== undefined && angleA > 0) {
    // Case: b, A known
    resultB = b;
    resultAngleA = angleA;
    resultAngleB = 90 - angleA;
    const angleARad = toRadians(angleA);
    resultA = b * Math.tan(angleARad);
    resultC = b / Math.cos(angleARad);
  } else if (b !== undefined && b > 0 && angleB !== undefined && angleB > 0) {
    // Case: b, B known
    resultB = b;
    resultAngleB = angleB;
    resultAngleA = 90 - angleB;
    const angleBRad = toRadians(angleB);
    resultA = b / Math.tan(angleBRad);
    resultC = b / Math.sin(angleBRad);
  } else if (c !== undefined && c > 0 && angleA !== undefined && angleA > 0) {
    // Case: c, A known
    resultC = c;
    resultAngleA = angleA;
    resultAngleB = 90 - angleA;
    const angleARad = toRadians(angleA);
    resultA = c * Math.sin(angleARad);
    resultB = c * Math.cos(angleARad);
  } else if (c !== undefined && c > 0 && angleB !== undefined && angleB > 0) {
    // Case: c, B known
    resultC = c;
    resultAngleB = angleB;
    resultAngleA = 90 - angleB;
    const angleBRad = toRadians(angleB);
    resultB = c * Math.sin(angleBRad);
    resultA = c * Math.cos(angleBRad);
  } else {
    throw new Error('Invalid input combination. Provide 2 sides or 1 side + 1 angle');
  }

  return {
    a: formatResult(resultA),
    b: formatResult(resultB),
    c: formatResult(resultC),
    angleA: formatResult(resultAngleA),
    angleB: formatResult(resultAngleB)
  };
}
