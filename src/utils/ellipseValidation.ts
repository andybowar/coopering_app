import type { EllipseInputs, ValidationResult } from '../types/ellipse';

/**
 * Validate ellipse coopering inputs
 */
export function validateEllipseInputs(inputs: EllipseInputs, calculationMode: 'width' | 'count'): ValidationResult {
  const errors: string[] = [];
  const { length, width, numberOfStaves, staveWidth, useConical, sideBLength: backLength, sideBWidth: backWidth, depth } = inputs;

  // Validate front length (major axis)
  if (!length || length === 0) {
    errors.push('Please enter the length (major axis)');
  } else if (isNaN(length)) {
    errors.push('Length must be a valid number');
  } else if (length <= 0) {
    errors.push('Length must be greater than 0');
  } else if (length > 10000) {
    errors.push('Length must be less than 10000');
  }

  // Validate front width (minor axis)
  if (!width || width === 0) {
    errors.push('Please enter the width (minor axis)');
  } else if (isNaN(width)) {
    errors.push('Width must be a valid number');
  } else if (width <= 0) {
    errors.push('Width must be greater than 0');
  } else if (width > 10000) {
    errors.push('Width must be less than 10000');
  }

  // Validate conical mode fields
  if (useConical) {
    if (!backLength || backLength === 0) {
      errors.push('Please enter the back length');
    } else if (isNaN(backLength)) {
      errors.push('Back length must be a valid number');
    } else if (backLength <= 0) {
      errors.push('Back length must be greater than 0');
    } else if (backLength > 10000) {
      errors.push('Back length must be less than 10000');
    }

    if (!backWidth || backWidth === 0) {
      errors.push('Please enter the back width');
    } else if (isNaN(backWidth)) {
      errors.push('Back width must be a valid number');
    } else if (backWidth <= 0) {
      errors.push('Back width must be greater than 0');
    } else if (backWidth > 10000) {
      errors.push('Back width must be less than 10000');
    }

    if (!depth || depth === 0) {
      errors.push('Please enter the depth');
    } else if (isNaN(depth)) {
      errors.push('Depth must be a valid number');
    } else if (depth <= 0) {
      errors.push('Depth must be greater than 0');
    } else if (depth > 10000) {
      errors.push('Depth must be less than 10000');
    }
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
