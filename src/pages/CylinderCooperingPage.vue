<template>
  <q-page class="flex flex-center" style="padding: 16px;">
    <div class="row justify-center" style="width: 100%; max-width: 600px;">
      <div class="col-12">
        <!-- Header -->
        <div class="text-center q-mb-md">
          <h5 class="text-h5 q-mt-md q-mb-xs">Cylinder Coopering</h5>
          <p class="text-grey-7 q-ma-none">
            Calculate blade tilt angles and dimensions for cylindrical coopering projects. Perfect for vessels, columns, and other cylindrical shapes.
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

        <!-- Inputs Card -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="q-pa-sm">
            <div class="text-subtitle2 text-weight-medium q-mb-sm">Parameters</div>
            <q-form @submit.prevent="calculate">
              <!-- Angle Precision Selector -->
              <div class="q-mb-sm row items-center">
                <div class="text-caption text-grey-7 q-mr-sm">Angle precision:</div>
                <q-btn-toggle
                  v-model="state.anglePrecision"
                  :options="[
                    { label: '2 decimals', value: 2 },
                    { label: '3 decimals', value: 3 }
                  ]"
                  spread
                  toggle-color="green"
                  toggle-text-color="black"
                  @update:model-value="handlePrecisionChange"
                />
              </div>

              <!-- Calculation Direction -->
              <div class="q-mb-sm">
                <div class="text-caption text-grey-7 q-mb-xs">Calculate from:</div>
                <q-btn-toggle
                  v-model="state.inputs.cylinderCalcMode"
                  :options="[
                    { label: 'Diameter', value: 'fromDiameter' },
                    { label: 'Stave Width', value: 'fromStaveWidth' }
                  ]"
                  spread
                  toggle-color="green"
                  toggle-text-color="black"
                  class="q-mb-sm"
                  @update:model-value="handleCylinderModeChange"
                />
              </div>

              <q-input
                v-if="state.inputs.cylinderCalcMode === 'fromDiameter'"
                v-model.number="state.inputs.diameter"
                type="number"
                step="0.1"
                dense
                outlined
                label="Diameter"
                suffix="in"
                class="q-mb-sm"
                :rules="[val => val > 0 || 'Must be > 0']"
              />

              <q-input
                v-if="state.inputs.cylinderCalcMode === 'fromStaveWidth'"
                v-model.number="state.inputs.staveWidth"
                type="number"
                step="0.1"
                dense
                outlined
                label="Stave Width"
                suffix="in"
                class="q-mb-sm"
                :rules="[val => val > 0 || 'Must be > 0']"
              />

              <q-input
                v-model.number="state.inputs.numberOfStaves"
                type="number"
                step="1"
                dense
                outlined
                label="Number of Staves"
                class="q-mb-sm"
                :rules="[val => val >= 3 || 'Min 3 staves for cylinder']"
              />

              <q-input
                v-model.number="state.inputs.staveThickness"
                type="number"
                step="0.001"
                dense
                outlined
                label="Stave Thickness (optional)"
                suffix="in"
                class="q-mb-sm"
                hint="Leave blank if not needed"
              />

              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <q-btn
                    type="submit"
                    color="primary"
                    label="Calculate"
                    class="full-width"
                    unelevated
                  />
                </div>
                <div class="col-6">
                  <q-btn
                    v-if="hasResults"
                    color="primary"
                    label="Reset"
                    class="full-width"
                    outline
                    @click="reset"
                  />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>

        <!-- Results Card - Cylinder Mode -->
        <q-card v-if="hasResults && state.cylinderResults" flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="text-subtitle2 text-weight-medium q-mb-sm">Results</div>

            <!-- Cylinder Visualization -->
            <div class="visualization-container q-mb-md">
              <div class="text-caption text-grey-7 q-mb-xs">
                Cross-Section View
                <span class="text-grey-6"> • Pinch to zoom • Double tap to reset</span>
              </div>
              <svg ref="svgRef" viewBox="0 0 400 280" class="cross-section-svg">
                <g :transform="transformAttr(200, 140)">
                  <!-- Draw the circle -->
                  <circle
                    cx="200"
                    cy="140"
                    r="100"
                    fill="none"
                    stroke="#1976d2"
                    stroke-width="3"
                  />

                  <!-- Draw stave division lines and angle markers -->
                  <g v-for="i in state.cylinderResults.numberOfStaves" :key="'stave-' + i">
                    <!-- Stave division line -->
                    <line
                      :x1="200 + 100 * Math.cos((i - 1) * 2 * Math.PI / state.cylinderResults.numberOfStaves)"
                      :y1="140 + 100 * Math.sin((i - 1) * 2 * Math.PI / state.cylinderResults.numberOfStaves)"
                      :x2="200 + 100 * Math.cos(i * 2 * Math.PI / state.cylinderResults.numberOfStaves)"
                      :y2="140 + 100 * Math.sin(i * 2 * Math.PI / state.cylinderResults.numberOfStaves)"
                      stroke="#90caf9"
                      stroke-width="2"
                      opacity="0.5"
                    />

                    <!-- Short angle marker line outside the circle -->
                    <line
                      :x1="200 + 100 * Math.cos(i * 2 * Math.PI / state.cylinderResults.numberOfStaves)"
                      :y1="140 + 100 * Math.sin(i * 2 * Math.PI / state.cylinderResults.numberOfStaves)"
                      :x2="200 + 125 * Math.cos(i * 2 * Math.PI / state.cylinderResults.numberOfStaves)"
                      :y2="140 + 125 * Math.sin(i * 2 * Math.PI / state.cylinderResults.numberOfStaves)"
                      stroke="#f57c00"
                      stroke-width="2"
                      stroke-dasharray="4,2"
                    />
                  </g>

                  <!-- Center label for blade tilt -->
                  <text
                    x="200"
                    y="140"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="angle-label-svg"
                    style="font-size: 14px;"
                  >
                    {{ state.cylinderResults.bladeTiltAngle }}°
                  </text>
                </g>
              </svg>
              <div class="text-caption text-grey-7 text-center q-mt-xs">
                Blue: cylinder outline | Light blue: staves | Orange: angle markers at joints
              </div>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium q-mb-sm">Cylinder Dimensions</div>
              <div class="text-caption text-grey-7 q-mb-md">
                Cut {{ state.cylinderResults.numberOfStaves }} staves using the following information:
              </div>

              <q-card flat bordered class="q-pa-md">
                <div class="row q-col-gutter-md" :class="{ 'q-mb-md': state.cylinderResults.convexWidth }">
                  <div class="col">
                    <div class="text-caption text-grey-6">Diameter</div>
                    <div class="text-h6 text-weight-bold">{{ state.cylinderResults.diameter }}"</div>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">{{ state.cylinderResults.convexWidth ? 'Concave Width' : 'Stave Width' }}</div>
                    <div class="text-h6 text-weight-bold">{{ state.cylinderResults.staveWidth }}"</div>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">Blade Tilt</div>
                    <div class="text-h6 text-weight-bold">{{ state.cylinderResults.bladeTiltAngle }}°</div>
                  </div>
                </div>
                <div v-if="state.cylinderResults.convexWidth" class="row q-col-gutter-md">
                  <div class="col">
                    <!-- Empty for spacing -->
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">Convex Width</div>
                    <div class="text-h6 text-weight-bold">{{ state.cylinderResults.convexWidth }}"</div>
                  </div>
                  <div class="col">
                    <!-- Empty for spacing -->
                  </div>
                </div>
              </q-card>
            </div>
          </q-card-section>

          <q-card-actions align="center" class="q-pa-sm">
            <q-btn
              flat
              dense
              color="primary"
              label="Copy Results"
              icon="content_copy"
              size="sm"
              @click="copyCylinderResults"
            />
          </q-card-actions>
        </q-card>

        <!-- Help Section -->
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
                  This tool calculates blade tilt angles for cylindrical coopering projects. The blade tilt is half of the joint angle between adjacent staves.
                </p>
                <p class="q-ma-none q-mb-xs">
                  <strong>How to use:</strong>
                </p>
                <ol class="q-ma-none q-pl-md q-mb-sm">
                  <li>Choose calculation direction: from diameter or from stave width</li>
                  <li>Enter the known dimension and number of staves (minimum 3)</li>
                  <li>Click Calculate to get the other dimension and blade tilt angle</li>
                  <li>Optional: Enter stave thickness to get convex width measurements</li>
                </ol>
                <p class="q-ma-none q-mb-xs">
                  <strong>Results:</strong>
                </p>
                <ul class="q-ma-none q-pl-md">
                  <li>All staves will be identical rectangles</li>
                  <li>Concave width is the inside measurement between joints</li>
                  <li>Convex width (if thickness provided) is the outside measurement</li>
                  <li>Blade tilt is the angle to set your table saw blade</li>
                </ul>
              </div>
            </q-card-section>
          </q-expansion-item>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Notify } from 'quasar';
