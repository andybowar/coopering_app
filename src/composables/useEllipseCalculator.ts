import { reactive, computed } from 'vue';
import type { EllipseInputs, EllipseOutputs } from '../types/ellipse';
import { calculateEllipseFromStaves, calculateEllipseFromWidth } from '../utils/ellipseFormulas';
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
      length: undefined as any,
      width: undefined as any,
      numberOfStaves: undefined,
      staveWidth: undefined,
      staveThickness: undefined
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
      if (calculationMode === 'width') {
        // Calculate stave widths from number of staves
        state.outputs = calculateEllipseFromStaves(
          state.inputs.length,
          state.inputs.width,
          state.inputs.numberOfStaves!,
          state.anglePrecision,
          state.inputs.staveThickness || 0
        );
      } else {
        // Calculate number of staves from desired stave width
        state.outputs = calculateEllipseFromWidth(
          state.inputs.length,
          state.inputs.width,
          state.inputs.staveWidth!,
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
    state.inputs = {
      length: undefined as any,
      width: undefined as any,
      numberOfStaves: undefined,
      staveWidth: undefined,
      staveThickness: undefined
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
