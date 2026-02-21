import type { TrigInputs, ValidationResult } from '../types/trigonometry';

/**
 * Validate trigonometry input parameters
 *
 * Rules:
 * - Exactly 2 values must be provided (non-zero)
 * - All sides must be > 0
 * - All angles must be > 0 and < 90
 * - If hypotenuse is provided with another side, it must be longer
 *
 * @param inputs - The triangle inputs to validate
 * @returns ValidationResult with isValid flag and error messages
 */
export function validateTrigInputs(inputs: TrigInputs): ValidationResult {
  const errors: string[] = [];
  const { a, b, c, angleA, angleB } = inputs;

  // Collect non-zero values
  const providedValues = [
    a !== undefined && a !== null && a !== 0,
    b !== undefined && b !== null && b !== 0,
    c !== undefined && c !== null && c !== 0,
    angleA !== undefined && angleA !== null && angleA !== 0,
    angleB !== undefined && angleB !== null && angleB !== 0
  ].filter(Boolean).length;

  // Must have exactly 2 values
  if (providedValues === 0) {
    errors.push('Please enter 2 values (2 sides, or 1 side + 1 angle)');
    return { isValid: false, errors };
  } else if (providedValues === 1) {
    errors.push('Please enter 1 more value to solve the triangle');
    return { isValid: false, errors };
  } else if (providedValues > 2) {
    errors.push('Please enter only 2 values. Clear extra fields before calculating.');
    return { isValid: false, errors };
  }

  // Validate side a
  if (a !== undefined && a !== null && a !== 0) {
    if (isNaN(a)) {
      errors.push('Side a must be a valid number');
    } else if (a <= 0) {
      errors.push('Side a must be greater than 0');
    } else if (a >= 10000) {
      errors.push('Side a must be less than 10000');
    }
  }

  // Validate side b
  if (b !== undefined && b !== null && b !== 0) {
    if (isNaN(b)) {
      errors.push('Side b must be a valid number');
    } else if (b <= 0) {
      errors.push('Side b must be greater than 0');
    } else if (b >= 10000) {
      errors.push('Side b must be less than 10000');
    }
  }

  // Validate side c (hypotenuse)
  if (c !== undefined && c !== null && c !== 0) {
    if (isNaN(c)) {
      errors.push('Side c must be a valid number');
    } else if (c <= 0) {
      errors.push('Side c must be greater than 0');
    } else if (c >= 10000) {
      errors.push('Side c must be less than 10000');
    }

    // Check hypotenuse is longest
    if (a !== undefined && a !== null && a !== 0 && a >= c) {
      errors.push('Hypotenuse (c) must be longer than side a');
    }
    if (b !== undefined && b !== null && b !== 0 && b >= c) {
      errors.push('Hypotenuse (c) must be longer than side b');
    }
  }

  // Validate angle A
  if (angleA !== undefined && angleA !== null && angleA !== 0) {
    if (isNaN(angleA)) {
      errors.push('Angle A must be a valid number');
    } else if (angleA <= 0) {
      errors.push('Angle A must be greater than 0°');
    } else if (angleA >= 90) {
      errors.push('Angle A must be less than 90°');
    }
  }

  // Validate angle B
  if (angleB !== undefined && angleB !== null && angleB !== 0) {
    if (isNaN(angleB)) {
      errors.push('Angle B must be a valid number');
    } else if (angleB <= 0) {
      errors.push('Angle B must be greater than 0°');
    } else if (angleB >= 90) {
      errors.push('Angle B must be less than 90°');
    }
  }

  // Check that we don't have only angles (need at least one side)
  const hasSide = (a !== undefined && a !== null && a !== 0) ||
                  (b !== undefined && b !== null && b !== 0) ||
                  (c !== undefined && c !== null && c !== 0);

  if (!hasSide && providedValues === 2) {
    errors.push('At least one side length is required (angles alone cannot determine triangle size)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
