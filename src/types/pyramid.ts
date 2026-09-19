import type { AngleInputMode } from './angleInput';

/**
 * Input parameters for pyramid calculations
 *
 * miterResultMode selects whether the miter angle is reported as a degree
 * measurement or as a rise/run layout offset marked directly on the stock.
 * It and boardLength are optional so calculations saved before rise/run mode
 * existed still load correctly.
 */
export interface PyramidInputs {
  numberOfSides: number;
  baseRadius: number;
  height: number;
  miterResultMode?: AngleInputMode;
  boardLength?: number;
}

/**
 * Calculated outputs for pyramid construction
 *
 * miterRun/miterRise are only populated in rise/run mode.
 */
export interface PyramidOutputs {
  baseSideLength: number;
  miterAngle: number;
  miterComplement: number;
  sideSlope: number;
  bladeTiltMitered: number;
  bladeTiltButted: number;
  dihedralAngle: number;
  miterRun?: number | null;
  miterRise?: number | null;
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

/**
 * Saved calculation for history
 */
export interface SavedCalculation {
  id: string;
  name: string;
  timestamp: number;
  inputs: PyramidInputs;
  outputs: PyramidOutputs;
}
