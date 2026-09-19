<template>
  <q-page class="arc-page flex flex-center" style="padding: 16px;">
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
                <!--
                  Geometry, all derived from one consistent circle so the parts
                  actually meet: chord at y=150 spanning x 50..350 (half-chord
                  a=150), centre at (200,200) giving an apothem of 50, so
                  r = hypot(150,50) = 158.114 and the apex sits at
                  y = 200 - 158.114 = 41.886 (sagitta 108.114).
                -->
                <svg viewBox="0 0 400 250" class="arc-svg">
                  <!-- Arc. A real circular arc: the previous quadratic Bezier
                       "Q 200 80" actually peaked at y=140, so the sagitta and
                       its marker were drawn 60px above the curve. -->
                  <path d="M 50 150 A 158.114 158.114 0 0 1 350 150"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2" />

                  <!-- Chord. Solid and in its own colour: it was previously
                       currentColor at the same weight as the arc, so the two
                       read as one shape. -->
                  <line x1="50" y1="150" x2="350" y2="150"
                        class="chord-stroke"
                        stroke-width="3" />

                  <!-- Sagitta: chord midpoint up to the arc apex -->
                  <line x1="200" y1="150" x2="200" y2="41.886"
                        class="sagitta-stroke"
                        stroke-width="2"
                        stroke-dasharray="5,5" />

                  <!-- Radius: centre out to a chord endpoint -->
                  <line x1="200" y1="200" x2="50" y2="150"
                        class="radius-stroke"
                        stroke-width="2"
                        stroke-dasharray="5,5"
                        opacity="0.8" />

                  <!-- Right-angle mark where the sagitta meets the chord -->
                  <path d="M 188 150 L 188 138 L 200 138"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1"
                        opacity="0.45" />

                  <!-- Centre point -->
                  <circle cx="200" cy="200" r="4" class="radius-fill" />

                  <!-- Endpoint markers. These are the chord's endpoints, so
                       they carry the chord colour. -->
                  <circle cx="50" cy="150" r="4" class="chord-fill" />
                  <circle cx="350" cy="150" r="4" class="chord-fill" />
                  <circle cx="200" cy="41.886" r="3" class="sagitta-fill" />

                  <!-- Labels, each matching the element it names -->
                  <text x="210" y="100" text-anchor="start" class="label-text sagitta-fill">Sagitta (h)</text>
                  <text x="290" y="170" text-anchor="middle" class="label-text chord-fill">Chord (c)</text>
                  <text x="118" y="190" text-anchor="middle" class="label-text radius-fill">Radius (r)</text>
                  <text x="200" y="222" text-anchor="middle" class="label-text radius-fill" opacity="0.75">Centre</text>
                </svg>
              </div>

              <!-- Input Fields -->
              <div class="inputs-grid">
                <!-- Sagitta Input. The colour swatch ties each field back to
                     the matching line in the diagram above. -->
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
                >
                  <template v-slot:prepend>
                    <span class="swatch swatch-sagitta" aria-hidden="true" />
                  </template>
                </q-input>

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
                >
                  <template v-slot:prepend>
                    <span class="swatch swatch-chord" aria-hidden="true" />
                  </template>
                </q-input>
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
                <div class="text-caption text-grey-7">
                  <span class="swatch swatch-radius" aria-hidden="true" />Radius
                </div>
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
                  <li><strong class="term-sagitta">Sagitta (h):</strong> The height of the arc from the midpoint of the chord to the highest point of the arc</li>
                  <li><strong class="term-chord">Chord (c):</strong> The straight-line distance between the arc's two endpoints</li>
                  <li><strong class="term-radius">Radius (r):</strong> The distance from the arc's center point to any point on the arc</li>
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
/*
  Colour coding for the three quantities. Defined once here and referenced by
  the diagram, the input fields, the result, and the definitions list, so the
  four can never drift apart.

  The arc itself deliberately stays currentColor: it is the shape being
  measured, not one of the measurements.
*/
.arc-page {
  /*
    Contrast ratios against the dark card (#2d3748), which needs >= 3:1 for
    non-text graphics: green 4.67:1, blue 3.84:1, pink 3.92:1. The pink was
    previously #e91e63, which only reached 2.76:1.
  */
  --arc-sagitta: #21ba45;
  --arc-chord: #2196f3;
  --arc-radius: #f06292;
}

.sagitta-stroke { stroke: var(--arc-sagitta); }
.chord-stroke { stroke: var(--arc-chord); }
.radius-stroke { stroke: var(--arc-radius); }

.sagitta-fill { fill: var(--arc-sagitta); }
.chord-fill { fill: var(--arc-chord); }
.radius-fill { fill: var(--arc-radius); }

.term-sagitta { color: var(--arc-sagitta); }
.term-chord { color: var(--arc-chord); }
.term-radius { color: var(--arc-radius); }

/* Small colour chip shown beside the inputs and the radius result */
.swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 6px;
  vertical-align: middle;
  flex: 0 0 auto;
}

.swatch-sagitta { background-color: var(--arc-sagitta); }
.swatch-chord { background-color: var(--arc-chord); }
.swatch-radius { background-color: var(--arc-radius); }

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
