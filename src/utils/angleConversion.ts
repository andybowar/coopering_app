/**
 * Convert rise/run values to an angle in degrees
 * @param rise - The rise value (vertical distance)
 * @param run - The run value (horizontal distance)
 * @param fromVertical - Whether the angle is measured from vertical (true) or horizontal (false)
 * @returns Angle in degrees, or undefined if inputs are invalid
 */
export function riseRunToAngle(
  rise: number | undefined,
  run: number | undefined,
  fromVertical: boolean = false
): number | undefined {
  if (rise === undefined || run === undefined || run === 0) {
    return undefined;
  }
  const angleRadians = Math.atan(rise / run);
  const angleDegrees = (angleRadians * 180) / Math.PI;

  // Adjust if measuring from vertical
  return fromVertical ? 90 - angleDegrees : angleDegrees;
}

/**
 * Convert an angle in degrees to rise/run values
 * @param angleDegrees - The angle in degrees
 * @param fromVertical - Whether the angle is measured from vertical (true) or horizontal (false)
 * @param run - The run to measure the rise over (defaults to 12, the standard carpentry value)
 * @returns Rise and run values, or undefined if the angle or run is invalid
 */
export function angleToRiseRun(
  angleDegrees: number | undefined,
  fromVertical: boolean = false,
  run: number = 12
): { rise: number; run: number } | undefined {
  if (angleDegrees === undefined) return undefined;
  if (isNaN(run) || run <= 0) return undefined;

  // Adjust if measuring from vertical
  const adjustedAngle = fromVertical ? 90 - angleDegrees : angleDegrees;
  const angleRadians = (adjustedAngle * Math.PI) / 180;

  const rise = Math.tan(angleRadians) * run;
  return { rise: Number(rise.toFixed(3)), run };
}

/**
 * Validate rise/run values
 * @param rise - The rise value
 * @param run - The run value
 * @returns Error message string if invalid, true if valid
 */
export function validateRiseRun(
  rise: number | undefined,
  run: number | undefined
): string | true {
  if (rise !== undefined && rise < 0) return 'Rise must be ≥ 0';
  if (run !== undefined && run <= 0) return 'Run must be > 0';
  return true;
}
