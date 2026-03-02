/**
 * Ellipse coopering inputs
 */
export interface EllipseInputs {
  length: number;  // Major axis (horizontal) in inches
  width: number;   // Minor axis (vertical) in inches
  numberOfStaves?: number;  // Number of staves in one quarter
  staveWidth?: number;  // Desired average stave width (alternative to numberOfStaves)
  staveThickness?: number;  // Thickness of stave material in inches
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
  concaveWidth: number;  // Chord length (concave/inner width)
  convexWidth?: number;  // Chord length on outer surface (when thickness specified)
}

/**
 * Complete ellipse coopering results
 */
export interface EllipseOutputs {
  staves: EllipseStaveInfo[];
  totalStaves: number;  // Total number of staves calculated
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
