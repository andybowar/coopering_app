<template>
  <q-page class="flex flex-center" style="padding: 16px;">
    <div class="row justify-center" style="width: 100%; max-width: 600px;">
      <div class="col-12">
        <!-- Header -->
        <div class="text-center q-mb-md">
          <h5 class="text-h5 q-mt-md q-mb-xs">Curve Coopering</h5>
          <p class="text-grey-7 q-ma-none">
            Calculate blade tilt angles for circular arcs. Perfect for curved chair seats.
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

              <!-- Arc Inputs -->
              <div>
                <q-input
                  v-model.number="state.inputs.totalLength"
                  type="number"
                  step="0.1"
                  dense
                  outlined
                  label="Overall Width (Chord Length)"
                  suffix="in"
                  class="q-mb-sm"
                  :rules="[val => val > 0 || 'Must be > 0']"
                />

                <!-- Radius Specification Method -->
                <div class="q-mb-sm">
                  <div class="text-caption text-grey-7 q-mb-xs">Specify radius by:</div>
                  <q-btn-toggle
                    v-model="radiusSpecMode"
                    :options="[
                      { label: 'Known Radius', value: 'known' },
                      { label: 'Chord + Sagitta', value: 'sagitta' }
                    ]"
                    spread
                    toggle-color="green"
                    toggle-text-color="black"
                    class="q-mb-sm"
                    @update:model-value="handleRadiusSpecChange"
                  />
                </div>

                <q-input
                  v-if="radiusSpecMode === 'known'"
                  v-model.number="state.inputs.radius"
                  type="number"
                  step="0.1"
                  dense
                  outlined
                  :label="state.inputs.useTaper ? 'Front Radius' : 'Radius'"
                  suffix="in"
                  class="q-mb-sm"
                  :rules="[val => val > 0 || 'Must be > 0']"
                />

                <q-input
                  v-if="radiusSpecMode === 'sagitta'"
                  v-model.number="sagitta"
                  type="number"
                  step="0.1"
                  dense
                  outlined
                  label="Sagitta (Arc Height)"
                  suffix="in"
                  class="q-mb-sm"
                  hint="Height from chord to arc peak"
                  :rules="[val => val > 0 || 'Must be > 0']"
                />

                <!-- Taper option -->
                <div class="q-mb-sm">
                  <q-checkbox
                    v-model="state.inputs.useTaper"
                    label="Use different back radius (tapered)"
                    dense
                    @update:model-value="handleTaperChange"
                  />
                </div>

                <!-- Back Radius Specification (only for taper mode) -->
                <div v-if="state.inputs.useTaper" class="q-mb-sm">
                  <div class="text-caption text-grey-7 q-mb-xs">Specify back radius by:</div>
                  <q-btn-toggle
                    v-model="backRadiusSpecMode"
                    :options="[
                      { label: 'Known Radius', value: 'known' },
                      { label: 'Chord + Sagitta', value: 'sagitta' }
                    ]"
                    spread
                    toggle-color="green"
                    toggle-text-color="black"
                    class="q-mb-sm"
                    @update:model-value="handleBackRadiusSpecChange"
                  />
                </div>

                <q-input
                  v-if="state.inputs.useTaper && backRadiusSpecMode === 'known'"
                  v-model.number="state.inputs.backRadius"
                  type="number"
                  step="0.1"
                  dense
                  outlined
                  label="Back Radius"
                  suffix="in"
                  class="q-mb-sm"
                  :rules="[val => val > 0 || 'Must be > 0']"
                />

                <q-input
                  v-if="state.inputs.useTaper && backRadiusSpecMode === 'sagitta'"
                  v-model.number="backSagitta"
                  type="number"
                  step="0.1"
                  dense
                  outlined
                  label="Back Sagitta (Arc Height)"
                  suffix="in"
                  class="q-mb-sm"
                  hint="Height from chord to back arc peak"
                  :rules="[val => val > 0 || 'Must be > 0']"
                />

                <q-input
                  v-if="state.inputs.useTaper"
                  v-model.number="state.inputs.depth"
                  type="number"
                  step="0.1"
                  dense
                  outlined
                  label="Depth (Front to Back)"
                  suffix="in"
                  class="q-mb-sm"
                  :rules="[val => val > 0 || 'Must be > 0']"
                />

                <!-- Taper reporting: angle on the saw, or an offset to mark out -->
                <div v-if="state.inputs.useTaper" class="q-mb-sm">
                  <div class="text-caption text-grey-7 q-mb-xs">Taper as:</div>
                  <q-btn-toggle
                    v-model="state.inputs.taperResultMode"
                    :options="[
                      { label: 'Angle', value: 'angle' },
                      { label: 'Rise / Run', value: 'riseRun' }
                    ]"
                    spread
                    toggle-color="green"
                    toggle-text-color="black"
                  />
                </div>

                <!-- Calculation Mode -->
                <div class="q-mb-sm">
                  <div class="text-caption text-grey-7 q-mb-xs">I know the:</div>
                  <q-btn-toggle
                    v-model="calculationMode"
                    :options="[
                      { label: 'Number of Staves', value: 'width' },
                      { label: 'Stave Width', value: 'count' }
                    ]"
                    spread
                    toggle-color="green"
                    toggle-text-color="black"
                    class="q-mb-sm"
                    @update:model-value="handleCalculationModeChange"
                  />
                </div>

                <q-input
                  v-if="calculationMode === 'width'"
                  v-model.number="state.inputs.numberOfStaves"
                  type="number"
                  step="1"
                  dense
                  outlined
                  label="Number of Staves"
                  class="q-mb-sm"
                  hint="Will calculate stave width"
                  :rules="[val => val >= 2 || 'Min 2 staves']"
                />

                <q-input
                  v-if="calculationMode === 'count'"
                  v-model.number="desiredStaveWidth"
                  type="number"
                  step="0.1"
                  dense
                  outlined
                  label="Stave Width"
                  suffix="in"
                  class="q-mb-sm"
                  hint="Will calculate number of staves needed"
                  :rules="[val => val > 0 || 'Must be > 0']"
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
              </div>

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

            <!-- Visualization -->
            <div class="visualization-container q-mb-md">
              <div class="text-caption text-grey-7 q-mb-xs">
                Cross-Section View
                <span class="text-grey-6"> • Scroll or pinch to zoom • Drag to pan • Double-click to reset</span>
              </div>
              <svg ref="svgRef" viewBox="0 0 400 280" class="cross-section-svg">
                <g :transform="transformAttr(200, 140)">
                  <!-- Draw the back curve (green dashed, for tapered mode) -->
                  <path
                    v-if="state.inputs.useTaper && state.outputs?.backNormalizedPoints"
                    :d="getBackCurvePath()"
                    fill="none"
                    stroke="#66bb6a"
                    stroke-width="2"
                    stroke-dasharray="6,4"
                    opacity="0.7"
                  />

                  <!-- Draw the front curve -->
                  <path
                    :d="getCurvePath()"
                    fill="none"
                    stroke="#1976d2"
                    stroke-width="3"
                  />

                  <!-- Draw stave lines -->
                  <line
                    v-for="(point, index) in state.outputs.normalizedPoints"
                    :key="'stave-' + index"
                    v-if="index < state.outputs.normalizedPoints.length - 1"
                    :x1="getScaledX(point.x)"
                    :y1="getScaledY(point.y)"
                    :x2="getScaledX(state.outputs.normalizedPoints[index + 1].x)"
                    :y2="getScaledY(state.outputs.normalizedPoints[index + 1].y)"
                    stroke="#90caf9"
                    stroke-width="2"
                    opacity="0.5"
                  />

                  <!-- Draw angle bisectors with labels at joints -->
                  <g
                    v-for="(bisector, index) in getAngleBisectors()"
                    :key="'bisector-' + index"
                  >
                    <!-- Bisector line -->
                    <line
                      :x1="bisector.x1"
                      :y1="bisector.y1"
                      :x2="bisector.x2"
                      :y2="bisector.y2"
                      stroke="#f57c00"
                      stroke-width="2"
                      stroke-dasharray="4,2"
                    />
                    <!-- Angle label -->
                    <text
                      :x="bisector.labelX"
                      :y="bisector.labelY"
                      text-anchor="middle"
                      class="angle-label-svg"
                      font-size="14"
                    >
                      {{ bisector.angle }}°
                    </text>
                  </g>
                </g>
              </svg>
              <div class="text-caption text-grey-7 text-center q-mt-xs">
                <span v-if="state.inputs.useTaper">
                  Blue (solid): Front curve | Green (dashed): Back curve | Light blue: staves | Orange: blade tilt angles
                </span>
                <span v-else>
                  Blue: coopering shape | Light blue: staves | Orange: angle bisectors with blade tilt
                </span>
              </div>
            </div>

            <!-- Calculated Values -->
            <div v-if="radiusSpecMode === 'sagitta' || (state.inputs.useTaper && backRadiusSpecMode === 'sagitta') || calculationMode === 'count'" class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium q-mb-sm">Calculated Values</div>
              <q-card flat bordered class="q-pa-md">
                <div class="row q-col-gutter-md">
                  <div v-if="radiusSpecMode === 'sagitta'" class="col">
                    <div class="text-caption text-grey-6">{{ state.inputs.useTaper ? 'Calculated Front Radius' : 'Calculated Radius' }}</div>
                    <div class="text-h6 text-weight-bold">{{ state.inputs.radius?.toFixed(4) }}"</div>
                  </div>
                  <div v-if="state.inputs.useTaper && backRadiusSpecMode === 'sagitta'" class="col">
                    <div class="text-caption text-grey-6">Calculated Back Radius</div>
                    <div class="text-h6 text-weight-bold">{{ state.inputs.backRadius?.toFixed(4) }}"</div>
                  </div>
                  <div v-if="calculationMode === 'count'" class="col">
                    <div class="text-caption text-grey-6">Calculated Staves</div>
                    <div class="text-h6 text-weight-bold">{{ state.inputs.numberOfStaves }}</div>
                  </div>
                </div>
              </q-card>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium q-mb-sm">Stave Dimensions</div>
              <div class="text-caption text-grey-7 q-mb-md">
                Cut {{ state.inputs.numberOfStaves }} staves using the following information:
              </div>

              <!-- Non-tapered dimensions -->
              <q-card v-if="!state.outputs.staves[0].backWidth" flat bordered class="q-pa-md">
                <div class="row q-col-gutter-md">
                  <div class="col">
                    <div class="text-caption text-grey-6">Blade Tilt</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0].bladeTiltAngle }}°</div>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">Concave Width</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0].width }}"</div>
                  </div>
                  <div v-if="state.outputs.staves[0].convexWidth" class="col">
                    <div class="text-caption text-grey-6">Convex Width</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0].convexWidth }}"</div>
                  </div>
                </div>
              </q-card>

              <!-- Tapered dimensions -->
              <q-card v-else flat bordered class="q-pa-md">
                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col">
                    <div class="text-caption text-grey-6">Blade Tilt</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0].bladeTiltAngle }}°</div>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">
                      {{ isTaperRiseRun ? 'Taper In (per edge)' : 'Taper Angle' }}
                    </div>
                    <div class="text-h6 text-weight-bold">
                      <template v-if="isTaperRiseRun">{{ state.outputs.staves[0].taperRise }}"</template>
                      <template v-else>{{ state.outputs.staves[0].taperAngle }}°</template>
                    </div>
                    <div v-if="isTaperRiseRun" class="text-caption text-grey-6">
                      over {{ state.outputs.staves[0].taperRun }}" ({{ state.outputs.staves[0].taperAngle }}°)
                    </div>
                  </div>
                </div>

                <!-- Rise/run taper needs the both-edges caveat spelled out -->
                <q-banner v-if="isTaperRiseRun" dense class="info-banner q-mb-md" rounded>
                  <div class="text-caption">
                    <strong>Taper In</strong> is the offset for <strong>one</strong> long edge,
                    measured over the {{ state.outputs.staves[0].taperRun }}" stave length.
                    <strong>Both</strong> long edges must be tapered by this amount, so the stave
                    narrows by twice this figure overall. Working from the wide end, measure in
                    {{ state.outputs.staves[0].taperRise }}" from each edge at the narrow end
                    and draw to the wide-end corners.
                  </div>
                </q-banner>
                <div class="row q-col-gutter-md q-mb-sm">
                  <div class="col">
                    <div class="text-caption text-grey-6">Front Concave</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0].width }}"</div>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">Back Concave</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0].backWidth }}"</div>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">Length</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0].length }}"</div>
                  </div>
                </div>
                <div v-if="state.outputs.staves[0].convexWidth" class="row q-col-gutter-md">
                  <div class="col">
                    <div class="text-caption text-grey-6">Front Convex</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0].convexWidth }}"</div>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">Back Convex</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0].backConvexWidth }}"</div>
                  </div>
                  <div class="col">
                    <!-- Empty column for alignment -->
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
                  This tool calculates blade tilt angles for curved coopering projects. The blade tilt is half of the joint angle (e.g., 90° joint = 45° blade tilt).
                </p>
                <p class="q-ma-none q-mb-xs">
                  <strong>Basic Usage:</strong>
                </p>
                <ol class="q-ma-none q-pl-md q-mb-sm">
                  <li>Enter the chord length (overall width)</li>
                  <li>Enter the radius OR specify chord + sagitta (arc height)</li>
                  <li>Enter number of staves OR desired stave width</li>
                  <li>Click Calculate</li>
                </ol>
                <p class="q-ma-none q-mb-xs">
                  <strong>Advanced Options:</strong>
                </p>
                <ul class="q-ma-none q-pl-md q-mb-sm">
                  <li><strong>Chord + Sagitta:</strong> If you don't know the radius, measure the chord (straight width) and sagitta (height from chord to arc peak). The radius will be calculated automatically.</li>
                  <li><strong>Calculate Number of Staves:</strong> Enter your desired stave width, and the tool will calculate how many staves you need.</li>
                  <li><strong>Tapered Mode:</strong> For projects with different front and back radii (frustum shape).</li>
                  <li><strong>Stave Thickness:</strong> Enter material thickness to get both concave (inner) and convex (outer) widths.</li>
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
import { ref, onMounted, computed } from 'vue';
import { Notify } from 'quasar';
import { useCurveCoopCalculator } from '../composables/useCurveCoopCalculator';
import { usePinchZoom } from '../composables/usePinchZoom';

