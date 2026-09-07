<template>
  <q-page class="flex flex-center" style="padding: 16px;">
    <div class="row justify-center" style="width: 100%; max-width: 600px;">
      <div class="col-12">
        <!-- Header -->
        <div class="text-center q-mb-md q-px-md">
          <h5 class="text-h5 q-mt-md q-mb-xs">Arc Radius Calculator</h5>
          <p class="text-grey-7 q-ma-none">
            Calculate the radius of an arc from sagitta (height) and chord length.
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

        <!-- Arc Illustration with Inputs -->
        <q-card flat bordered>
          <q-card-section class="q-pa-md">
            <q-form @submit.prevent="handleCalculate">
              <!-- Illustration -->
              <div class="arc-container q-mb-md">
                <svg viewBox="0 0 400 250" class="arc-svg">
                  <!-- Chord (horizontal line at bottom) -->
                  <line x1="50" y1="200" x2="350" y2="200"
                        stroke="currentColor"
                        stroke-width="2" />

                  <!-- Arc (curved path above chord) -->
                  <path d="M 50 200 Q 200 80, 350 200"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2" />

                  <!-- Sagitta (vertical line from chord midpoint to arc) -->
                  <line x1="200" y1="200" x2="200" y2="80"
                        stroke="#21BA45"
                        stroke-width="2"
                        stroke-dasharray="5,5" />

                  <!-- Radius line (from center to arc endpoint) -->
                  <line x1="200" y1="235" x2="50" y2="200"
                        stroke="#E91E63"
                        stroke-width="2"
                        stroke-dasharray="5,5"
                        opacity="0.6" />

                  <!-- Center point -->
                  <circle cx="200" cy="235" r="4" fill="#E91E63" />

                  <!-- Labels -->
                  <text x="200" y="145" text-anchor="middle" class="label-text" fill="#21BA45">Sagitta (h)</text>
                  <text x="200" y="225" text-anchor="middle" class="label-text">Chord (c)</text>
                  <text x="115" y="230" text-anchor="middle" class="label-text" fill="#E91E63">Radius (r)</text>

                  <!-- Endpoint markers -->
                  <circle cx="50" cy="200" r="3" fill="currentColor" />
                  <circle cx="350" cy="200" r="3" fill="currentColor" />
                  <circle cx="200" cy="80" r="3" fill="#21BA45" />
                </svg>
              </div>

              <!-- Input Fields -->
              <div class="inputs-grid">
                <!-- Sagitta Input -->
                <q-input
                  v-model.number="state.inputs.sagitta"
                  type="number"
                  step="0.01"
                  dense
                  outlined
                  label="Sagitta (h)"
                  suffix="in"
                  placeholder="Arc height"
                  :readonly="hasResults"
                  :filled="hasResults"
                  class="q-mb-sm"
                />

                <!-- Chord Length Input -->
                <q-input
                  v-model.number="state.inputs.chordLength"
                  type="number"
                  step="0.01"
                  dense
                  outlined
                  label="Chord Length (c)"
                  suffix="in"
                  placeholder="Chord length"
                  :readonly="hasResults"
                  :filled="hasResults"
                  class="q-mb-sm"
                />
              </div>

              <!-- Action Buttons -->
              <div class="row q-gutter-sm q-mt-sm">
                <q-btn
                  v-if="!hasResults"
                  type="submit"
                  color="primary"
                  label="Calculate"
                  class="col"
                  unelevated
                />
                <q-btn
                  v-if="hasResults"
                  color="primary"
                  label="Reset"
                  class="col"
                  unelevated
                  @click="reset"
                />
                <q-btn
                  v-if="hasResults"
                  color="secondary"
                  label="Copy Results"
                  class="col"
                  unelevated
                  @click="copyResults"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Results Card -->
        <q-card v-if="hasResults && state.outputs" flat bordered class="q-mt-md">
          <q-card-section class="q-pa-sm">
            <div class="text-subtitle2 text-weight-medium q-mb-sm">Results</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-sm">
            <div class="results-grid">
              <div class="result-item">
                <div class="text-caption text-grey-7">Radius</div>
                <div class="text-h6 text-weight-medium">{{ state.outputs.radius }}"</div>
              </div>

              <div class="result-item">
                <div class="text-caption text-grey-7">Diameter</div>
                <div class="text-h6 text-weight-medium">{{ state.outputs.diameter }}"</div>
              </div>
            </div>
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
                  This calculator finds the radius of a circular arc when you know the arc's height and width.
                </p>
                <p class="q-ma-none q-mb-sm">
                  <strong>Definitions:</strong>
                </p>
                <ul class="q-ma-none q-pl-md q-mb-sm">
                  <li><strong>Sagitta (h):</strong> The height of the arc from the midpoint of the chord to the highest point of the arc</li>
                  <li><strong>Chord (c):</strong> The straight-line distance across the arc's endpoints</li>
                  <li><strong>Radius (r):</strong> The distance from the arc's center point to any point on the arc</li>
                </ul>
                <p class="q-ma-none q-mb-sm">
                  <strong>Formula:</strong> r = (h/2) + (c²/(8h))
                </p>
                <p class="q-ma-none q-mt-sm">
                  <strong>Example:</strong> If you have an arched doorway that's 36" wide with a 6" rise at the center, enter Chord = 36 and Sagitta = 6 to find the radius needed to cut the arc.
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
import { useArcRadiusCalculator } from '../composables/useArcRadiusCalculator';

// Use the calculator composable
const { state, hasResults, hasErrors, calculate, reset } = useArcRadiusCalculator();

function handleCalculate(): void {
  calculate();
}

function copyResults(): void {
  if (!state.outputs) return;

  const text = `
Arc Radius Calculation
=====================
Sagitta: ${state.inputs.sagitta}"
Chord Length: ${state.inputs.chordLength}"
Radius: ${state.outputs.radius}"
Diameter: ${state.outputs.diameter}"`;

  navigator.clipboard.writeText(text.trim()).then(
    () => {
      Notify.create({
        message: 'Results copied to clipboard',
        color: 'positive',
        position: 'top',
        timeout: 2000
      });
    },
    () => {
      Notify.create({
        message: 'Failed to copy results',
        color: 'negative',
        position: 'top',
        timeout: 2000
      });
    }
  );
}
</script>

<style scoped>
.arc-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.arc-svg {
  width: 100%;
  height: auto;
}

.label-text {
  font-size: 14px;
  font-weight: 500;
}

.inputs-grid {
  display: grid;
  gap: 8px;
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.result-item {
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  text-align: center;
}

.help-text {
  font-size: 14px;
  line-height: 1.5;
}

.help-text ul {
  list-style-type: disc;
}

.help-text li {
  margin-bottom: 8px;
}

@media (max-width: 600px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>
