import type { AngleInputMode } from './angleInput';

/**
 * Point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Curve coopering inputs
 */
export interface CurveCoopInputs {
  mode: 'draw' | 'radius';  // Calculation mode
  totalLength?: number;  // Real-world length in inches (chord length for radius mode)
  totalHeight?: number;  // Real-world height in inches (only for draw mode)
  radius?: number;  // Front radius in inches (only for radius mode)
  backRadius?: number;  // Back radius in inches (optional, for tapered projects)
  depth?: number;  // Depth from front to back in inches (only when backRadius is used)
  numberOfStaves?: number;  // Number of segments
  useTaper: boolean;  // Whether to use tapered mode with different front/back radii
  staveThickness?: number;  // Thickness of stave material in inches
  taperResultMode?: AngleInputMode;  // Report taper as an angle or a rise/run offset
}

/**
 * Calculated stave information
 */
export interface StaveInfo {
  index: number;  // Stave number (1-based)
  bladeTiltAngle: number;  // Blade tilt angle in degrees (0° = perpendicular)
  width: number;  // Concave width (inner radius) of this stave segment
  convexWidth?: number;  // Convex width (outer radius) when stave thickness is specified
  backWidth?: number;  // Back width for tapered staves
  backConvexWidth?: number;  // Back convex width for tapered staves
  length?: number;  // Stave length (depth) for tapered staves
  taperAngle?: number;  // Taper angle from perpendicular (for tapered staves)
  taperRise?: number;  // Rise/run form of the taper: offset to measure in on ONE edge at the narrow end
  taperRun?: number;  // Rise/run form of the taper: the stave length it is measured over
}

/**
 * Complete curve coopering results
 */
export interface CurveCoopOutputs {
  staves: StaveInfo[];
  totalAngleChange: number;  // Total curve deviation
  averageStaveWidth: number;
  normalizedPoints: Point[];  // Points for visualization
  backNormalizedPoints?: Point[];  // Back curve points for tapered visualization
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Complete state
 */
export interface CurveCoopState {
  drawnPoints: Point[];
  smoothedCurve: Point[];
  inputs: CurveCoopInputs;
  outputs: CurveCoopOutputs | null;
  isCalculated: boolean;
  errors: string[];
  anglePrecision: number;  // Number of decimal places for angles (2 or 3)
}
