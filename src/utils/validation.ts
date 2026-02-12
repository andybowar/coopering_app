import type { PyramidInputs, ValidationResult } from '../types/pyramid';

/**
 * Validate pyramid input parameters
 *
 * Rules:
 * - Number of sides: must be integer ≥ 3, ≤ 1000
 * - Base radius: must be > 0, < 10000
 * - Height: must be > 0, < 10000
 * - All values must be valid numbers (not NaN)
 *
 * @param inputs - The pyramid inputs to validate
 * @returns ValidationResult with isValid flag and error messages
 */
export function validateInputs(inputs: PyramidInputs): ValidationResult {
  const errors: string[] = [];
  const { numberOfSides, baseRadius, height } = inputs;

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

  // Base radius validation
  if (isNaN(baseRadius) || baseRadius === null || baseRadius === undefined) {
    errors.push('Base radius must be a valid number');
  } else if (baseRadius <= 0) {
    errors.push('Base radius must be greater than 0');
  } else if (baseRadius >= 10000) {
    errors.push('Base radius must be less than 10000');
  }

  // Height validation
  if (isNaN(height) || height === null || height === undefined) {
    errors.push('Height must be a valid number');
  } else if (height <= 0) {
    errors.push('Height must be greater than 0');
  } else if (height >= 10000) {
    errors.push('Height must be less than 10000');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
