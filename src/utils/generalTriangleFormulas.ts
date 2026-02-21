import type { GeneralTriangleInputs, GeneralTriangleOutputs } from '../types/generalTriangle';

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
 * Calculate all triangle parameters using law of sines and law of cosines
 *
 * Handles:
 * - SSS (3 sides)
 * - SAS (2 sides + included angle)
 * - ASA (2 angles + included side)
 * - AAS (2 angles + any side)
 * - SSA (2 sides + non-included angle) - may have ambiguous case
 *
 * @param inputs - Triangle inputs (3 values required)
 * @returns GeneralTriangleOutputs with all calculated values
 */
export function calculateGeneralTriangle(inputs: GeneralTriangleInputs): GeneralTriangleOutputs {
  const { a, b, c, angleA, angleB, angleC } = inputs;

  let resultA: number, resultB: number, resultC: number;
  let resultAngleA: number, resultAngleB: number, resultAngleC: number;

  // Count sides and angles provided
  const sidesProvided = [a, b, c].filter(v => v !== undefined && v !== null && v > 0).length;
  const anglesProvided = [angleA, angleB, angleC].filter(v => v !== undefined && v !== null && v > 0).length;

  // SSS - Three sides
  if (sidesProvided === 3 && a! > 0 && b! > 0 && c! > 0) {
    resultA = a!;
    resultB = b!;
    resultC = c!;

    // Use law of cosines to find angles
    // cos(A) = (b² + c² - a²) / (2bc)
    const cosA = (b! * b! + c! * c! - a! * a!) / (2 * b! * c!);
    resultAngleA = toDegrees(Math.acos(cosA));

    // cos(B) = (a² + c² - b²) / (2ac)
    const cosB = (a! * a! + c! * c! - b! * b!) / (2 * a! * c!);
    resultAngleB = toDegrees(Math.acos(cosB));

    resultAngleC = 180 - resultAngleA - resultAngleB;
  }
  // SAS - Two sides and included angle
  else if (a !== undefined && a > 0 && b !== undefined && b > 0 && angleC !== undefined && angleC > 0) {
    resultA = a;
    resultB = b;
    resultAngleC = angleC;

    // Law of cosines: c² = a² + b² - 2ab·cos(C)
    const angleCRad = toRadians(angleC);
    resultC = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(angleCRad));

    // Law of sines to find other angles
    resultAngleA = toDegrees(Math.asin(a * Math.sin(angleCRad) / resultC));
    resultAngleB = 180 - resultAngleA - resultAngleC;
  }
  else if (b !== undefined && b > 0 && c !== undefined && c > 0 && angleA !== undefined && angleA > 0) {
    resultB = b;
    resultC = c;
    resultAngleA = angleA;

    // Law of cosines: a² = b² + c² - 2bc·cos(A)
    const angleARad = toRadians(angleA);
    resultA = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(angleARad));

    // Law of sines
    resultAngleB = toDegrees(Math.asin(b * Math.sin(angleARad) / resultA));
    resultAngleC = 180 - resultAngleA - resultAngleB;
  }
  else if (a !== undefined && a > 0 && c !== undefined && c > 0 && angleB !== undefined && angleB > 0) {
    resultA = a;
    resultC = c;
    resultAngleB = angleB;

    // Law of cosines: b² = a² + c² - 2ac·cos(B)
    const angleBRad = toRadians(angleB);
    resultB = Math.sqrt(a * a + c * c - 2 * a * c * Math.cos(angleBRad));

    // Law of sines
    resultAngleA = toDegrees(Math.asin(a * Math.sin(angleBRad) / resultB));
    resultAngleC = 180 - resultAngleA - resultAngleB;
  }
  // ASA or AAS - Two angles and a side
  else if (anglesProvided === 2) {
    // Calculate third angle
    if (angleA !== undefined && angleA > 0 && angleB !== undefined && angleB > 0) {
      resultAngleA = angleA;
      resultAngleB = angleB;
      resultAngleC = 180 - angleA - angleB;
    } else if (angleA !== undefined && angleA > 0 && angleC !== undefined && angleC > 0) {
      resultAngleA = angleA;
      resultAngleC = angleC;
      resultAngleB = 180 - angleA - angleC;
    } else {
      resultAngleB = angleB!;
      resultAngleC = angleC!;
      resultAngleA = 180 - angleB! - angleC!;
    }

    const angleARad = toRadians(resultAngleA);
    const angleBRad = toRadians(resultAngleB);
    const angleCRad = toRadians(resultAngleC);

    // Use law of sines with known side
    if (a !== undefined && a > 0) {
      resultA = a;
      resultB = a * Math.sin(angleBRad) / Math.sin(angleARad);
      resultC = a * Math.sin(angleCRad) / Math.sin(angleARad);
    } else if (b !== undefined && b > 0) {
      resultB = b;
      resultA = b * Math.sin(angleARad) / Math.sin(angleBRad);
      resultC = b * Math.sin(angleCRad) / Math.sin(angleBRad);
    } else {
      resultC = c!;
      resultA = c! * Math.sin(angleARad) / Math.sin(angleCRad);
      resultB = c! * Math.sin(angleBRad) / Math.sin(angleCRad);
    }
  }
  // SSA - Two sides and non-included angle (ambiguous case)
  else if (sidesProvided === 2 && anglesProvided === 1) {
    // Handle SSA cases
    if (a !== undefined && a > 0 && b !== undefined && b > 0 && angleA !== undefined && angleA > 0) {
      resultA = a;
      resultB = b;
      resultAngleA = angleA;

      const angleARad = toRadians(angleA);
      const sinB = b * Math.sin(angleARad) / a;

      if (sinB > 1) {
        throw new Error('No solution exists for these values');
      }

      resultAngleB = toDegrees(Math.asin(sinB));
      resultAngleC = 180 - resultAngleA - resultAngleB;
      const angleCRad = toRadians(resultAngleC);
      resultC = a * Math.sin(angleCRad) / Math.sin(angleARad);
    }
    else if (a !== undefined && a > 0 && b !== undefined && b > 0 && angleB !== undefined && angleB > 0) {
      resultA = a;
      resultB = b;
      resultAngleB = angleB;

      const angleBRad = toRadians(angleB);
      const sinA = a * Math.sin(angleBRad) / b;

      if (sinA > 1) {
        throw new Error('No solution exists for these values');
      }

      resultAngleA = toDegrees(Math.asin(sinA));
      resultAngleC = 180 - resultAngleA - resultAngleB;
      const angleCRad = toRadians(resultAngleC);
      resultC = b * Math.sin(angleCRad) / Math.sin(angleBRad);
    }
    else {
      throw new Error('Invalid SSA configuration');
    }
  }
  else {
    throw new Error('Invalid input combination. Provide 3 sides, 2 sides + 1 angle, or 2 angles + 1 side');
  }

  return {
    a: formatResult(resultA!),
    b: formatResult(resultB!),
    c: formatResult(resultC!),
    angleA: formatResult(resultAngleA!),
    angleB: formatResult(resultAngleB!),
    angleC: formatResult(resultAngleC!)
  };
}
