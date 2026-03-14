<template>
  <q-page class="flex flex-center" style="padding: 16px;">
    <div class="row justify-center" style="width: 100%; max-width: 600px;">
      <div class="col-12">
        <!-- Header -->
        <div class="text-center q-mb-md">
          <h5 class="text-h5 q-mt-md q-mb-xs">Ellipse Coopering</h5>
          <p class="text-grey-7 q-ma-none">
            Calculate blade tilt angles and dimensions for elliptical coopering projects. Shows dimensions for the complete ellipse.
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

              <!-- Length (Major Axis) -->
              <q-input
                v-model.number="state.inputs.length"
                type="number"
                step="0.1"
                dense
                outlined
                label="Length (Major Axis)"
                suffix="in"
                class="q-mb-sm"
                :rules="[val => val > 0 || 'Must be > 0']"
              />

              <!-- Width (Minor Axis) -->
              <q-input
                v-model.number="state.inputs.width"
                type="number"
                step="0.1"
                dense
                outlined
                label="Width (Minor Axis)"
                suffix="in"
                class="q-mb-sm"
                :rules="[val => val > 0 || 'Must be > 0']"
              />

              <!-- Calculation Mode Toggle -->
              <div class="q-mb-sm">
                <div class="text-caption text-grey-7 q-mb-xs">I know the:</div>
                <q-btn-toggle
                  v-model="calculationMode"
                  :options="[
                    { label: 'Number of Staves', value: 'width' },
                    { label: 'Average Stave Width', value: 'count' }
                  ]"
                  spread
                  toggle-color="green"
                  toggle-text-color="black"
                  class="q-mb-sm"
                  @update:model-value="handleCalculationModeChange"
                />
              </div>

              <!-- Conditional: Number of Staves -->
              <q-input
                v-if="calculationMode === 'width'"
                v-model.number="state.inputs.numberOfStaves"
                type="number"
                step="1"
                dense
                outlined
                label="Number of Staves"
                class="q-mb-sm"
                hint="For the complete ellipse"
                :rules="[val => val >= 4 || 'Min 4 staves']"
              />

              <!-- Conditional: Average Stave Width -->
              <q-input
                v-if="calculationMode === 'count'"
                v-model.number="state.inputs.staveWidth"
                type="number"
                step="0.1"
                dense
                outlined
                label="Average Stave Width"
                suffix="in"
                class="q-mb-sm"
                hint="Target average width (staves will vary)"
                :rules="[val => val > 0 || 'Must be > 0']"
              />

              <div v-if="calculationMode === 'count'" class="text-caption text-grey-7 q-mb-sm">
                Note: Due to the ellipse's varying curvature, individual stave widths will differ from the average.
              </div>

              <!-- Stave Thickness (Optional) -->
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

              <!-- Buttons -->
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

        <!-- Results Card -->
        <q-card v-if="hasResults && state.outputs" flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="text-subtitle2 text-weight-medium q-mb-sm">Results</div>

            <!-- Calculated Values Card (if calculating count) -->
            <q-card v-if="calculationMode === 'count'" flat bordered class="q-pa-md q-mb-md">
              <div class="text-caption text-grey-6">Calculated Staves</div>
              <div class="text-h6 text-weight-bold">{{ state.outputs.totalStaves }}</div>
            </q-card>

            <!-- Ellipse Visualization -->
            <div class="visualization-container q-mb-md">
              <div class="text-caption text-grey-7 q-mb-xs">
                Quarter Ellipse View
                <span class="text-grey-6"> • Pinch to zoom • Double tap to reset</span>
              </div>
              <svg ref="svgRef" viewBox="-10 -10 420 320" class="ellipse-svg">
                <g :transform="transformAttr(200, 145)">
                  <!-- Draw the ellipse outline (quarter) -->
                  <path
                    :d="getEllipsePath()"
                    fill="none"
                    stroke="#1976d2"
                    stroke-width="3"
                  />

                  <!-- Draw stave chord lines and angle markers -->
                  <g v-for="(stave, index) in state.outputs.staves" :key="'stave-' + index">
                    <!-- Chord line for this stave -->
                    <line
                      :x1="getEllipseX(stave.startAngle)"
                      :y1="getEllipseY(stave.startAngle)"
                      :x2="getEllipseX(stave.endAngle)"
                      :y2="getEllipseY(stave.endAngle)"
                      stroke="#90caf9"
                      stroke-width="2"
                      opacity="0.5"
                    />

                    <!-- Angle marker at start joint -->
                    <g>
                      <!-- Short angle marker line -->
                      <line
                        :x1="getEllipseX(stave.startAngle)"
                        :y1="getEllipseY(stave.startAngle)"
                        :x2="getMarkerX(stave.startAngle, index)"
                        :y2="getMarkerY(stave.startAngle, index)"
                        stroke="#f57c00"
                        stroke-width="2"
                        stroke-dasharray="4,2"
                      />
                      <!-- Angle label -->
                      <text
                        :x="getLabelX(stave.startAngle, index)"
                        :y="getLabelY(stave.startAngle, index)"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        class="angle-label-svg"
                        style="font-size: 12px;"
                      >
                        {{ stave.startBladeTilt }}°
                      </text>
                    </g>

                    <!-- Angle marker at end joint -->
                    <g>
                      <!-- Short angle marker line -->
                      <line
                        :x1="getEllipseX(stave.endAngle)"
                        :y1="getEllipseY(stave.endAngle)"
                        :x2="getMarkerX(stave.endAngle, index)"
                        :y2="getMarkerY(stave.endAngle, index)"
                        stroke="#f57c00"
                        stroke-width="2"
                        stroke-dasharray="4,2"
                      />
                      <!-- Angle label -->
                      <text
                        :x="getLabelX(stave.endAngle, index)"
                        :y="getLabelY(stave.endAngle, index)"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        class="angle-label-svg"
                        style="font-size: 12px;"
                      >
                        {{ stave.endBladeTilt }}°
                      </text>
                    </g>
                  </g>
                </g>
              </svg>
              <div class="text-caption text-grey-7 text-center q-mt-xs">
                Blue: ellipse outline | Light blue: staves | Orange: blade tilt angles at joints
              </div>
            </div>

            <!-- Staves Table -->
            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium q-mb-sm">Stave Dimensions</div>
              <div class="text-caption text-grey-7 q-mb-sm">
                Each stave has different dimensions due to the ellipse's varying curvature.
              </div>

              <q-table
                :rows="state.outputs.staves"
                :columns="tableColumns"
                row-key="index"
                flat
                bordered
                dense
                :pagination="{ rowsPerPage: 0 }"
                hide-pagination
                class="staves-table"
              />
            </div>

            <!-- Summary -->
            <q-card flat bordered class="q-pa-md">
              <div class="text-caption text-grey-6">Total Staves</div>
              <div class="text-h6 text-weight-bold">{{ state.outputs.totalStaves }}</div>
            </q-card>
          </q-card-section>

          <q-card-actions align="center" class="q-pa-sm">
            <q-btn
              flat
              dense
              color="primary"
              label="Copy Results"
              icon="content_copy"
              size="sm"
              @click="copyResults"
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
                  This tool calculates blade tilt angles and dimensions for a complete ellipse. Since an ellipse has varying curvature, each stave will have different dimensions.
                </p>
                <p class="q-ma-none q-mb-xs">
                  <strong>How to use:</strong>
                </p>
                <ol class="q-ma-none q-pl-md q-mb-sm">
                  <li>Enter the ellipse length (major axis) and width (minor axis)</li>
                  <li>Choose calculation mode: specify number of staves or desired average stave width</li>
                  <li>Click Calculate to get blade tilt angles and dimensions for each stave</li>
                  <li>Optional: Enter stave thickness to get both concave and convex widths</li>
                </ol>
                <p class="q-ma-none q-mb-xs">
                  <strong>Understanding the results:</strong>
                </p>
                <ul class="q-ma-none q-pl-md">
                  <li>Start and end angles show the blade tilt at each end of the stave</li>
                  <li>Concave width is the chord length on the inside surface</li>
                  <li>Convex width (if thickness provided) is the chord length on the outside surface</li>
                  <li>Each stave will be different due to the ellipse's varying curvature</li>
                  <li>Results show the complete ellipse with all staves needed</li>
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
import { ref, computed, onMounted } from 'vue';
import { Notify } from 'quasar';
import { useEllipseCalculator } from '../composables/useEllipseCalculator';
import { usePinchZoom } from '../composables/usePinchZoom';
import type { QTableColumn } from 'quasar';