import { useCurveCoopCalculator } from '../composables/useCurveCoopCalculator';
import { usePinchZoom } from '../composables/usePinchZoom';

const { state, hasResults, hasErrors, calculate, reset } = useCurveCoopCalculator();

// Pinch-to-zoom for visualization
const svgRef = ref<SVGElement | null>(null);
const { transformAttr, inverseScale } = usePinchZoom(svgRef);

onMounted(() => {
  // Set mode to cylinder on mount
  state.inputs.mode = 'cylinder';

  // Load angle precision preference from localStorage
  const savedPrecision = localStorage.getItem('curveCoopAnglePrecision');
  if (savedPrecision) {
    const precision = parseInt(savedPrecision);
    if (precision === 2 || precision === 3) {
      state.anglePrecision = precision;
    }
  }
});

function handleCylinderModeChange(): void {
  // Clear results when switching cylinder calculation mode
  state.cylinderResults = null;
  state.isCalculated = false;
  state.errors = [];
}

function handlePrecisionChange(): void {
  // Save preference to localStorage
  localStorage.setItem('curveCoopAnglePrecision', state.anglePrecision.toString());

  // Recalculate if results exist
  if (state.isCalculated) {
    calculate();
  }
}

function copyCylinderResults(): void {
  if (!state.cylinderResults) return;

  let text = `Cylinder Coopering Results\n========================\n`;
  text += `Number of Staves: ${state.cylinderResults.numberOfStaves}\n`;
  text += `Diameter: ${state.cylinderResults.diameter}"\n`;
  text += `Concave Width: ${state.cylinderResults.staveWidth}"\n`;
  if (state.cylinderResults.convexWidth) {
    text += `Convex Width: ${state.cylinderResults.convexWidth}"\n`;
  }
  text += `Blade Tilt: ${state.cylinderResults.bladeTiltAngle}°\n`;

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
.help-text {
  font-size: 0.9rem;
  line-height: 1.6;
}

.visualization-container {
  background-color: white;
  border-radius: 4px;
  padding: 8px;
}

.cross-section-svg {
  width: 100%;
  height: auto;
  display: block;
  touch-action: none;
  user-select: none;
  overflow: hidden;
}

.cross-section-svg g {
  transition: transform 0.1s ease-out;
}

.angle-label-svg {
  font-size: 10px;
  font-weight: 600;
  fill: #f57c00;
}
</style>
