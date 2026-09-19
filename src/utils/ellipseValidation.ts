import type { EllipseInputs, ValidationResult } from '../types/ellipse';
import { MIN_STAVES } from './ellipseFormulas';

/**
 * Validate the stave count against the range the solver actually supports.
 * Shared by ellipse and circle modes so validation cannot drift from the
 * formula's own guard.
 */
function validateStaveCount(numberOfStaves: number | undefined, errors: string[]): void {
  if (!numberOfStaves || numberOfStaves === 0) {
    errors.push('Please enter the number of staves');
  } else if (isNaN(numberOfStaves)) {
    errors.push('Number of staves must be a valid number');
  } else if (!Number.isInteger(numberOfStaves)) {
    errors.push('Number of staves must be a whole number');
  } else if (numberOfStaves < MIN_STAVES) {
    errors.push(`Number of staves must be at least ${MIN_STAVES}`);
  } else if (numberOfStaves > 1000) {
    errors.push('Number of staves must be 1000 or less');
  }
}

/**
 * Validate circle-mode inputs (single diameter, or stave width + count)
 */
function validateCircleInputs(inputs: EllipseInputs, errors: string[]): void {
  const { diameter, circleCalcMode, staveWidth, numberOfStaves, useConical, sideBDiameter, depth } = inputs;

  // The stave count is required either way in circle mode
  validateStaveCount(numberOfStaves, errors);

  // A cone needs both end diameters and the depth between them. The
  // stave-width solve is not offered here: on a frustum the stave width varies
  // along its length, so "the" stave width would be ambiguous.
  if (useConical) {
    if (!diameter || diameter === 0) {
      errors.push('Please enter the Side A diameter');
    } else if (isNaN(diameter)) {
      errors.push('Side A diameter must be a valid number');
    } else if (diameter <= 0) {
      errors.push('Side A diameter must be greater than 0');
    } else if (diameter > 10000) {
      errors.push('Side A diameter must be less than 10000');
    }

    if (!sideBDiameter || sideBDiameter === 0) {
      errors.push('Please enter the Side B diameter');
    } else if (isNaN(sideBDiameter)) {
      errors.push('Side B diameter must be a valid number');
    } else if (sideBDiameter <= 0) {
      errors.push('Side B diameter must be greater than 0');
    } else if (sideBDiameter > 10000) {
      errors.push('Side B diameter must be less than 10000');
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

    return;
  }

  if (circleCalcMode === 'fromStaveWidth') {
    if (!staveWidth || staveWidth === 0) {
      errors.push('Please enter the stave width');
    } else if (isNaN(staveWidth)) {
      errors.push('Stave width must be a valid number');
    } else if (staveWidth <= 0) {
      errors.push('Stave width must be greater than 0');
    } else if (staveWidth > 10000) {
      errors.push('Stave width must be less than 10000');
    }
  } else {
    if (!diameter || diameter === 0) {
      errors.push('Please enter the diameter');
    } else if (isNaN(diameter)) {
      errors.push('Diameter must be a valid number');
    } else if (diameter <= 0) {
      errors.push('Diameter must be greater than 0');
    } else if (diameter > 10000) {
      errors.push('Diameter must be less than 10000');
    }
  }
}

/**
 * Validate ellipse coopering inputs
 */
export function validateEllipseInputs(inputs: EllipseInputs, calculationMode: 'width' | 'count'): ValidationResult {
  const errors: string[] = [];
  const { length, width, numberOfStaves, staveWidth, useConical, sideBLength: backLength, sideBWidth: backWidth, depth } = inputs;

  // Circle mode has its own, much smaller input set
  if (inputs.shape === 'circle') {
    validateCircleInputs(inputs, errors);
    return { isValid: errors.length === 0, errors };
  }

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
    validateStaveCount(numberOfStaves, errors);
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
