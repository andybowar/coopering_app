import type { BoxInputs, ValidationResult } from '../types/box';

/**
 * Validate box input parameters
 *
 * Rules:
 * - Number of sides: must be integer ≥ 3, ≤ 1000
 * - Side angle: must be > 0, < 90
 * - From vertical: boolean (always valid)
 * - All values must be valid numbers (not NaN)
 *
 * @param inputs - The box inputs to validate
 * @returns ValidationResult with isValid flag and error messages
 */
export function validateBoxInputs(inputs: BoxInputs): ValidationResult {
  const errors: string[] = [];
  const { numberOfSides, sideAngle } = inputs;

  // Check for NaN values
  if (isNaN(numberOfSides) || numberOfSides === null || numberOfSides === undefined) {
    errors.push('Number of sides must be a valid number');
  } else {
    // Number of sides validation
    if (!Number.isInteger(numberOfSides)) {
      errors.push('Number of sides must be a whole number');
    } else if (numberOfSides < 3) {
      errors.push('Number of sides must be at least 3');
    } else if (numberOfSides > 1000) {
      errors.push('Number of sides must be 1000 or less');
    }
  }

  // Side angle validation
  if (isNaN(sideAngle) || sideAngle === null || sideAngle === undefined) {
    errors.push('Side angle must be a valid number');
  } else if (sideAngle <= 0) {
    errors.push('Side angle must be greater than 0');
  } else if (sideAngle >= 90) {
    errors.push('Side angle must be less than 90');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