const { state, hasResults, hasErrors, calculate: baseCalculate, reset } = useCurveCoopCalculator();

// Taper shown as a mark-out offset over the stave length instead of an angle
const isTaperRiseRun = computed(
  () =>
    state.inputs.useTaper &&
    state.inputs.taperResultMode === 'riseRun' &&
    state.outputs?.staves[0]?.taperRise !== undefined
);

// UI mode toggles
const radiusSpecMode = ref<'known' | 'sagitta'>('known');
const sagitta = ref<number | undefined>(undefined);
const backRadiusSpecMode = ref<'known' | 'sagitta'>('known');
const backSagitta = ref<number | undefined>(undefined);
const calculationMode = ref<'width' | 'count'>('width');
const desiredStaveWidth = ref<number | undefined>(undefined);

// Pinch-to-zoom for visualization
const svgRef = ref<SVGElement | null>(null);
const { transformAttr } = usePinchZoom(svgRef);


onMounted(() => {
  // Load angle precision preference from localStorage
  const savedPrecision = localStorage.getItem('curveCoopAnglePrecision');
  if (savedPrecision) {
    const precision = parseInt(savedPrecision);
    if (precision === 2 || precision === 3) {
      state.anglePrecision = precision;
    }
  }

  // Set mode to radius (arc mode)
  state.inputs.mode = 'radius';
});

