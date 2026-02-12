<template>
  <q-page class="flex flex-center" style="padding: 20px;">
    <div class="row justify-center" style="width: 100%; max-width: 1200px;">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- Header -->
        <div class="text-center q-mb-lg">
          <h3 class="text-h3 q-mt-none q-mb-sm">N-Sided Pyramid Calculator</h3>
          <p class="text-subtitle1 text-grey-7">
            For woodworking and construction
          </p>
        </div>

        <!-- Error Banner -->
        <q-banner v-if="hasErrors" class="bg-negative text-white q-mb-md" rounded>
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          <div class="text-subtitle1">Please correct the following errors:</div>
          <ul class="q-my-sm">
            <li v-for="(error, index) in state.errors" :key="index">
              {{ error }}
            </li>
          </ul>
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
