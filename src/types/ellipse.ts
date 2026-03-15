/**
 * Ellipse coopering inputs
 */
export interface EllipseInputs {
  length: number;  // Major axis (horizontal) in inches
  width: number;   // Minor axis (vertical) in inches
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
