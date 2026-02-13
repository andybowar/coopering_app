<template>
  <q-page class="flex flex-center" style="padding: 16px;">
    <div class="row justify-center" style="width: 100%; max-width: 600px;">
      <div class="col-12">
        <!-- Header -->
        <div class="text-center q-mb-md">
          <h5 class="text-h5 q-mt-none q-mb-xs">Pyramid Calculator</h5>
          <p class="text-caption text-grey-7 q-ma-none">
            Table saw angles for N-sided pyramids.
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
          @calculate="calculate"
        />

        <!-- Results Display -->
        <results-display
          v-if="hasResults && state.outputs"
          :results="state.outputs"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { usePyramidCalculator } from '../composables/usePyramidCalculator';
import CalculatorForm from '../components/CalculatorForm.vue';
import ResultsDisplay from '../components/ResultsDisplay.vue';

// Use the calculator composable
const { state, hasResults, hasErrors, calculate } = usePyramidCalculator();
</script>
