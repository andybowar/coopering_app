/**
 * Input parameters for trigonometry calculations
 * User provides exactly 2 values (can be 2 sides, or 1 side + 1 angle)
 */
export interface TrigInputs {
  a?: number;  // Side opposite to angle A
  b?: number;  // Side opposite to angle B (adjacent to angle A)
  c?: number;  // Hypotenuse
  angleA?: number;  // Angle opposite to side a (in degrees)
  angleB?: number;  // Angle opposite to side b (in degrees)
}

/**
 * Complete triangle solution with all values calculated
 */
export interface TrigOutputs {
  a: number;
  b: number;
  c: number;
  angleA: number;  // In degrees
  angleB: number;  // In degrees
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
export interface TrigCalculationState {
  inputs: TrigInputs;
  outputs: TrigOutputs | null;
  isCalculated: boolean;
  errors: string[];
}
