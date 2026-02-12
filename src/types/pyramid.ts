/**
 * Input parameters for pyramid calculations
 */
export interface PyramidInputs {
  numberOfSides: number;
  baseRadius: number;
  height: number;
}

/**
 * Calculated outputs for pyramid construction
 */
export interface PyramidOutputs {
  baseSideLength: number;
  miterAngle: number;
  miterComplement: number;
  sideSlope: number;
  bladeTiltMitered: number;
  bladeTiltButted: number;
  dihedralAngle: number;
}

/**
 * Validation result with errors
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Complete calculation state
 */
export interface CalculationState {
  inputs: PyramidInputs;
  outputs: PyramidOutputs | null;
  isCalculated: boolean;
  errors: string[];
}