function handleRadiusSpecChange(): void {
  // Clear results when switching radius specification mode
  state.outputs = null;
  state.isCalculated = false;
  state.errors = [];
}

function handleBackRadiusSpecChange(): void {
  // Clear results when switching back radius specification mode
  state.outputs = null;
  state.isCalculated = false;
  state.errors = [];
}

function handleCalculationModeChange(): void {
  // Clear results when switching calculation mode
  state.outputs = null;
  state.isCalculated = false;
  state.errors = [];
}

function calculate(): void {
  // Pre-process: Calculate front radius from chord + sagitta if needed
  if (radiusSpecMode.value === 'sagitta' && state.inputs.totalLength && sagitta.value) {
    // Formula: r = (s² + (c/2)²) / (2s)
    const c = state.inputs.totalLength;
    const s = sagitta.value;
    const calculatedRadius = (s * s + (c / 2) * (c / 2)) / (2 * s);
    state.inputs.radius = calculatedRadius;
  }

  // Pre-process: Calculate back radius from chord + sagitta if needed (for taper mode)
  if (state.inputs.useTaper && backRadiusSpecMode.value === 'sagitta' && state.inputs.totalLength && backSagitta.value) {
    // Formula: r = (s² + (c/2)²) / (2s)
    const c = state.inputs.totalLength;
    const s = backSagitta.value;
    const calculatedBackRadius = (s * s + (c / 2) * (c / 2)) / (2 * s);
    state.inputs.backRadius = calculatedBackRadius;
  }

  // Pre-process: Calculate number of staves from stave width if needed
  if (calculationMode.value === 'count' && desiredStaveWidth.value && state.inputs.radius && state.inputs.totalLength) {
    // Calculate central angle
    const chord = state.inputs.totalLength;
    const radius = state.inputs.radius;
    const halfAngleRad = Math.asin(chord / (2 * radius));
    const centralAngleRad = 2 * halfAngleRad;

    // Calculate number of staves from desired stave width
    // staveWidth = 2 × radius × sin(anglePerStave / 2)
    // anglePerStave = 2 × arcsin(staveWidth / (2 × radius))
    // numberOfStaves = centralAngle / anglePerStave
    const staveWidth = desiredStaveWidth.value;
    const anglePerStaveRad = 2 * Math.asin(staveWidth / (2 * radius));
    const calculatedStaves = Math.round(centralAngleRad / anglePerStaveRad);
    state.inputs.numberOfStaves = Math.max(2, calculatedStaves); // Minimum 2 staves
  }

  // Call the base calculate function
  baseCalculate();
}

