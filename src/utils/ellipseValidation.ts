import type { EllipseInputs, ValidationResult } from '../types/ellipse';

/**
 * Validate ellipse coopering inputs
 */
export function validateEllipseInputs(inputs: EllipseInputs, calculationMode: 'width' | 'count'): ValidationResult {
  const errors: string[] = [];
  const { length, width, numberOfStaves, staveWidth } = inputs;

  // Validate length (major axis)
  if (!length || length === 0) {
    errors.push('Please enter the length (major axis)');
  } else if (isNaN(length)) {
    errors.push('Length must be a valid number');
  } else if (length <= 0) {
    errors.push('Length must be greater than 0');
  } else if (length > 10000) {
    errors.push('Length must be less than 10000');
  }

  // Validate width (minor axis)
  if (!width || width === 0) {
    errors.push('Please enter the width (minor axis)');
  } else if (isNaN(width)) {
    errors.push('Width must be a valid number');
  } else if (width <= 0) {
    errors.push('Width must be greater than 0');
  } else if (width > 10000) {
    errors.push('Width must be less than 10000');
  }

  // Validate based on calculation mode
  if (calculationMode === 'width') {
    // Calculating stave width, need number of staves
    if (!numberOfStaves || numberOfStaves === 0) {
      errors.push('Please enter the number of staves');
    } else if (isNaN(numberOfStaves)) {
      errors.push('Number of staves must be a valid number');
    } else if (!Number.isInteger(numberOfStaves)) {
      errors.push('Number of staves must be a whole number');
    } else if (numberOfStaves < 2) {
      errors.push('Number of staves must be at least 2');
    } else if (numberOfStaves > 1000) {
      errors.push('Number of staves must be 1000 or less');
    }
  } else {
    // Calculating number of staves, need stave width
    if (!staveWidth || staveWidth === 0) {
      errors.push('Please enter the desired stave width');
    } else if (isNaN(staveWidth)) {
      errors.push('Stave width must be a valid number');
    } else if (staveWidth <= 0) {
      errors.push('Stave width must be greater than 0');
    } else if (staveWidth > 10000) {
      errors.push('Stave width must be less than 10000');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
