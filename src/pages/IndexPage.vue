<template>
  <q-page class="flex flex-center" style="padding: 16px;">
    <div class="row justify-center" style="width: 100%; max-width: 600px;">
      <div class="col-12">
        <!-- Header -->
        <div class="text-center q-mb-md">
          <h5 class="text-h5 q-mt-none q-mb-xs">Coopering Calculator</h5>
          <p class="text-caption text-grey-7 q-ma-none">
            Table saw angles for N-sided pyramids.
            An n-sided pyramid is built from n identical triangular side pieces, not including the base. The base radius is the distance from the center of the pyramid's base to one of the base corners. The height is the distance from the center of the base to the apex.
          </p>
        </div>

        <!-- Error Banner -->
        <q-banner v-if="hasErrors" class="bg-negative text-white q-mb-sm" dense rounded>
          <template v-slot:avatar>
            <q-icon name="error" size="sm" />
          </template>
          <div class="text-caption">
            <div v-for="(error, index) in state.errors" :key="index">
              {{ error }}
            </div>
          </div>
        </q-banner>

        <!-- Calculator Form -->
        <calculator-form
          v-model="state.inputs"
          @calculate="handleCalculate"
        />

        <!-- Results Display -->
        <results-display
          v-if="hasResults && state.outputs"
          :results="state.outputs"
          :inputs="state.inputs"
        />
      </div>
    </div>

    <!-- Save Calculation Dialog -->
    <q-dialog v-model="showSaveDialog" persistent>
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Save Calculation</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="calculationName"
            label="Calculation Name"
            dense
            outlined
            autofocus
            :rules="[
              val => !!val || 'Name is required',
              val => val.length <= 50 || 'Max 50 characters'
            ]"
            @keyup.enter="confirmSave"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="cancelSave" />
          <q-btn flat label="Save" color="primary" @click="confirmSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { usePyramidCalculator } from '../composables/usePyramidCalculator';
import { saveCalculation } from '../utils/storage';
import type { SavedCalculation } from '../types/pyramid';
import CalculatorForm from '../components/CalculatorForm.vue';
import ResultsDisplay from '../components/ResultsDisplay.vue';

// Use the calculator composable
const { state, hasResults, hasErrors, calculate } = usePyramidCalculator();

// Quasar notify plugin
const $q = useQuasar();

// Save dialog state
const showSaveDialog = ref(false);
const calculationName = ref('');
let pendingSave = false;

// Handle calculate with optional save
function handleCalculate(payload: { save: boolean }): void {
  // Run calculation first
  calculate();

  // If save is requested and calculation is successful, show dialog
  if (payload.save && hasResults.value && state.outputs) {
    pendingSave = true;
    showSaveDialog.value = true;
  }
}

// Confirm save from dialog
function confirmSave(): void {
  // Validate name
  if (!calculationName.value || calculationName.value.trim().length === 0) {
    $q.notify({
      type: 'negative',
      message: 'Please enter a calculation name',
      position: 'top',
    });
    return;
  }

  if (calculationName.value.length > 50) {
    $q.notify({
      type: 'negative',
      message: 'Name must be 50 characters or less',
      position: 'top',
    });
    return;
  }

  // Create saved calculation
  if (state.outputs) {
    const saved: SavedCalculation = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: calculationName.value.trim(),
      timestamp: Date.now(),
      inputs: { ...state.inputs },
      outputs: { ...state.outputs },
    };

    try {
      saveCalculation(saved);
      $q.notify({
        type: 'positive',
        message: 'Calculation saved successfully',
        position: 'top',
      });
      showSaveDialog.value = false;
      calculationName.value = '';
      pendingSave = false;
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to save calculation',
        position: 'top',
      });
    }
  }
}

// Cancel save dialog
function cancelSave(): void {
  showSaveDialog.value = false;
  calculationName.value = '';
  pendingSave = false;
}
</script>