function handleTaperChange(): void {
  // Clear results when toggling taper
  state.outputs = null;
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

function getCurvePath(): string {
  if (!state.outputs || state.outputs.normalizedPoints.length === 0) return '';

  const points = state.outputs.normalizedPoints;
  if (points.length < 2) return '';

  // Start the path
  let path = `M ${getScaledX(points[0].x)} ${getScaledY(points[0].y)}`;

  // Draw straight lines between normalized points (no additional smoothing)
  for (let i = 1; i < points.length; i++) {
    path += ` L ${getScaledX(points[i].x)} ${getScaledY(points[i].y)}`;
  }

  return path;
}

function getBackCurvePath(): string {
  if (!state.outputs || !state.outputs.backNormalizedPoints || state.outputs.backNormalizedPoints.length === 0) return '';

  const points = state.outputs.backNormalizedPoints;
  if (points.length < 2) return '';

  // Start the path
  let path = `M ${getScaledX(points[0].x)} ${getScaledY(points[0].y)}`;

  // Draw straight lines between normalized points
  for (let i = 1; i < points.length; i++) {
    path += ` L ${getScaledX(points[i].x)} ${getScaledY(points[i].y)}`;
  }

  return path;
}

function getAngleBisectors(): Array<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  labelX: number;
  labelY: number;
  angle: number;
}> {
  if (!state.outputs || state.outputs.normalizedPoints.length < 3) return [];

  const bisectors: Array<any> = [];
  const points = state.outputs.normalizedPoints;

  // Calculate bisector for each interior joint (skip first and last points)
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1];
    const p1 = points[i]; // Joint point
    const p2 = points[i + 1];

    // Scale points
    const x0 = getScaledX(p0.x);
    const y0 = getScaledY(p0.y);
    const x1 = getScaledX(p1.x);
    const y1 = getScaledY(p1.y);
    const x2 = getScaledX(p2.x);
    const y2 = getScaledY(p2.y);

    // Calculate vectors from joint
    const v1x = x0 - x1;
    const v1y = y0 - y1;
    const v2x = x2 - x1;
    const v2y = y2 - y1;

    // Normalize vectors
    const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const len2 = Math.sqrt(v2x * v2x + v2y * v2y);

    const n1x = v1x / len1;
    const n1y = v1y / len1;
    const n2x = v2x / len2;
    const n2y = v2y / len2;

    // Bisector direction (average of normalized vectors)
    const bisectorX = (n1x + n2x) / 2;
    const bisectorY = (n1y + n2y) / 2;

    // Normalize bisector
    const bisectorLen = Math.sqrt(bisectorX * bisectorX + bisectorY * bisectorY);
    let normBisectorX = bisectorX / bisectorLen;
    let normBisectorY = bisectorY / bisectorLen;

    // Alternate direction: flip every other bisector
    const direction = (i % 2 === 0) ? -1 : 1;
    normBisectorX *= direction;
    normBisectorY *= direction;

    // Bisector line length
    const lineLength = 30;

    bisectors.push({
      x1: x1,
      y1: y1,
      x2: x1 + normBisectorX * lineLength,
      y2: y1 + normBisectorY * lineLength,
      labelX: x1 + normBisectorX * (lineLength + 10),
      labelY: y1 + normBisectorY * (lineLength + 10),
      angle: state.outputs.staves[i - 1]?.bladeTiltAngle || 0
    });
  }

  return bisectors;
}

