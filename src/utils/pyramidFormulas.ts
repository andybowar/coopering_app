import type { PyramidInputs, PyramidOutputs } from '../types/pyramid';

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
export function formatResult(value: number, decimals: number = 3): number {
  return Number(value.toFixed(decimals));
}

/**
 * Calculate all pyramid construction parameters
 *
 * CORRECTED FORMULAS for N-sided pyramid (reverse engineered from test cases):
 * - Base Side Length: 2 * R * sin(π / N)
 * - Side Slope: atan(H / apothem) * (180 / π)
 * - Blade Tilt (Mitered): asin(sin(sideSlope) * sin(π / N))
 * - Blade Tilt (Butted): 2 * bladeTiltMitered - 90°
 * - Dihedral Angle: 180° - 2 * bladeTiltMitered
 * - Miter Angle: asin(tan(bladeTiltMitered) / tan(sideSlope))
 * - Miter Complement: 90° - miterAngle
 *
 * Where apothem = R * cos(π / N)
 *
 * Table saw constraint: Blade tilt max = 45°
 *
 * @param inputs - The pyramid input parameters (N, R, H)
 * @returns PyramidOutputs with all calculated values and feasibility checks
 */
export function calculatePyramid(inputs: PyramidInputs): PyramidOutputs {
  const { numberOfSides, baseRadius, height } = inputs;
  const N = numberOfSides;
  const R = baseRadius;
  const H = height;

  // Calculate apothem (distance from center to middle of side)
  const apothem = R * Math.cos(Math.PI / N);

  // 1. Base Side Length: 2 * R * sin(π / N)
  const baseSideLength = 2 * R * Math.sin(Math.PI / N);

  // 2. Side Slope: atan(H / apothem) in degrees
  const sideSlopeRadians = Math.atan(H / apothem);
  const sideSlope = toDegrees(sideSlopeRadians);

  // 3. Blade Tilt (Mitered): asin(sin(sideSlope) * sin(π / N))
  const bladeTiltMiteredRadians = Math.asin(
    Math.sin(sideSlopeRadians) * Math.sin(Math.PI / N)
  );
  const bladeTiltMitered = toDegrees(bladeTiltMiteredRadians);

  // 4. Blade Tilt (Butted): 2 * bladeTiltMitered - 90°
  const bladeTiltButted = 2 * bladeTiltMitered - 90;

  // 5. Dihedral Angle: 180° - 2 * bladeTiltMitered
  const dihedralAngle = 180 - 2 * bladeTiltMitered;

  // 6. Miter Angle: asin(tan(bladeTiltMitered) / tan(sideSlope))
  // Universal formula that works for both steep and shallow pyramids
  const miterAngle = toDegrees(
    Math.asin(Math.tan(bladeTiltMiteredRadians) / Math.tan(sideSlopeRadians))
  );

  // 7. Miter Complement: 90° - miterAngle
  const miterComplement = 90 - miterAngle;

  // 8. Table saw feasibility checks (45° max blade tilt)
  const MAX_BLADE_TILT = 45;
  const isMiteredFeasible = bladeTiltMitered <= MAX_BLADE_TILT && bladeTiltMitered >= -MAX_BLADE_TILT;
  const isButtedFeasible = bladeTiltButted <= MAX_BLADE_TILT && bladeTiltButted >= -MAX_BLADE_TILT;

  // 9. Calculate maximum height for 45° limit
  // Since bladeTiltMitered = asin(sin(sideSlope) * sin(π/N))
  // When bladeTilt = 45°: sin(45°) = sin(sideSlope) * sin(π/N)
  // sin(sideSlope) = sin(45°) / sin(π/N)
  const sinSideSlopeMax = Math.sin(toRadians(45)) / Math.sin(Math.PI / N);
  let maxHeightFor45Deg: number;

  if (sinSideSlopeMax > 1) {
    // Not possible to reach 45° with this geometry
    maxHeightFor45Deg = 999999;
  } else {
    const sideSlopeMaxRad = Math.asin(sinSideSlopeMax);
    maxHeightFor45Deg = apothem * Math.tan(sideSlopeMaxRad);
  }

  // 10. Generate warnings
  const warnings: string[] = [];

  if (!isMiteredFeasible) {
    if (bladeTiltMitered > MAX_BLADE_TILT) {
      warnings.push(
        `Mitered blade tilt (${formatResult(bladeTiltMitered)}°) exceeds 45° table saw limit. ` +
        `Reduce height to ${formatResult(maxHeightFor45Deg)}" or less.`
      );
    } else {
      warnings.push(
        `Mitered blade tilt (${formatResult(bladeTiltMitered)}°) is negative. ` +
        `Check pyramid dimensions.`
      );
    }
  }

  if (!isButtedFeasible) {
    if (Math.abs(bladeTiltButted) > MAX_BLADE_TILT) {
      warnings.push(
        `Butted blade tilt (${formatResult(bladeTiltButted)}°) exceeds ±45° table saw limit. ` +
        `Adjust pyramid dimensions or use mitered joints.`
      );
    }
  }

  return {
    baseSideLength: formatResult(baseSideLength),
    miterAngle: formatResult(miterAngle),
    miterComplement: formatResult(miterComplement),
    sideSlope: formatResult(sideSlope),
    bladeTiltMitered: formatResult(bladeTiltMitered),
    bladeTiltButted: formatResult(bladeTiltButted),
    dihedralAngle: formatResult(dihedralAngle),
    isMiteredFeasible,
    isButtedFeasible,
    maxHeightFor45Deg: formatResult(maxHeightFor45Deg),
    warnings
  };
}
