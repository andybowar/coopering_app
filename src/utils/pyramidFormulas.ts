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
 * Formulas for an N-sided pyramid:
 * - Base Side Length: 2 * R * sin(π / N)
 * - Miter Angle: 90° - (180° / N)
 * - Miter Complement: 180° / N
 * - Side Slope: atan(H / (R * cos(π / N))) * (180 / π)
 * - Blade Tilt (Mitered): asin(sin(sideSlope) * cos(π / N)) * (180 / π)
 * - Blade Tilt (Butted): atan(cos(π / N) * tan(sideSlope)) * (180 / π)
 * - Dihedral Angle: 180° - 2 * atan((R * cos(π / N)) / H) * (180 / π)
 *
 * @param inputs - The pyramid input parameters (N, R, H)
 * @returns PyramidOutputs with all calculated values
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

  // 2. Miter Angle: 90° - (180° / N)
  const miterAngle = 90 - (180 / N);

  // 3. Miter Complement: 180° / N
  const miterComplement = 180 / N;

  // 4. Side Slope: atan(H / apothem) in degrees
  const sideSlopeRadians = Math.atan(H / apothem);
  const sideSlope = toDegrees(sideSlopeRadians);

  // 5. Blade Tilt (Mitered): asin(sin(sideSlope) * cos(π / N)) in degrees
  const bladeTiltMiteredRadians = Math.asin(
    Math.sin(sideSlopeRadians) * Math.cos(Math.PI / N)
  );
  const bladeTiltMitered = toDegrees(bladeTiltMiteredRadians);

  // 6. Blade Tilt (Butted): atan(cos(π / N) * tan(sideSlope)) in degrees
  const bladeTiltButtedRadians = Math.atan(
    Math.cos(Math.PI / N) * Math.tan(sideSlopeRadians)
  );
  const bladeTiltButted = toDegrees(bladeTiltButtedRadians);

  // 7. Dihedral Angle: 180° - 2 * atan(apothem / H) in degrees
  const dihedralAngle = 180 - 2 * toDegrees(Math.atan(apothem / H));

  return {
    baseSideLength: formatResult(baseSideLength),
    miterAngle: formatResult(miterAngle),
    miterComplement: formatResult(miterComplement),
    sideSlope: formatResult(sideSlope),
    bladeTiltMitered: formatResult(bladeTiltMitered),
    bladeTiltButted: formatResult(bladeTiltButted),
    dihedralAngle: formatResult(dihedralAngle)
  };
}
