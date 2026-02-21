<template>
  <q-page class="flex flex-center" style="padding: 16px;">
    <div class="row justify-center" style="width: 100%; max-width: 600px;">
      <div class="col-12">
        <!-- Header -->
        <div class="text-center q-mb-md">
          <h5 class="text-h5 q-mt-none q-mb-xs">Pyramid Calculator</h5>
          <p class="text-grey-7 q-ma-none">
            An n-sided pyramid is built from n identical triangular side pieces, not including the base. This calculator is for a regular pyramid, where all side pieces are identical and go from an open base on one end to a point on the other end.
          </p>
          <br />
          <div class="text-subtitle1 text-weight-medium q-mt-md q-mb-xs">Base Radius</div>
          <p class="text-grey-7 q-ma-none q-mb-sm">
            The base radius is the distance from the center of the pyramid's base to one of the base corners. If you think about the base as a polygon contained in a circle, the base radius is the radius of that circle.
          </p>
          <img src="/pyramid_radius_illustration.jpg" alt="Base Radius Illustration" class="illustration-image q-mb-sm">
          <div class="text-subtitle1 text-weight-medium q-mt-md q-mb-xs">Height</div>
          <p class="text-grey-7 q-ma-none q-mb-sm">
            The height is the distance from the bottom of the pyramid to the top. It should not be confused with the length of the side pieces.
          </p>
          <img src="/pyramid_height_illustration.jpg" alt="Height Illustration" class="illustration-image">
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

        <!-- Definitions Section - Shows with Results -->
        <q-card v-if="hasResults && state.outputs" flat bordered class="q-mt-md definitions-card">
          <q-expansion-item
            dense
            dense-toggle
            expand-separator
            icon="info"
            label="Definitions & Terms"
            header-class="text-weight-medium"
          >
            <q-card-section class="q-pa-sm">
              <div class="definition-item q-pa-sm q-mb-xs">
                <div class="definition-term">Compound Cut</div>
                <div class="definition-text">A cut consisting of two angles: the bevel angle and the miter angle.</div>
              </div>

              <div class="definition-item q-pa-sm q-mb-xs">
                <div class="definition-term">Bevel Angle (Blade Tilt)</div>
                <div class="definition-text">The tilt of the saw blade from vertical on the saw table. A normal square cut has a bevel of 0°. Typically saws have a maximum bevel of 45°.</div>
              </div>

              <div class="definition-item q-pa-sm q-mb-xs">
                <div class="definition-term">Miter Angle (Cross-Cut Angle)</div>
                <div class="definition-text">The horizontal angle, as seen on the saw table, from a line perpendicular to the long edge of a board. Set on the miter gauge of the table saw. A perpendicular cut has a miter of 0°.</div>
              </div>

              <div class="definition-item q-pa-sm q-mb-xs">
                <div class="definition-term">Miter Complement Angle</div>
                <div class="definition-text">Some saws label the miter angle differently, with a perpendicular cut labeled 90°.</div>
              </div>

              <div class="definition-item q-pa-sm q-mb-xs">
                <div class="definition-term">Dihedral Angle</div>
                <div class="definition-text">The angle where two pyramid sides meet (like opening a book). This is measured on the inside and is always 180° or less. To cut a filler block that fits perfectly in this corner, set your miter gauge to (dihedral angle - 90°) with the blade at 0° tilt.</div>
              </div>

              <div class="definition-item q-pa-sm q-mb-xs">
                <div class="definition-term">Miter Joint</div>
                <div class="definition-text">Joins the cut ends of two boards.</div>
              </div>

              <div class="definition-item q-pa-sm q-mb-xs">
                <div class="definition-term">Butt Joint</div>
                <div class="definition-text">Joins the cut end of one board (butt) with the uncut side of a second board (cap).</div>
              </div>

              <div class="definition-item q-pa-sm">
                <div class="definition-term">Negative Angle</div>
                <div class="definition-text">Shows that this angle is in the opposite direction of a positive angle (e.g., the blade tilts right instead of left). This occurs mainly in butted joints because the blade typically tilts in the opposite direction from mitered joints.</div>
              </div>
            </q-card-section>
          </q-expansion-item>
        </q-card>
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

<style scoped>
.illustration-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.definitions-card {
  background-color: rgba(255, 255, 255, 0.02);
}

.definition-item {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border-left: 3px solid #1976d2;
  transition: background-color 0.2s ease;
}

.definition-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.definition-term {
  font-weight: 600;
  font-size: 0.9rem;
  color: #90caf9;
  margin-bottom: 4px;
  letter-spacing: 0.3px;
}

.definition-text {
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.87);
}
</style>