function getDisplayHeight(): number {
  // Calculate height from arc points
  if (!state.outputs || state.outputs.normalizedPoints.length === 0) return 0;
  return Math.max(...state.outputs.normalizedPoints.map(p => p.y));
}

function getUniformScale(): number {
  // Calculate scale factor that preserves aspect ratio
  const length = state.inputs.totalLength || 1;
  const height = getDisplayHeight() || 1;

  // Available space: 340px wide, 210px tall
  const scaleX = 340 / length;
  const scaleY = 210 / height;

  // Use the smaller scale to ensure everything fits
  return Math.min(scaleX, scaleY);
}

function getScaledX(inchX: number): number {
  if (!state.inputs.totalLength) return 40;

  const scale = getUniformScale();
  const length = state.inputs.totalLength;

  // Center horizontally in the available 340px space
  const scaledWidth = length * scale;
  const offsetX = 40 + (340 - scaledWidth) / 2;

  return offsetX + inchX * scale;
}

function getScaledY(inchY: number): number {
  const height = getDisplayHeight();
  if (!height) return 230;

  const scale = getUniformScale();

  // Center vertically in the available 210px space
  const scaledHeight = height * scale;
  const offsetY = 230 - (210 - scaledHeight) / 2;

  // Map inch coordinates to SVG pixels (Y axis is inverted in SVG)
  return offsetY - inchY * scale;
}

