import { reactive, computed } from 'vue';
import type { ArcRadiusCalculationState, ArcRadiusInputs } from '../types/arcRadius';
import { calculateArcRadius, validateArcRadiusInputs } from '../utils/arcRadiusFormulas';

/**
 * Composable for managing arc radius calculator state and logic
 *
 * Provides reactive state, calculation, and reset functions
 */
export function useArcRadiusCalculator() {
  // Default: empty inputs
  const state = reactive<ArcRadiusCalculationState>({
    inputs: {
      sagitta: undefined,
      chordLength: undefined
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
   * Calculate arc radius from current inputs
   * Validates inputs first, then performs calculation if valid
   */
  function calculate(): void {
    // Validate inputs
    const validation = validateArcRadiusInputs(state.inputs);

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
      state.outputs = calculateArcRadius(state.inputs);
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
      sagitta: undefined,
      chordLength: undefined
    };
    state.outputs = null;
    state.isCalculated = false;
    state.errors = [];
  }

  /**
   * Update specific input value
   */
  function updateInput(field: keyof ArcRadiusInputs, value: number | undefined): void {
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
