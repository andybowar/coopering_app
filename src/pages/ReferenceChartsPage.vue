<template>
  <q-page class="flex flex-center" style="padding: 16px;">
    <div class="row justify-center" style="width: 100%; max-width: 800px;">
      <div class="col-12">
        <!-- Header -->
        <div class="text-center q-mb-md">
          <h5 class="text-h5 q-mt-none q-mb-xs">Compound Miter Angle Reference</h5>
          <p class="text-caption text-grey-7 q-ma-none">
            Reference table for compound miter cuts by number of sides.
          </p>
        </div>

        <!-- Number of Sides Selector -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="q-pa-sm">
            <div class="text-subtitle2 q-mb-sm">Number of Sides</div>
            <select
              v-model="selectedSides"
              class="native-select"
            >
              <option :value="null">Select polygon sides</option>
              <option
                v-for="sides in availableSides"
                :key="sides"
                :value="sides"
              >
                {{ sides }} sides
              </option>
            </select>
          </q-card-section>
        </q-card>

        <!-- Search Filter -->
        <q-card flat bordered class="q-mb-md" v-if="selectedSides">
          <q-card-section class="q-pa-sm">
            <input
              v-model.number="searchAngle"
              type="number"
              placeholder="Filter by side angle (°)"
              class="native-input"
            />
          </q-card-section>
        </q-card>

        <!-- Loading State -->
        <q-card flat bordered v-if="isLoading">
          <q-card-section class="text-center">
            <q-spinner color="primary" size="3em" />
          </q-card-section>
        </q-card>

        <!-- Angle Table -->
        <q-card flat bordered v-show="!isLoading && selectedSides && displayData.length > 0">
          <q-card-section class="q-pa-none">
            <div style="max-height: 500px; overflow-y: auto; -webkit-overflow-scrolling: touch;">
              <table class="angle-table">
                <thead>
                  <tr>
                    <th>Side Angle</th>
                    <th>Blade Angle</th>
                    <th>Miter Angle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in displayData" :key="row.sideAngle">
                    <td>{{ row.sideAngle }}°</td>
                    <td class="text-primary">{{ row.bladeAngle }}°</td>
                    <td class="text-secondary">{{ row.miterAngle }}°</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </q-card-section>

          <q-card-section class="q-pa-sm text-caption text-grey-7">
            Showing {{ displayData.length }} entries
          </q-card-section>
        </q-card>

        <!-- No Data Message -->
        <q-card flat bordered v-show="!isLoading && selectedSides && displayData.length === 0">
          <q-card-section class="text-center text-grey-7">
            <q-icon name="search_off" size="48px" class="q-mb-sm" />
            <div>No matching angles found</div>
          </q-card-section>
        </q-card>

        <!-- Instructions -->
        <q-card flat bordered v-show="!isLoading && !selectedSides">
          <q-card-section class="text-center text-grey-7">
            <q-icon name="info" size="48px" class="q-mb-sm" />
            <div>Select the number of sides to view the compound miter angle table</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import compoundMiterData from '../data/compound-miter-angles.json';

interface AngleData {
  sideAngle: number;
  bladeAngle: number;
  miterAngle: number;
}

// Available number of sides from the data
const availableSides = Object.keys(compoundMiterData)
  .map(Number)
  .sort((a, b) => a - b);

// Selected number of sides
const selectedSides = ref<number | null>(null);

// Search filter
const searchAngle = ref<number | null>(null);

// Loading state
const isLoading = ref(false);

// Get display data - only compute when needed
const displayData = computed<AngleData[]>(() => {
  if (!selectedSides.value) return [];

  const data = (compoundMiterData as Record<string, AngleData[]>)[selectedSides.value.toString()] || [];

  // Apply search filter if exists
  if (searchAngle.value !== null && !isNaN(searchAngle.value)) {
    return data.filter(row => row.sideAngle === searchAngle.value);
  }

  return data;
});

// Watch for changes to selectedSides and show loading state
watch(selectedSides, async () => {
  if (selectedSides.value) {
    isLoading.value = true;
    await nextTick();
    // Small delay to let UI update
    setTimeout(() => {
      isLoading.value = false;
    }, 50);
  }
});
</script>

<style scoped>
.native-select,
.native-input {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  background-color: #2d3748;
  color: #e2e8f0;
  border: 1px solid #4a5568;
  border-radius: 4px;
  outline: none;
}

.native-select:focus,
.native-input:focus {
  border-color: #68d391;
}

.native-select option {
  background-color: #2d3748;
  color: #e2e8f0;
}

.angle-table {
  width: 100%;
  border-collapse: collapse;
}

.angle-table th {
  background-color: #1a202c;
  color: #cbd5e0;
  padding: 8px 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 1;
}

.angle-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #4a5568;
  font-size: 14px;
}

.angle-table tbody tr:hover {
  background-color: #374151;
}
</style>
