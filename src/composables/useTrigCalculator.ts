import { reactive, computed } from 'vue';
import type { TrigCalculationState, TrigInputs } from '../types/trigonometry';
import { calculateTriangle } from '../utils/trigFormulas';
import { validateTrigInputs } from '../utils/trigValidation';

/**
 * Composable for managing trigonometry calculator state and logic
 *
 * Provides reactive state, calculation, and reset functions
 */
export function useTrigCalculator() {
  // Default: empty inputs
  const state = reactive<TrigCalculationState>({
    inputs: {
      a: undefined,
      b: undefined,
      c: undefined,
      angleA: undefined,
      angleB: undefined
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
   * Calculate triangle outputs from current inputs
   * Validates inputs first, then performs calculation if valid
   */
  function calculate(): void {
    // Validate inputs
    const validation = validateTrigInputs(state.inputs);

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
      state.outputs = calculateTriangle(state.inputs);
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
   * Clears all inputs, outputs, and errors
   */
  function reset(): void {
    state.inputs = {
      a: undefined,
      b: undefined,
      c: undefined,
      angleA: undefined,
      angleB: undefined
    };
    state.outputs = null;
    state.isCalculated = false;
    state.errors = [];
  }

  /**
   * Update specific input value
   */
  function updateInput(field: keyof TrigInputs, value: number | undefined): void {
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
