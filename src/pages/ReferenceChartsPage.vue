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
            <q-select
              v-model="selectedSides"
              :options="availableSides"
              dense
              outlined
              label="Select polygon sides"
            />
          </q-card-section>
        </q-card>

        <!-- Search Filter -->
        <q-card flat bordered class="q-mb-md" v-if="selectedSides">
          <q-card-section class="q-pa-sm">
            <q-input
              v-model="searchAngle"
              type="number"
              dense
              outlined
              label="Filter by side angle (°)"
              clearable
              @clear="searchAngle = ''"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </q-card-section>
        </q-card>

        <!-- Angle Table -->
        <q-card flat bordered v-if="selectedSides && filteredData.length > 0">
          <q-card-section class="q-pa-none">
            <div style="max-height: 500px; overflow-y: auto;">
              <q-table
                :rows="filteredData"
                :columns="columns"
                row-key="sideAngle"
                dense
                flat
                :pagination="{ rowsPerPage: 0 }"
                hide-pagination
                virtual-scroll
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="sideAngle" :props="props">
                      {{ props.row.sideAngle }}°
                    </q-td>
                    <q-td key="bladeAngle" :props="props" class="text-weight-bold text-primary">
                      {{ props.row.bladeAngle }}°
                    </q-td>
                    <q-td key="miterAngle" :props="props" class="text-weight-bold text-secondary">
                      {{ props.row.miterAngle }}°
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </q-card-section>

          <q-card-section class="q-pa-sm text-caption text-grey-7">
            Showing {{ filteredData.length }} of {{ currentData.length }} entries
          </q-card-section>
        </q-card>

        <!-- No Data Message -->
        <q-card flat bordered v-else-if="selectedSides">
          <q-card-section class="text-center text-grey-7">
            <q-icon name="search_off" size="48px" class="q-mb-sm" />
            <div>No matching angles found</div>
          </q-card-section>
        </q-card>

        <!-- Instructions -->
        <q-card flat bordered v-else>
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
import { ref, computed } from 'vue';
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
const searchAngle = ref<string>('');

// Table columns
const columns = [
  {
    name: 'sideAngle',
    label: 'Side Angle',
    field: 'sideAngle',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'bladeAngle',
    label: 'Blade Angle',
    field: 'bladeAngle',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'miterAngle',
    label: 'Miter Angle',
    field: 'miterAngle',
    align: 'left' as const,
    sortable: true
  }
];

// Get current data based on selected sides
const currentData = computed<AngleData[]>(() => {
  if (!selectedSides.value) return [];
  return (compoundMiterData as Record<string, AngleData[]>)[selectedSides.value.toString()] || [];
});

// Filter data based on search
const filteredData = computed<AngleData[]>(() => {
  if (!searchAngle.value) return currentData.value;

  const targetAngle = parseFloat(searchAngle.value);
  if (isNaN(targetAngle)) return currentData.value;

  // Find angle by degree
  return currentData.value.filter(row => row.sideAngle === targetAngle);
});
</script>
