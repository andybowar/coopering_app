import type { BoxInputs, BoxOutputs } from '../types/box';

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
 * Calculate all box construction parameters
 *
 * VERIFIED FORMULAS for N-sided box with slanted sides (100% accurate):
 * 1. Slope Conversion: slope = from_vertical ? (90 - side_angle) : side_angle
 * 2. Base Angle: base_angle = 180 / number_of_sides
 * 3. Miter Angle: atan(cos(slope) × tan(base_angle)) (convert to degrees)
 * 4. Blade Tilt (Mitered): asin(sin(base_angle) × sin(slope)) (convert to degrees)
 * 5. Blade Tilt (Butted): 2 × blade_tilt_mitered - 90
 * 6. Dihedral Angle: 180 - 2 × blade_tilt_mitered
 * 7. Miter Complement: 90 - miter_angle
 *
 * All angles use degrees for display. Convert to radians for trig functions.
 *
 * @param inputs - The box input parameters (N, side_angle, from_vertical)
 * @returns BoxOutputs with all calculated values
 */
export function calculateBox(inputs: BoxInputs): BoxOutputs {
  const { numberOfSides, sideAngle, fromVertical } = inputs;

  // 1. Slope Conversion: convert to angle from horizontal
  const slope = fromVertical ? (90 - sideAngle) : sideAngle;
  const slopeRadians = toRadians(slope);

  // 2. Base Angle: 180 / number_of_sides
  const baseAngle = 180 / numberOfSides;
  const baseAngleRadians = toRadians(baseAngle);

  // 3. Miter Angle: atan(cos(slope) × tan(base_angle))
  const miterAngleRadians = Math.atan(
    Math.cos(slopeRadians) * Math.tan(baseAngleRadians)
  );
  const miterAngle = toDegrees(miterAngleRadians);

  // 4. Blade Tilt (Mitered): asin(sin(base_angle) × sin(slope))
  const bladeTiltMiteredRadians = Math.asin(
    Math.sin(baseAngleRadians) * Math.sin(slopeRadians)
  );
  const bladeTiltMitered = toDegrees(bladeTiltMiteredRadians);

  // 5. Blade Tilt (Butted): 2 × blade_tilt_mitered - 90
  const bladeTiltButted = 2 * bladeTiltMitered - 90;

  // 6. Dihedral Angle: 180 - 2 × blade_tilt_mitered
  const dihedralAngle = 180 - 2 * bladeTiltMitered;

  // 7. Miter Complement: 90 - miter_angle
  const miterComplement = 90 - miterAngle;

  return {
    bladeTiltMitered: formatResult(bladeTiltMitered),
    bladeTiltButted: formatResult(bladeTiltButted),
    miterAngle: formatResult(miterAngle),
    miterComplement: formatResult(miterComplement),
    dihedralAngle: formatResult(dihedralAngle)
  };
}
