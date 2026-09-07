import type { CurveCoopInputs, Point, ValidationResult } from '../types/curveCoop';

/**
 * Validate curve coopering inputs
 */
export function validateCurveCoopInputs(
  inputs: CurveCoopInputs,
  drawnPoints: Point[]
): ValidationResult {
  const errors: string[] = [];
  const { mode, totalLength, radius, backRadius, depth, numberOfStaves, useTaper, cylinderCalcMode, diameter, staveWidth } = inputs;

  if (mode === 'cylinder') {
    // Cylinder mode validation
    // Validate number of staves (required, minimum 3 for cylinders)
    if (!numberOfStaves || numberOfStaves === 0) {
      errors.push('Please enter the number of staves');
    } else if (isNaN(numberOfStaves)) {
      errors.push('Number of staves must be a valid number');
    } else if (!Number.isInteger(numberOfStaves)) {
      errors.push('Number of staves must be a whole number');
    } else if (numberOfStaves < 3) {
      errors.push('Number of staves must be at least 3 for cylinders');
    } else if (numberOfStaves > 1000) {
      errors.push('Number of staves must be 1000 or less');
    }

    // Validate diameter or stave width based on calc mode
    if (cylinderCalcMode === 'fromDiameter') {
      if (!diameter || diameter === 0) {
        errors.push('Please enter the diameter');
      } else if (isNaN(diameter)) {
        errors.push('Diameter must be a valid number');
      } else if (diameter <= 0) {
        errors.push('Diameter must be greater than 0');
      } else if (diameter > 10000) {
        errors.push('Diameter must be less than 10000');
      }
    } else if (cylinderCalcMode === 'fromStaveWidth') {
      if (!staveWidth || staveWidth === 0) {
        errors.push('Please enter the stave width');
      } else if (isNaN(staveWidth)) {
        errors.push('Stave width must be a valid number');
      } else if (staveWidth <= 0) {
        errors.push('Stave width must be greater than 0');
      } else if (staveWidth > 10000) {
        errors.push('Stave width must be less than 10000');
      }
    }
  } else {
    // Arc mode validation
    // Validate front radius (required)
    if (!radius || radius === 0) {
      errors.push('Please enter the radius');
    } else if (isNaN(radius)) {
      errors.push('Radius must be a valid number');
    } else if (radius <= 0) {
      errors.push('Radius must be greater than 0');
    } else if (radius > 10000) {
      errors.push('Radius must be less than 10000');
    }

    // Validate taper-specific fields
    if (useTaper) {
      // Validate back radius
      if (!backRadius || backRadius === 0) {
        errors.push('Please enter the back radius');
      } else if (isNaN(backRadius)) {
        errors.push('Back radius must be a valid number');
      } else if (backRadius <= 0) {
        errors.push('Back radius must be greater than 0');
      } else if (backRadius > 10000) {
        errors.push('Back radius must be less than 10000');
      }

      // Validate depth
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

    // Validate width (required)
    if (!totalLength || totalLength === 0) {
      errors.push('Please enter the width');
    } else if (isNaN(totalLength)) {
      errors.push('Width must be a valid number');
    } else if (totalLength <= 0) {
      errors.push('Width must be greater than 0');
    } else if (totalLength > 10000) {
      errors.push('Width must be less than 10000');
    } else if (radius && totalLength > 2 * radius) {
      errors.push('Width cannot be greater than the diameter (2 × radius)');
    }

    // Validate number of staves (required)
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
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
