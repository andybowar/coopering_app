import { reactive, computed } from 'vue';
import type { BoxCalculationState, BoxInputs } from '../types/box';
import { calculateBox } from '../utils/boxFormulas';
import { validateBoxInputs } from '../utils/boxValidation';

/**
 * Composable for managing box calculator state and logic
 *
 * Provides reactive state, calculation, and reset functions
 */
export function useBoxCalculator() {
  // Default values: 6-sided box, 20° from vertical
  const state = reactive<BoxCalculationState>({
    inputs: {
      numberOfSides: 6,
      sideAngle: 20,
      fromVertical: true
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
   * Calculate box outputs from current inputs
   * Validates inputs first, then performs calculation if valid
   */
  function calculate(): void {
    // Validate inputs
    const validation = validateBoxInputs(state.inputs);

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
      state.outputs = calculateBox(state.inputs);
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
  function updateInput(field: keyof BoxInputs, value: number | boolean): void {
    (state.inputs as any)[field] = value;
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
