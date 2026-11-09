import { reactive, computed } from 'vue';
import type { CurveCoopState, CurveCoopInputs, Point } from '../types/curveCoop';
import { calculateCurveCoop, calculateRadiusCoop, calculateTaperedCoop } from '../utils/curveCoopFormulas';
import { validateCurveCoopInputs } from '../utils/curveCoopValidation';

/**
 * Composable for managing curve coopering calculator state and logic
 */
export function useCurveCoopCalculator() {
  const state = reactive<CurveCoopState>({
    drawnPoints: [],
    smoothedCurve: [],
    inputs: {
      mode: 'radius',
      totalLength: undefined,
      totalHeight: undefined,
      radius: undefined,
      backRadius: undefined,
      depth: undefined,
      numberOfStaves: undefined,
      useTaper: false,
      staveThickness: undefined,
      taperResultMode: 'angle'
    },
    outputs: null,
    isCalculated: false,
    errors: [],
    anglePrecision: 2  // Default to 2 decimal places
  });

  /**
   * Computed property: check if results are available
   */
  const hasResults = computed(() => state.isCalculated && state.outputs !== null);

  /**
   * Computed property: check if there are validation errors
   */
  const hasErrors = computed(() => state.errors.length > 0);

  /**
   * Calculate stave angles for radius-based arcs
   */
  function calculate(): void {
    // Validate inputs
    const validation = validateCurveCoopInputs(state.inputs, state.drawnPoints);

    if (!validation.isValid) {
      state.errors = validation.errors;
      state.outputs = null;
      state.isCalculated = false;
      return;
    }

    // Clear errors
    state.errors = [];

    try {
      if (state.inputs.useTaper) {
        // Calculate for tapered arc (different front/back radii)
        state.outputs = calculateTaperedCoop(
          state.inputs.radius!,
          state.inputs.backRadius!,
          state.inputs.totalLength!,
          state.inputs.depth!,
          state.inputs.numberOfStaves!,
          state.anglePrecision,
          state.inputs.staveThickness || 0
        );
      } else {
        // Calculate for simple circular arc
        state.outputs = calculateRadiusCoop(
          state.inputs.radius!,
          state.inputs.totalLength!,
          state.inputs.numberOfStaves!,
          state.anglePrecision,
          state.inputs.staveThickness || 0
        );
      }
      state.isCalculated = true;
    } catch (error) {
      state.errors = ['Calculation error: ' + (error as Error).message];
      state.outputs = null;
      state.isCalculated = false;
    }
  }

  /**
   * Reset calculator state
   */
  function reset(): void {
    const currentMode = state.inputs.mode; // Preserve mode
    const currentUseTaper = state.inputs.useTaper; // Preserve taper setting
    const currentTaperResultMode = state.inputs.taperResultMode;
    state.inputs = {
      mode: currentMode,
      totalLength: undefined,
      totalHeight: undefined,
      radius: undefined,
      backRadius: undefined,
      depth: undefined,
      numberOfStaves: undefined,
      useTaper: currentUseTaper,
      staveThickness: undefined,
      taperResultMode: currentTaperResultMode
    };
    state.outputs = null;
    state.isCalculated = false;
    state.errors = [];
  }

  return {
    state,
    hasResults,
    hasErrors,
    calculate,
    reset
  };
}
