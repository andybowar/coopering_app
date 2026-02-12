import { reactive, computed } from 'vue';
import type { CalculationState, PyramidInputs } from '../types/pyramid';
import { calculatePyramid } from '../utils/pyramidFormulas';
import { validateInputs } from '../utils/validation';

/**
 * Composable for managing pyramid calculator state and logic
 *
 * Provides reactive state, calculation, and reset functions
 */
export function usePyramidCalculator() {
  // Default values: 6-sided pyramid, radius 10", height 8"
  const state = reactive<CalculationState>({
    inputs: {
      numberOfSides: 6,
      baseRadius: 10,
      height: 8
    },
    outputs: null,
    isCalculated: false,
    errors: []
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
   * Calculate pyramid outputs from current inputs
   * Validates inputs first, then performs calculation if valid
   */
  function calculate(): void {
    // Validate inputs
    const validation = validateInputs(state.inputs);

    if (!validation.isValid) {
      // Set errors and clear outputs
      state.errors = validation.errors;
      state.outputs = null;
      state.isCalculated = false;
      return;
    }

    // Clear errors
    state.errors = [];

    try {
      // Perform calculation
      state.outputs = calculatePyramid(state.inputs);
      state.isCalculated = true;
    } catch (error) {
      // Handle any calculation errors
      state.errors = ['Calculation error: ' + (error as Error).message];
      state.outputs = null;
      state.isCalculated = false;
    }
  }

  /**
   * Reset calculator state
   * Clears outputs and errors but keeps inputs
   */
  function reset(): void {
    state.outputs = null;
    state.isCalculated = false;
    state.errors = [];
  }

  /**
   * Update specific input value
   */
  function updateInput(field: keyof PyramidInputs, value: number): void {
    state.inputs[field] = value;
  }

  return {
    state,
    hasResults,
    hasErrors,
    calculate,
    reset,
    updateInput
  };
}