const { state, hasResults, hasErrors, calculate: baseCalculate, reset } = useEllipseCalculator();

const calculationMode = ref<'width' | 'count'>('width');

// Pinch-to-zoom for visualization
const svgRef = ref<SVGElement | null>(null);
const { transformAttr, inverseScale, resetZoom } = usePinchZoom(svgRef);

// Table columns configuration
const tableColumns = computed<QTableColumn[]>(() => {
  const columns: QTableColumn[] = [
    {
      name: 'index',
      label: 'Stave #',
      field: 'index',
      align: 'center',
      sortable: false
    },
    {
      name: 'startBladeTilt',
      label: 'Start Angle',
      field: 'startBladeTilt',
      align: 'center',
      sortable: false,
      format: (val: number) => `${val}°`
    },
    {
      name: 'endBladeTilt',
      label: 'End Angle',
      field: 'endBladeTilt',
      align: 'center',
      sortable: false,
      format: (val: number) => `${val}°`
    },
    {
      name: 'concaveWidth',
      label: 'Concave Width',
      field: 'concaveWidth',
      align: 'center',
      sortable: false,
      format: (val: number) => `${val}"`
    }
  ];

  // Add convex width column if thickness is specified
  if (state.inputs.staveThickness && state.outputs?.staves[0]?.convexWidth !== undefined) {
    columns.push({
      name: 'convexWidth',
      label: 'Convex Width',
      field: 'convexWidth',
      align: 'center',
      sortable: false,
      format: (val: number) => `${val}"`
    });
  }

  return columns;
});

