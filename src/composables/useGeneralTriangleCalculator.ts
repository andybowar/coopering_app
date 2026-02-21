import { reactive, computed } from 'vue';
import type { GeneralTriangleState, GeneralTriangleInputs } from '../types/generalTriangle';
import { calculateGeneralTriangle } from '../utils/generalTriangleFormulas';
import { validateGeneralTriangleInputs } from '../utils/generalTriangleValidation';

/**
 * Composable for managing general triangle calculator state and logic
 */
export function useGeneralTriangleCalculator() {
  // Default: empty inputs
  const state = reactive<GeneralTriangleState>({
    inputs: {
      a: undefined,
      b: undefined,
      c: undefined,
      angleA: undefined,
      angleB: undefined,
      angleC: undefined
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
   */
  function calculate(): void {
    // Validate inputs
    const validation = validateGeneralTriangleInputs(state.inputs);

    if (!validation.isValid) {
      state.errors = validation.errors;
      state.outputs = null;
      state.isCalculated = false;
      return;
    }

    // Clear errors
    state.errors = [];

    try {
      // Perform calculation
      state.outputs = calculateGeneralTriangle(state.inputs);
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
      a: undefined,
      b: undefined,
      c: undefined,
      angleA: undefined,
      angleB: undefined,
      angleC: undefined
    };
    state.outputs = null;
    state.isCalculated = false;
    state.errors = [];
  }

  /**
   * Update specific input value
   */
  function updateInput(field: keyof GeneralTriangleInputs, value: number | undefined): void {
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
