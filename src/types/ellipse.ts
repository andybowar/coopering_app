import type { AngleInputMode } from './angleInput';

/**
 * Cross-section shape being coopered.
 *
 * A circle is just an ellipse with equal axes, but it gets its own mode so the
 * user enters one diameter instead of two identical axes, and so the
 * diameter-from-stave-width solve stays available (it is only meaningful when
 * every stave is the same width).
 */
export type CoopShape = 'ellipse' | 'circle';

/**
 * Which quantity the user knows in circle mode
 */
export type CircleCalcMode = 'fromDiameter' | 'fromStaveWidth';

/**
 * Ellipse coopering inputs
 */
export interface EllipseInputs {
  shape: CoopShape;  // Ellipse (two axes) or circle (single diameter)
  length: number;  // Major axis (horizontal) in inches
  width: number;   // Minor axis (vertical) in inches
  diameter?: number;  // Diameter in circle mode (mirrored into length/width)
  sideBDiameter?: number;  // Side B diameter for a conical circle (cone / frustum)
  circleCalcMode?: CircleCalcMode;  // Circle mode: known diameter or known stave width
  taperResultMode?: AngleInputMode;  // Report taper as an angle or a rise/run offset
  numberOfStaves?: number;  // Number of staves in one quarter
  staveWidth?: number;  // Desired average stave width (alternative to numberOfStaves)
  staveThickness?: number;  // Thickness of stave material in inches
  useConical: boolean;  // Whether to use conical mode with different top/bottom ellipses
  sideBLength?: number;  // Side B major axis (only when useConical is true)
  sideBWidth?: number;  // Side B minor axis (only when useConical is true)
  depth?: number;  // Height/depth from side A to side B in inches (only when useConical is true)
}

/**
 * Calculated stave information for ellipse
 */
export interface EllipseStaveInfo {
  index: number;  // Stave number (1-based)
  startAngle: number;  // Start angle in degrees (from horizontal)
  endAngle: number;  // End angle in degrees
  startBladeTilt: number;  // Blade tilt angle at start of stave
  endBladeTilt: number;  // Blade tilt angle at end of stave
  concaveWidth: number;  // Chord length (concave/inner width) at front
  convexWidth?: number;  // Chord length on outer surface (when thickness specified) at front
  sideBConcaveWidth?: number;  // Side B concave width for conical staves
  sideBConvexWidth?: number;  // Side B convex width for conical staves
  length?: number;  // Stave length (depth) for conical staves
  taperAngle?: number;  // Taper angle from perpendicular (for conical staves)
  taperRise?: number;  // Rise/run form of the taper: offset to measure in on ONE edge
  taperRun?: number;  // Rise/run form of the taper: the stave length it is measured over
}

/**
 * Complete ellipse coopering results
 */
export interface EllipseOutputs {
  staves: EllipseStaveInfo[];
  totalStaves: number;  // Total number of staves calculated
  diameter?: number;  // Circle mode only; derived when calculating from stave width
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