onMounted(() => {
  // Load angle precision preference from localStorage
  const savedPrecision = localStorage.getItem('ellipseAnglePrecision');
  if (savedPrecision) {
    const precision = parseInt(savedPrecision);
    if (precision === 2 || precision === 3) {
      state.anglePrecision = precision;
    }
  }
});

function handlePrecisionChange(): void {
  // Save preference to localStorage
  localStorage.setItem('ellipseAnglePrecision', state.anglePrecision.toString());

  // Recalculate if results exist
  if (state.isCalculated) {
    calculate();
  }
}

function handleCalculationModeChange(): void {
  // Clear results when switching calculation mode
  state.outputs = null;
  state.isCalculated = false;
  state.errors = [];
}

function calculate(): void {
  baseCalculate(calculationMode.value);
}

function copyResults(): void {
  if (!state.outputs) return;

  let text = `Ellipse Coopering Results\n========================\n`;
  text += `Length (Major Axis): ${state.inputs.length}"\n`;
  text += `Width (Minor Axis): ${state.inputs.width}"\n`;
  text += `Total Staves: ${state.outputs.totalStaves}\n`;
  if (state.inputs.staveThickness) {
    text += `Stave Thickness: ${state.inputs.staveThickness}"\n`;
  }
  text += `\nStave Details:\n`;
  text += `${'Stave #'.padEnd(10)}${'Start°'.padEnd(10)}${'End°'.padEnd(10)}${'Concave"'.padEnd(12)}`;

  if (state.outputs.staves[0]?.convexWidth !== undefined) {
    text += `${'Convex"'.padEnd(12)}`;
  }
  text += `\n`;

  state.outputs.staves.forEach((stave) => {
    text += `${String(stave.index).padEnd(10)}`;
    text += `${String(stave.startBladeTilt).padEnd(10)}`;
    text += `${String(stave.endBladeTilt).padEnd(10)}`;
    text += `${String(stave.concaveWidth).padEnd(12)}`;
    if (stave.convexWidth !== undefined) {
      text += `${String(stave.convexWidth).padEnd(12)}`;
    }
    text += `\n`;
  });

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

// Visualization helper functions
function getEllipsePath(): string {
  if (!state.outputs) return '';

  const centerX = 200;
  const centerY = 145;
  const scaleX = 340 / state.inputs.length;
  const scaleY = 240 / state.inputs.width;
  const scale = Math.min(scaleX, scaleY);

  const a = (state.inputs.length / 2) * scale;
  const b = (state.inputs.width / 2) * scale;

  // Create path for full ellipse (0° to 360°)
  const steps = 100;
  let path = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (2 * Math.PI); // 0 to 360 degrees in radians
    const x = centerX + a * Math.cos(t);
    const y = centerY - b * Math.sin(t);
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return path;
}

function getEllipseX(angleDegrees: number): number {
  const centerX = 200;
  const scaleX = 340 / state.inputs.length;
  const scaleY = 240 / state.inputs.width;
  const scale = Math.min(scaleX, scaleY);

  const a = (state.inputs.length / 2) * scale;
  const angleRad = (angleDegrees * Math.PI) / 180;
  return centerX + a * Math.cos(angleRad);
}

function getEllipseY(angleDegrees: number): number {
  const centerY = 145;
  const scaleX = 340 / state.inputs.length;
  const scaleY = 240 / state.inputs.width;
  const scale = Math.min(scaleX, scaleY);

  const b = (state.inputs.width / 2) * scale;
  const angleRad = (angleDegrees * Math.PI) / 180;
  return centerY - b * Math.sin(angleRad);
}

function getMarkerX(angleDegrees: number, index: number): number {
  const ellipseX = getEllipseX(angleDegrees);
  const centerX = 200;
  const dx = ellipseX - centerX;
  const distance = Math.sqrt(dx * dx + (getEllipseY(angleDegrees) - 145) * (getEllipseY(angleDegrees) - 145));

  // All markers go outward
  return centerX + (dx / distance) * (distance + 20);
}

function getMarkerY(angleDegrees: number, index: number): number {
  const ellipseY = getEllipseY(angleDegrees);
  const centerY = 145;
  const dy = ellipseY - centerY;
  const dx = getEllipseX(angleDegrees) - 200;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // All markers go outward
  return centerY + (dy / distance) * (distance + 20);
}

function getLabelX(angleDegrees: number, index: number): number {
  const ellipseX = getEllipseX(angleDegrees);
  const centerX = 200;
  const dx = ellipseX - centerX;
  const distance = Math.sqrt(dx * dx + (getEllipseY(angleDegrees) - 145) * (getEllipseY(angleDegrees) - 145));

  // All labels go outward
  return centerX + (dx / distance) * (distance + 36);
}

function getLabelY(angleDegrees: number, index: number): number {
  const ellipseY = getEllipseY(angleDegrees);
  const centerY = 145;
  const dy = ellipseY - centerY;
  const dx = getEllipseX(angleDegrees) - 200;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // All labels go outward
  return centerY + (dy / distance) * (distance + 36);
}
</script>

<style scoped>
.help-text {
  font-size: 0.9rem;
  line-height: 1.6;
}

.staves-table {
  font-size: 0.85rem;
}

.staves-table :deep(.q-table__container) {
  background-color: rgba(255, 255, 255, 0.02);
}

.staves-table :deep(th) {
  font-weight: 600;
  background-color: rgba(25, 118, 210, 0.15);
}

.staves-table :deep(tbody tr:nth-child(odd)) {
  background-color: rgba(255, 255, 255, 0.02);
}

.staves-table :deep(tbody tr:hover) {
  background-color: rgba(255, 255, 255, 0.05);
}

.visualization-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ellipse-svg {
  width: 100%;
  max-width: 700px;
  height: auto;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px;
  touch-action: none;
  user-select: none;
  overflow: hidden;
}

.ellipse-svg g {
  transition: transform 0.1s ease-out;
}

.angle-label-svg {
  fill: #f57c00;
  font-weight: 600;
  font-size: 12px;
}
</style>
