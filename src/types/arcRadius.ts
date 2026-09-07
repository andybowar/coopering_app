/**
 * Types for Arc Radius Calculator
 *
 * Calculates the radius of an arc given the sagitta (height) and chord length
 */

export interface ArcRadiusInputs {
  sagitta: number | undefined; // Height from midpoint of chord to arc
  chordLength: number | undefined; // Length of the chord
}

export interface ArcRadiusOutputs {
  radius: number;
  diameter: number;
}

export interface ArcRadiusCalculationState {
  inputs: ArcRadiusInputs;
  outputs: ArcRadiusOutputs | null;
  isCalculated: boolean;
  errors: string[];
}