function copyResults(): void {
  if (!state.outputs) return;

  const firstStave = state.outputs.staves[0];
  let text = `Curve Coopering Results\n========================\n`;

  if (state.inputs.useTaper) {
    text += `Front Radius: ${state.inputs.radius}"\n`;
    text += `Back Radius: ${state.inputs.backRadius}"\n`;
    text += `Depth: ${state.inputs.depth}"\n`;
  } else {
    text += `Radius: ${state.inputs.radius}"\n`;
  }
  text += `Width: ${state.inputs.totalLength}"\n`;
  text += `Number of Staves: ${state.inputs.numberOfStaves}\n\n`;
  text += `Stave Dimensions (all staves identical):\n`;
  text += `Blade Tilt: ${firstStave.bladeTiltAngle}°\n`;

  if (firstStave.backWidth) {
    // Tapered stave
    if (isTaperRiseRun.value) {
      text += `Taper: measure in ${firstStave.taperRise}" on EACH long edge over the ${firstStave.taperRun}" length (${firstStave.taperAngle}°)\n`;
    } else {
      text += `Taper Angle: ${firstStave.taperAngle}°\n`;
    }
    text += `Front Concave Width: ${firstStave.width}"\n`;
    text += `Back Concave Width: ${firstStave.backWidth}"\n`;
    if (firstStave.convexWidth) {
      text += `Front Convex Width: ${firstStave.convexWidth}"\n`;
      text += `Back Convex Width: ${firstStave.backConvexWidth}"\n`;
    }
    text += `Length: ${firstStave.length}"\n`;
  } else {
    // Regular stave
    text += `Concave Width: ${firstStave.width}"\n`;
    if (firstStave.convexWidth) {
      text += `Convex Width: ${firstStave.convexWidth}"\n`;
    }
  }

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


.angle-label-svg {
  font-weight: 600;
  fill: #f57c00;
}
</style>
