<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12" style="max-width: 600px;">
        <!-- Header -->
        <div class="text-center q-mb-md q-mt-md">
          <h5 class="text-h5 q-mt-none q-mb-xs">Calculator History</h5>
          <p class="text-caption text-grey-7 q-ma-none">
            View and manage your saved calculations
          </p>
        </div>

        <!-- Empty State -->
        <div v-if="calculations.length === 0" class="text-center q-pa-xl">
          <q-icon name="history" size="64px" color="grey-5" />
          <p class="text-body1 text-grey-7 q-mt-md">
            No saved calculations yet
          </p>
          <p class="text-caption text-grey-6">
            Save calculations from the Calculator page to see them here
          </p>
        </div>

        <!-- Calculations List -->
        <div v-else>
          <q-card
            v-for="calc in calculations"
            :key="calc.id"
            flat
            bordered
            class="q-mb-md"
          >
            <q-card-section>
              <div class="row items-center">
                <div class="col">
                  <div class="text-subtitle1 text-weight-medium">
                    {{ calc.name }}
                  </div>
                  <div class="text-caption text-grey-7">
                    {{ formatDate(calc.timestamp) }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="delete"
                    @click="confirmDelete(calc)"
                  >
                    <q-tooltip>Delete calculation</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-expansion-item
              label="View Details"
              icon="visibility"
              dense
              dense-toggle
            >
              <q-card-section class="q-pt-md">
                <!-- Inputs -->
                <div class="text-subtitle2 text-weight-medium q-mb-sm">
                  Inputs
                </div>
                <div class="q-mb-md">
                  <div class="text-body2">
                    <strong>Sides:</strong> {{ calc.inputs.numberOfSides }}
                  </div>
                  <div class="text-body2">
                    <strong>Radius:</strong> {{ calc.inputs.baseRadius }} in
                  </div>
                  <div class="text-body2">
                    <strong>Height:</strong> {{ calc.inputs.height }} in
                  </div>
                </div>

                <!-- Outputs -->
                <div class="text-subtitle2 text-weight-medium q-mb-sm">
                  Outputs
                </div>
                <div>
                  <div class="text-body2">
                    <strong>Base Side Length:</strong> {{ calc.outputs.baseSideLength.toFixed(3) }} in
                  </div>
                  <div class="text-body2">
                    <strong>Miter Angle:</strong> {{ calc.outputs.miterAngle.toFixed(2) }}°
                  </div>
                  <div class="text-body2">
                    <strong>Miter Complement:</strong> {{ calc.outputs.miterComplement.toFixed(2) }}°
                  </div>
                  <div class="text-body2">
                    <strong>Side Slope:</strong> {{ calc.outputs.sideSlope.toFixed(2) }}°
                  </div>
                  <div class="text-body2">
                    <strong>Blade Tilt (Mitered):</strong> {{ calc.outputs.bladeTiltMitered.toFixed(2) }}°
                  </div>
                  <div class="text-body2">
                    <strong>Blade Tilt (Butted):</strong> {{ calc.outputs.bladeTiltButted.toFixed(2) }}°
                  </div>
                  <div class="text-body2">
                    <strong>Dihedral Angle:</strong> {{ calc.outputs.dihedralAngle.toFixed(2) }}°
                  </div>
                </div>
              </q-card-section>
            </q-expansion-item>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Delete Calculation</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to delete "{{ calculationToDelete?.name }}"?
          This action cannot be undone.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="showDeleteDialog = false" />
          <q-btn flat label="Delete" color="negative" @click="deleteCalculation" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { getSavedCalculations, deleteCalculation as deleteCalcFromStorage } from '../utils/storage';
import type { SavedCalculation } from '../types/pyramid';

const $q = useQuasar();

// State
const calculations = ref<SavedCalculation[]>([]);
const showDeleteDialog = ref(false);
const calculationToDelete = ref<SavedCalculation | null>(null);

// Load calculations on mount
onMounted(() => {
  loadCalculations();
});

// Load calculations from localStorage
function loadCalculations(): void {
  calculations.value = getSavedCalculations();
}

// Format timestamp to readable date
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Show delete confirmation
function confirmDelete(calc: SavedCalculation): void {
  calculationToDelete.value = calc;
  showDeleteDialog.value = true;
}

// Delete calculation
function deleteCalculation(): void {
  if (calculationToDelete.value) {
    try {
      deleteCalcFromStorage(calculationToDelete.value.id);
      loadCalculations();
      $q.notify({
        type: 'positive',
        message: 'Calculation deleted successfully',
        position: 'top',
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete calculation',
        position: 'top',
      });
    }
  }
  showDeleteDialog.value = false;
  calculationToDelete.value = null;
}
</script>
