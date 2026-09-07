import type { ArcRadiusInputs, ArcRadiusOutputs } from '../types/arcRadius';
import { formatResult } from './trigFormulas';

/**
 * Calculate the radius of an arc given sagitta and chord length
 *
 * Formula: radius = (sagitta/2) + (chord²/(8*sagitta))
 *
 * @param inputs - The sagitta and chord length
 * @returns The calculated radius and diameter
 */
export function calculateArcRadius(inputs: ArcRadiusInputs): ArcRadiusOutputs {
  const { sagitta, chordLength } = inputs;

  if (sagitta === undefined || chordLength === undefined) {
    throw new Error('Both sagitta and chord length are required');
  }

  if (sagitta <= 0) {
    throw new Error('Sagitta must be greater than 0');
  }

  if (chordLength <= 0) {
    throw new Error('Chord length must be greater than 0');
  }

  // Calculate radius using the formula: r = (h/2) + (c²/(8h))
  // where h = sagitta, c = chord length
  const radius = (sagitta / 2) + (Math.pow(chordLength, 2) / (8 * sagitta));
  const diameter = radius * 2;

  return {
    radius: formatResult(radius),
    diameter: formatResult(diameter)
  };
}

/**
 * Validate arc radius inputs
 *
 * @param inputs - The inputs to validate
 * @returns Validation result with errors array
 */
export function validateArcRadiusInputs(inputs: ArcRadiusInputs): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if both inputs are provided
  if (inputs.sagitta === undefined && inputs.chordLength === undefined) {
    errors.push('Please enter both sagitta and chord length');
    return { isValid: false, errors };
  }

  if (inputs.sagitta === undefined) {
    errors.push('Please enter the sagitta (arc height)');
  }

  if (inputs.chordLength === undefined) {
    errors.push('Please enter the chord length');
  }

  // Validate positive values
  if (inputs.sagitta !== undefined && inputs.sagitta <= 0) {
    errors.push('Sagitta must be greater than 0');
  }

  if (inputs.chordLength !== undefined && inputs.chordLength <= 0) {
    errors.push('Chord length must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
