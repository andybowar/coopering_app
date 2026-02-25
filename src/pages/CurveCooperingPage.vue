<template>
  <q-page class="flex flex-center" style="padding: 16px;">
    <div class="row justify-center" style="width: 100%; max-width: 600px;">
      <div class="col-12">
        <!-- Header -->
        <div class="text-center q-mb-md">
          <h5 class="text-h5 q-mt-md q-mb-xs">Curve Coopering</h5>
          <p class="text-grey-7 q-ma-none">
            Calculate blade tilt angles for circular arcs or cylinders. Perfect for curved chair seats or cylindrical projects.
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
              <!-- Mode Selector -->
              <div class="q-mb-sm">
                <div class="text-caption text-grey-7 q-mb-xs">Mode:</div>
                <q-btn-toggle
                  v-model="state.inputs.mode"
                  :options="[
                    { label: 'Arc', value: 'radius' },
                    { label: 'Cylinder', value: 'cylinder' }
                  ]"
                  spread
                  toggle-color="primary"
                  toggle-text-color="white"
                  @update:model-value="handleModeChange"
                />
              </div>

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

              <!-- Arc Mode Inputs -->
              <div v-if="state.inputs.mode === 'radius'">
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

                <q-input
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

                <!-- Taper option -->
                <div class="q-mb-sm">
                  <q-checkbox
                    v-model="state.inputs.useTaper"
                    label="Use different back radius (tapered)"
                    dense
                    @update:model-value="handleTaperChange"
                  />
                </div>

                <q-input
                  v-if="state.inputs.useTaper"
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

                <q-input
                  v-model.number="state.inputs.numberOfStaves"
                  type="number"
                  step="1"
                  dense
                  outlined
                  label="Number of Staves"
                  class="q-mb-sm"
                  :rules="[val => val >= 2 || 'Min 2 staves']"
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

              <!-- Cylinder Mode Inputs -->
              <div v-if="state.inputs.mode === 'cylinder'">
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

        <!-- Results Card - Arc Mode -->
        <q-card v-if="hasResults && state.outputs && state.inputs.mode === 'radius'" flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="text-subtitle2 text-weight-medium q-mb-sm">Results</div>

            <!-- Visualization -->
            <div class="visualization-container q-mb-md">
              <div class="text-caption text-grey-7 q-mb-xs">Cross-Section View</div>
              <svg viewBox="0 0 400 280" class="cross-section-svg">
                <!-- Draw the curve (no additional smoothing, just the normalized points) -->
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
                  >
                    {{ bisector.angle }}°
                  </text>
                </g>
              </svg>
              <div class="text-caption text-grey-7 text-center q-mt-xs">
                Blue: coopering shape | Light blue: staves | Orange: angle bisectors with blade tilt
              </div>
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
                    <div class="text-caption text-grey-6">Taper Angle</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0].taperAngle }}°</div>
                  </div>
                </div>
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

        <!-- Results Card - Cylinder Mode -->
        <q-card v-if="hasResults && state.cylinderResults && state.inputs.mode === 'cylinder'" flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="text-subtitle2 text-weight-medium q-mb-sm">Results</div>

            <!-- Cylinder Visualization -->
            <div class="visualization-container q-mb-md">
              <div class="text-caption text-grey-7 q-mb-xs">Cross-Section View</div>
              <svg viewBox="0 0 400 280" class="cross-section-svg">
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
                  This tool calculates blade tilt angles for curved coopering projects. The blade tilt is half of the joint angle (e.g., 90° joint = 45° blade tilt).
                </p>
                <p class="q-ma-none q-mb-xs">
                  <strong>Arc Mode:</strong> Perfect for circular arcs like chair seats.
                </p>
                <ol class="q-ma-none q-pl-md q-mb-sm">
                  <li>Enter the radius (e.g., 95" for a chair)</li>
                  <li>Enter the arc width and number of staves</li>
                  <li>Click Calculate - all staves will have identical angles</li>
                  <li>Optional: Enable tapered mode for projects with different front and back radii</li>
                </ol>
                <p class="q-ma-none q-mb-xs">
                  <strong>Cylinder Mode:</strong> For cylindrical projects like vessels or columns.
                </p>
                <ol class="q-ma-none q-pl-md">
                  <li>Choose calculation direction: from diameter or from stave width</li>
                  <li>Enter the known dimension and number of staves</li>
                  <li>Get the calculated dimension and blade tilt angle</li>
                  <li>All staves will be identical rectangles</li>
                </ol>
              </div>
            </q-card-section>
          </q-expansion-item>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Notify } from 'quasar';
import { useCurveCoopCalculator } from '../composables/useCurveCoopCalculator';

const { state, hasResults, hasErrors, calculate, reset } = useCurveCoopCalculator();

onMounted(() => {
  // Load angle precision preference from localStorage
  const savedPrecision = localStorage.getItem('curveCoopAnglePrecision');
  if (savedPrecision) {
    const precision = parseInt(savedPrecision);
    if (precision === 2 || precision === 3) {
      state.anglePrecision = precision;
    }
  }

});

function handleModeChange(): void {
  // Clear results when switching modes
  state.outputs = null;
  state.cylinderResults = null;
  state.isCalculated = false;
  state.errors = [];
}

function handleCylinderModeChange(): void {
  // Clear results when switching cylinder calculation mode
  state.cylinderResults = null;
  state.isCalculated = false;
  state.errors = [];
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
  if (state.inputs.mode === 'radius') {
    // Calculate height from arc points
    if (!state.outputs || state.outputs.normalizedPoints.length === 0) return 0;
    return Math.max(...state.outputs.normalizedPoints.map(p => p.y));
  } else {
    // Use totalHeight for draw mode
    return state.inputs.totalHeight || 0;
  }
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
    text += `Taper Angle: ${firstStave.taperAngle}°\n`;
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
}

.angle-label-svg {
  font-size: 10px;
  font-weight: 600;
  fill: #f57c00;
}
</style>
