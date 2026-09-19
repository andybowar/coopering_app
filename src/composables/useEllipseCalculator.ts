import { reactive, computed } from 'vue';
import type { EllipseInputs, EllipseOutputs } from '../types/ellipse';
import {
  calculateEllipseFromStaves,
  calculateEllipseFromWidth,
  calculateConicalEllipseFromStaves,
  calculateConicalEllipseFromWidth,
  calculateCircleFromDiameter,
  calculateCircleFromStaveWidth,
  calculateConicalCircleFromDiameters
} from '../utils/ellipseFormulas';
import { validateEllipseInputs } from '../utils/ellipseValidation';

interface EllipseState {
  inputs: EllipseInputs;
  outputs: EllipseOutputs | null;
  isCalculated: boolean;
  errors: string[];
  anglePrecision: number;
}

/**
 * Composable for managing ellipse coopering calculator state and logic
 */
export function useEllipseCalculator() {
  const state = reactive<EllipseState>({
    inputs: {
      shape: 'ellipse',
      length: undefined as any,
      width: undefined as any,
      diameter: undefined,
      sideBDiameter: undefined,
      circleCalcMode: 'fromDiameter',
      taperResultMode: 'angle',
      numberOfStaves: undefined,
      staveWidth: undefined,
      staveThickness: undefined,
      useConical: false,
      sideBLength: undefined,
      sideBWidth: undefined,
      depth: undefined
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
   * Calculate ellipse coopering dimensions
   */
  function calculate(calculationMode: 'width' | 'count'): void {
    // Validate inputs
    const validation = validateEllipseInputs(state.inputs, calculationMode);

    if (!validation.isValid) {
      state.errors = validation.errors;
      state.outputs = null;
      state.isCalculated = false;
      return;
    }

    // Clear errors
    state.errors = [];

    try {
      if (state.inputs.shape === 'circle') {
        // Circle mode: one diameter, identical staves.
        if (state.inputs.useConical) {
          // Cone / truncated cone: two end diameters plus the depth between.
          state.outputs = calculateConicalCircleFromDiameters(
            state.inputs.diameter!,
            state.inputs.sideBDiameter!,
            state.inputs.depth!,
            state.inputs.numberOfStaves!,
            state.anglePrecision,
            state.inputs.staveThickness || 0
          );
          // Mirror both diameters into the axis fields the visualization reads.
          state.inputs.length = state.inputs.diameter!;
          state.inputs.width = state.inputs.diameter!;
          state.inputs.sideBLength = state.inputs.sideBDiameter!;
          state.inputs.sideBWidth = state.inputs.sideBDiameter!;
          state.isCalculated = true;
          return;
        }

        if (state.inputs.circleCalcMode === 'fromStaveWidth') {
          state.outputs = calculateCircleFromStaveWidth(
            state.inputs.staveWidth!,
            state.inputs.numberOfStaves!,
            state.anglePrecision,
            state.inputs.staveThickness || 0
          );
        } else {
          state.outputs = calculateCircleFromDiameter(
            state.inputs.diameter!,
            state.inputs.numberOfStaves!,
            state.anglePrecision,
            state.inputs.staveThickness || 0
          );
        }
        // Mirror the resolved diameter into the axes so the visualization and
        // copy output, which read length/width, work unchanged.
        state.inputs.length = state.outputs.diameter!;
        state.inputs.width = state.outputs.diameter!;
        state.isCalculated = true;
        return;
      }

      if (state.inputs.useConical) {
        // Conical ellipse calculations
        if (calculationMode === 'width') {
          state.outputs = calculateConicalEllipseFromStaves(
            state.inputs.length,
            state.inputs.width,
            state.inputs.sideBLength!,
            state.inputs.sideBWidth!,
            state.inputs.depth!,
            state.inputs.numberOfStaves!,
            state.anglePrecision,
            state.inputs.staveThickness || 0
          );
        } else {
          state.outputs = calculateConicalEllipseFromWidth(
            state.inputs.length,
            state.inputs.width,
            state.inputs.sideBLength!,
            state.inputs.sideBWidth!,
            state.inputs.depth!,
            state.inputs.staveWidth!,
            state.anglePrecision,
            state.inputs.staveThickness || 0
          );
        }
      } else {
        // Regular ellipse calculations
        if (calculationMode === 'width') {
          state.outputs = calculateEllipseFromStaves(
            state.inputs.length,
            state.inputs.width,
            state.inputs.numberOfStaves!,
            state.anglePrecision,
            state.inputs.staveThickness || 0
          );
        } else {
          state.outputs = calculateEllipseFromWidth(
            state.inputs.length,
            state.inputs.width,
            state.inputs.staveWidth!,
            state.anglePrecision,
            state.inputs.staveThickness || 0
          );
        }
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
    // Keep the shape and circle sub-mode so Reset clears the numbers without
    // yanking the user back to ellipse mode.
    const currentShape = state.inputs.shape;
    const currentCircleCalcMode = state.inputs.circleCalcMode;
    const currentTaperResultMode = state.inputs.taperResultMode;

    state.inputs = {
      shape: currentShape,
      length: undefined as any,
      width: undefined as any,
      diameter: undefined,
      sideBDiameter: undefined,
      circleCalcMode: currentCircleCalcMode,
      taperResultMode: currentTaperResultMode,
      numberOfStaves: undefined,
      staveWidth: undefined,
      staveThickness: undefined,
      useConical: false,
      sideBLength: undefined,
      sideBWidth: undefined,
      depth: undefined
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
