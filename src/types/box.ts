/**
 * Input parameters for box calculations
 */
export interface BoxInputs {
  numberOfSides: number;
  sideAngle: number;
  fromVertical: boolean;
}

/**
 * Calculated outputs for box construction
 */
export interface BoxOutputs {
  bladeTiltMitered: number;
  bladeTiltButted: number;
  miterAngle: number;
  miterComplement: number;
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
export interface BoxCalculationState {
  inputs: BoxInputs;
  outputs: BoxOutputs | null;
  isCalculated: boolean;
  errors: string[];
}

/**
 * Saved calculation for history
 */
export interface SavedBoxCalculation {
  id: string;
  name: string;
  timestamp: number;
  inputs: BoxInputs;
  outputs: BoxOutputs;
}
