<template>
  <q-page class="flex flex-center" style="padding: 16px;">
    <div class="row justify-center" style="width: 100%; max-width: 600px;">
      <div class="col-12">
        <!-- Header -->
        <div class="text-center q-mb-md">
          <h5 class="text-h5 q-mt-md q-mb-xs">Regular Triangle</h5>
          <p class="text-grey-7 q-ma-none">
            Enter any 3 values (3 sides, 2 sides + 1 angle, or 2 angles + 1 side) to solve the triangle.
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

        <!-- Triangle Illustration with Input Fields -->
        <q-card flat bordered>
          <q-card-section class="q-pa-md">
            <q-form @submit.prevent="handleCalculate">
              <!-- Triangle with integrated inputs -->
              <div class="triangle-container">
                <svg viewBox="0 0 400 320" class="triangle-svg">
                  <!-- Triangle -->
                  <path d="M 200 40 L 360 280 L 40 280 Z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2" />
                </svg>

                <!-- Side a input (bottom) -->
                <div class="input-side-a">
                  <q-input
                    v-model.number="state.inputs.a"
                    type="number"
                    step="0.01"
                    dense
                    outlined
                    placeholder="a"
                    :readonly="hasResults"
                    :filled="hasResults && state.outputs"
                    :model-value="hasResults && state.outputs ? state.outputs.a : state.inputs.a"
                    @update:model-value="!hasResults && updateInput('a', $event)"
                    class="compact-input"
                  />
                </div>

                <!-- Side b input (right) -->
                <div class="input-side-b">
                  <q-input
                    v-model.number="state.inputs.b"
                    type="number"
                    step="0.01"
                    dense
                    outlined
                    placeholder="b"
                    :readonly="hasResults"
                    :filled="hasResults && state.outputs"
                    :model-value="hasResults && state.outputs ? state.outputs.b : state.inputs.b"
                    @update:model-value="!hasResults && updateInput('b', $event)"
                    class="compact-input"
                  />
                </div>

                <!-- Side c input (left) -->
                <div class="input-side-c">
                  <q-input
                    v-model.number="state.inputs.c"
                    type="number"
                    step="0.01"
                    dense
                    outlined
                    placeholder="c"
                    :readonly="hasResults"
                    :filled="hasResults && state.outputs"
                    :model-value="hasResults && state.outputs ? state.outputs.c : state.inputs.c"
                    @update:model-value="!hasResults && updateInput('c', $event)"
                    class="compact-input"
                  />
                </div>

                <!-- Angle A input (top) -->
                <div class="input-angle-a">
                  <AngleInput
                    :model-value="hasResults && state.outputs ? state.outputs.angleA : state.inputs.angleA"
                    placeholder="∠A"
                    :readonly="hasResults"
                    :filled="hasResults && state.outputs"
                    @update:model-value="!hasResults && updateInput('angleA', $event)"
                  />
                </div>

                <!-- Angle B input (bottom-right) -->
                <div class="input-angle-b">
                  <AngleInput
                    :model-value="hasResults && state.outputs ? state.outputs.angleB : state.inputs.angleB"
                    placeholder="∠B"
                    :readonly="hasResults"
                    :filled="hasResults && state.outputs"
                    @update:model-value="!hasResults && updateInput('angleB', $event)"
                  />
                </div>

                <!-- Angle C input (bottom-left) -->
                <div class="input-angle-c">
                  <AngleInput
                    :model-value="hasResults && state.outputs ? state.outputs.angleC : state.inputs.angleC"
                    placeholder="∠C"
                    :readonly="hasResults"
                    :filled="hasResults && state.outputs"
                    @update:model-value="!hasResults && updateInput('angleC', $event)"
                  />
                </div>
              </div>

              <!-- Buttons -->
              <div class="row q-col-gutter-sm q-mt-md">
                <div class="col-6">
                  <q-btn
                    v-if="!hasResults"
                    type="submit"
                    color="primary"
                    label="Calculate"
                    class="full-width"
                    unelevated
                  />
                  <q-btn
                    v-else
                    color="primary"
                    label="Reset"
                    class="full-width"
                    unelevated
                    @click="reset"
                  />
                </div>
                <div class="col-6">
                  <q-btn
                    v-if="hasResults"
                    flat
                    color="primary"
                    label="Copy Results"
                    icon="content_copy"
                    class="full-width"
                    @click="copyResults"
                  />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Help Text -->
        <q-card flat bordered class="q-mt-md">
          <q-expansion-item
            dense
            dense-toggle
            expand-separator
            icon="info"
            label="How to Use"
            header-class="text-weight-medium"
          >
            <q-card-section class="q-pa-sm">
              <div class="help-text">
                <p class="q-ma-none q-mb-sm">
                  This calculator solves any triangle using the law of sines and law of cosines.
                </p>
                <p class="q-ma-none q-mb-sm">
                  <strong>To use:</strong>
                </p>
                <ul class="q-ma-none q-pl-md">
                  <li>Enter any 3 values from the 6 fields</li>
                  <li>You can enter: 3 sides (SSS), 2 sides + 1 angle (SAS or SSA), or 2 angles + 1 side (ASA or AAS)</li>
                  <li>Click "Calculate" to find all remaining values</li>
                  <li>Click "Reset" to clear and start over</li>
                </ul>
                <p class="q-ma-none q-mt-sm">
                  <strong>Note:</strong> Each angle is labeled with the vertex letter (A, B, C) and is opposite to its corresponding side (a, b, c).
                </p>
              </div>
            </q-card-section>
          </q-expansion-item>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { Notify } from 'quasar';
import { useGeneralTriangleCalculator } from '../composables/useGeneralTriangleCalculator';
import AngleInput from '../components/AngleInput.vue';

// Use the calculator composable
const { state, hasResults, hasErrors, calculate, reset, updateInput } = useGeneralTriangleCalculator();

function handleCalculate(): void {
  calculate();
}

function copyResults(): void {
  if (!state.outputs) return;

  const text = `
General Triangle Solution
=======================
Side a: ${state.outputs.a}
Side b: ${state.outputs.b}
Side c: ${state.outputs.c}
Angle A: ${state.outputs.angleA}°
Angle B: ${state.outputs.angleB}°
Angle C: ${state.outputs.angleC}°`;

  navigator.clipboard.writeText(text.trim()).then(
    () => {
      Notify.create({
        type: 'positive',
        message: 'Results copied to clipboard',
        position: 'top',
        timeout: 2000
      });
    },
    () => {
      Notify.create({
        type: 'negative',
        message: 'Failed to copy results',
        position: 'top',
        timeout: 2000
      });
    }
  );
}
</script>

<style scoped>
.triangle-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.triangle-svg {
  width: 100%;
  height: auto;
  display: block;
}

.compact-input {
  max-width: 120px;
}

.compact-input :deep(.q-field__control) {
  background-color: white;
  opacity: 1;
}

.compact-input :deep(.q-field__control):before {
  opacity: 1;
}

.compact-input :deep(input) {
  color: black !important;
}

.compact-input :deep(input::placeholder) {
  color: black;
  opacity: 1;
}

.compact-input :deep(.q-field__native) {
  color: black !important;
}

/* Position inputs around the triangle */
.input-side-a {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.input-side-b {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
}

.input-side-c {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
}

.input-angle-a {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.input-angle-b {
  position: absolute;
  right: 5%;
  bottom: 10%;
  text-align: center;
}

.input-angle-c {
  position: absolute;
  left: 5%;
  bottom: 10%;
  text-align: center;
}

.help-text {
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .compact-input {
    max-width: 100px;
  }
}
</style>
