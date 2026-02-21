import type { GeneralTriangleInputs, ValidationResult } from '../types/generalTriangle';

/**
 * Validate general triangle input parameters
 *
 * Rules:
 * - Exactly 3 values must be provided
 * - All sides must be > 0
 * - All angles must be > 0 and < 180
 * - Sum of angles (if 2+ provided) must be < 180
 * - Triangle inequality: sum of any two sides > third side
 *
 * @param inputs - Triangle inputs to validate
 * @returns ValidationResult with isValid flag and error messages
 */
export function validateGeneralTriangleInputs(inputs: GeneralTriangleInputs): ValidationResult {
  const errors: string[] = [];
  const { a, b, c, angleA, angleB, angleC } = inputs;

  // Collect non-zero values
  const providedValues = [
    a !== undefined && a !== null && a !== 0,
    b !== undefined && b !== null && b !== 0,
    c !== undefined && c !== null && c !== 0,
    angleA !== undefined && angleA !== null && angleA !== 0,
    angleB !== undefined && angleB !== null && angleB !== 0,
    angleC !== undefined && angleC !== null && angleC !== 0
  ].filter(Boolean).length;

  // Must have exactly 3 values
  if (providedValues === 0) {
    errors.push('Please enter 3 values to solve the triangle');
    return { isValid: false, errors };
  } else if (providedValues < 3) {
    errors.push(`Please enter ${3 - providedValues} more value(s) to solve the triangle`);
    return { isValid: false, errors };
  } else if (providedValues > 3) {
    errors.push('Please enter only 3 values. Clear extra fields before calculating.');
    return { isValid: false, errors };
  }

  // Validate individual sides
  [
    { value: a, name: 'Side a' },
    { value: b, name: 'Side b' },
    { value: c, name: 'Side c' }
  ].forEach(({ value, name }) => {
    if (value !== undefined && value !== null && value !== 0) {
      if (isNaN(value)) {
        errors.push(`${name} must be a valid number`);
      } else if (value <= 0) {
        errors.push(`${name} must be greater than 0`);
      } else if (value >= 10000) {
        errors.push(`${name} must be less than 10000`);
      }
    }
  });

  // Validate individual angles
  [
    { value: angleA, name: 'Angle A' },
    { value: angleB, name: 'Angle B' },
    { value: angleC, name: 'Angle C' }
  ].forEach(({ value, name }) => {
    if (value !== undefined && value !== null && value !== 0) {
      if (isNaN(value)) {
        errors.push(`${name} must be a valid number`);
      } else if (value <= 0) {
        errors.push(`${name} must be greater than 0°`);
      } else if (value >= 180) {
        errors.push(`${name} must be less than 180°`);
      }
    }
  });

  // Check angle sum if multiple angles provided
  const angles = [angleA, angleB, angleC].filter(a => a !== undefined && a !== null && a > 0);
  if (angles.length >= 2) {
    const angleSum = angles.reduce((sum, angle) => sum + angle, 0);
    if (angleSum >= 180) {
      errors.push('Sum of angles must be less than 180°');
    }
  }

  // Check triangle inequality if all sides provided
  if (a !== undefined && a > 0 && b !== undefined && b > 0 && c !== undefined && c > 0) {
    if (a + b <= c || a + c <= b || b + c <= a) {
      errors.push('Triangle inequality violated: sum of any two sides must be greater than the third side');
    }
  }

  // Check we have valid combination (not 3 angles)
  const sidesProvided = [a, b, c].filter(v => v !== undefined && v !== null && v > 0).length;
  const anglesProvided = [angleA, angleB, angleC].filter(v => v !== undefined && v !== null && v > 0).length;

  if (sidesProvided === 0) {
    errors.push('At least one side length is required (angles alone cannot determine triangle size)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
