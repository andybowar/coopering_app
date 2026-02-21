/**
 * Input parameters for general triangle calculations
 * User provides 3 values (SSS, SAS, ASA, AAS, or SSA)
 */
export interface GeneralTriangleInputs {
  a?: number;  // Side opposite to angle A
  b?: number;  // Side opposite to angle B
  c?: number;  // Side opposite to angle C
  angleA?: number;  // Angle A (in degrees)
  angleB?: number;  // Angle B (in degrees)
  angleC?: number;  // Angle C (in degrees)
}

/**
 * Complete triangle solution
 */
export interface GeneralTriangleOutputs {
  a: number;
  b: number;
  c: number;
  angleA: number;
  angleB: number;
  angleC: number;
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
export interface GeneralTriangleState {
  inputs: GeneralTriangleInputs;
  outputs: GeneralTriangleOutputs | null;
  isCalculated: boolean;
  errors: string[];
}
