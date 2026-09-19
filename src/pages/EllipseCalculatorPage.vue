<template>
  <q-page class="flex flex-center" style="padding: 16px;">
    <div class="row justify-center" style="width: 100%; max-width: 600px;">
      <div class="col-12">
        <!-- Header -->
        <div class="text-center q-mb-md">
          <h5 class="text-h5 q-mt-md q-mb-xs">Ellipse &amp; Cylinder Coopering</h5>
          <p class="text-grey-7 q-ma-none">
            Calculate blade tilt angles and dimensions for elliptical and cylindrical coopering projects. Choose Circle for a cylinder, vessel, or column, where every stave is identical.
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

              <!-- Shape: ellipse (two axes) or circle (single diameter) -->
              <div class="q-mb-sm">
                <div class="text-caption text-grey-7 q-mb-xs">Shape:</div>
                <q-btn-toggle
                  v-model="state.inputs.shape"
                  :options="[
                    { label: 'Ellipse', value: 'ellipse' },
                    { label: 'Circle', value: 'circle' }
                  ]"
                  spread
                  toggle-color="green"
                  toggle-text-color="black"
                  class="q-mb-sm"
                  @update:model-value="handleShapeChange"
                />
              </div>

              <!-- Length (Major Axis) -->
              <q-input
                v-if="isEllipse"
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
                v-if="isEllipse"
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

              <!-- Circle: which quantity is known. Not offered for a cone,
                   where the stave width varies along the stave's length. -->
              <div v-if="!isEllipse && !state.inputs.useConical" class="q-mb-sm">
                <div class="text-caption text-grey-7 q-mb-xs">Calculate from:</div>
                <q-btn-toggle
                  v-model="state.inputs.circleCalcMode"
                  :options="[
                    { label: 'Diameter', value: 'fromDiameter' },
                    { label: 'Stave Width', value: 'fromStaveWidth' }
                  ]"
                  spread
                  toggle-color="green"
                  toggle-text-color="black"
                  class="q-mb-sm"
                  @update:model-value="handleCircleModeChange"
                />
              </div>

              <!-- Circle: diameter (Side A when conical) -->
              <q-input
                v-if="!isEllipse && (state.inputs.useConical || state.inputs.circleCalcMode === 'fromDiameter')"
                v-model.number="state.inputs.diameter"
                type="number"
                step="0.1"
                dense
                outlined
                :label="state.inputs.useConical ? 'Side A Diameter' : 'Diameter'"
                suffix="in"
                class="q-mb-sm"
                :rules="[val => val > 0 || 'Must be > 0']"
              />

              <!-- Circle: stave width (solves for diameter) -->
              <q-input
                v-if="!isEllipse && !state.inputs.useConical && state.inputs.circleCalcMode === 'fromStaveWidth'"
                v-model.number="state.inputs.staveWidth"
                type="number"
                step="0.1"
                dense
                outlined
                label="Stave Width"
                suffix="in"
                class="q-mb-sm"
                hint="Every stave is identical, so the diameter follows"
                :rules="[val => val > 0 || 'Must be > 0']"
              />

              <!-- Conical option -->
              <div class="q-mb-sm">
                <q-checkbox
                  v-model="state.inputs.useConical"
                  :label="isEllipse ? 'Conical Ellipse' : 'Cone (tapered)'"
                  dense
                  @update:model-value="handleConicalChange"
                />
              </div>

              <!-- Circle cone: Side B diameter and depth -->
              <q-input
                v-if="!isEllipse && state.inputs.useConical"
                v-model.number="state.inputs.sideBDiameter"
                type="number"
                step="0.1"
                dense
                outlined
                label="Side B Diameter"
                suffix="in"
                class="q-mb-sm"
                hint="The other end of the cone"
                :rules="[val => val > 0 || 'Must be > 0']"
              />

              <q-input
                v-if="!isEllipse && state.inputs.useConical"
                v-model.number="state.inputs.depth"
                type="number"
                step="0.1"
                dense
                outlined
                label="Depth (Side A to Side B)"
                suffix="in"
                class="q-mb-sm"
                :rules="[val => val > 0 || 'Must be > 0']"
              />

              <!-- Side B Ellipse Dimensions (only for conical mode) -->
              <q-input
                v-if="isEllipse && state.inputs.useConical"
                v-model.number="state.inputs.sideBLength"
                type="number"
                step="0.1"
                dense
                outlined
                label="Side B Length (Major Axis)"
                suffix="in"
                class="q-mb-sm"
                :rules="[val => val > 0 || 'Must be > 0']"
              />

              <q-input
                v-if="isEllipse && state.inputs.useConical"
                v-model.number="state.inputs.sideBWidth"
                type="number"
                step="0.1"
                dense
                outlined
                label="Side B Width (Minor Axis)"
                suffix="in"
                class="q-mb-sm"
                :rules="[val => val > 0 || 'Must be > 0']"
              />

              <q-input
                v-if="isEllipse && state.inputs.useConical"
                v-model.number="state.inputs.depth"
                type="number"
                step="0.1"
                dense
                outlined
                label="Depth (Side A to Side B)"
                suffix="in"
                class="q-mb-sm"
                :rules="[val => val > 0 || 'Must be > 0']"
              />

              <!-- Calculation Mode Toggle (ellipse only; circle has its own above) -->
              <div v-if="isEllipse" class="q-mb-sm">
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

              <!-- Number of Staves: always needed in circle mode, and in
                   ellipse mode when the count is the known quantity -->
              <q-input
                v-if="!isEllipse || calculationMode === 'width'"
                v-model.number="state.inputs.numberOfStaves"
                type="number"
                step="1"
                dense
                outlined
                label="Number of Staves"
                class="q-mb-sm"
                :hint="isEllipse ? 'For the complete ellipse' : 'For the complete circle'"
                :rules="[val => val >= MIN_STAVES || `Min ${MIN_STAVES} staves`]"
              />

              <!-- Conditional: Average Stave Width (ellipse only) -->
              <q-input
                v-if="isEllipse && calculationMode === 'count'"
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

              <div v-if="isEllipse && calculationMode === 'count'" class="text-caption text-grey-7 q-mb-sm">
                Note: Due to the ellipse's varying curvature, individual stave widths will differ from the average.
              </div>

              <!-- Taper reporting: angle on the saw, or an offset to mark out -->
              <div v-if="state.inputs.useConical" class="q-mb-sm">
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
                  class="q-mb-sm"
                />
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
            <q-card v-if="isEllipse && calculationMode === 'count'" flat bordered class="q-pa-md q-mb-md">
              <div class="text-caption text-grey-6">Calculated Staves</div>
              <div class="text-h6 text-weight-bold">{{ state.outputs.totalStaves }}</div>
            </q-card>

            <!-- Circle summary: every stave is identical, so show the one set -->
            <q-card v-if="!isEllipse" flat bordered class="q-pa-md q-mb-md">
              <!-- Cylinder: one diameter, one width -->
              <template v-if="!state.inputs.useConical">
                <div class="row q-col-gutter-md">
                  <div class="col">
                    <div class="text-caption text-grey-6">Diameter</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.diameter }}"</div>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">
                      {{ state.outputs.staves[0]?.convexWidth ? 'Concave Width' : 'Stave Width' }}
                    </div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0]?.concaveWidth }}"</div>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">Blade Tilt</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0]?.startBladeTilt }}°</div>
                  </div>
                </div>
                <div v-if="state.outputs.staves[0]?.convexWidth" class="row q-col-gutter-md q-mt-md">
                  <div class="col" />
                  <div class="col">
                    <div class="text-caption text-grey-6">Convex Width</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0]?.convexWidth }}"</div>
                  </div>
                  <div class="col" />
                </div>
              </template>

              <!-- Cone: both ends, plus the taper between them -->
              <template v-else>
                <div class="row q-col-gutter-md">
                  <div class="col">
                    <div class="text-caption text-grey-6">Side A Width</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0]?.concaveWidth }}"</div>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">Side B Width</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0]?.sideBConcaveWidth }}"</div>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">Blade Tilt</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0]?.startBladeTilt }}°</div>
                  </div>
                </div>
                <div class="row q-col-gutter-md q-mt-md">
                  <div class="col">
                    <div class="text-caption text-grey-6">Stave Length</div>
                    <div class="text-h6 text-weight-bold">{{ state.outputs.staves[0]?.length }}"</div>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">
                      {{ isTaperRiseRun ? 'Taper In (per edge)' : 'Taper (per edge)' }}
                    </div>
                    <div class="text-h6 text-weight-bold">
                      <template v-if="isTaperRiseRun">{{ state.outputs.staves[0]?.taperRise }}"</template>
                      <template v-else>{{ state.outputs.staves[0]?.taperAngle }}°</template>
                    </div>
                  </div>
                  <div class="col" />
                </div>
              </template>
            </q-card>

            <!-- Ellipse Visualization -->
            <div class="visualization-container q-mb-md">
              <div class="text-caption text-grey-7 q-mb-xs">
                Quarter Ellipse View
                <span class="text-grey-6"> • Pinch to zoom • Double tap to reset</span>
              </div>
              <svg ref="svgRef" viewBox="-10 -10 420 320" class="ellipse-svg">
                <g :transform="transformAttr(200, 145)">
                  <!-- Draw the Side B ellipse (green dashed, background) -->
                  <path
                    v-if="state.inputs.useConical"
                    :d="getBackEllipsePath()"
                    fill="none"
                    stroke="#66bb6a"
                    stroke-width="2"
                    stroke-dasharray="6,4"
                    opacity="0.7"
                  />

                  <!-- Draw the Side A ellipse (blue solid) -->
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
                        :x2="getMarkerX(stave.startAngle)"
                        :y2="getMarkerY(stave.startAngle)"
                        stroke="#f57c00"
                        stroke-width="2"
                        stroke-dasharray="4,2"
                      />
                      <!-- Angle label -->
                      <text
                        :x="getLabelX(stave.startAngle)"
                        :y="getLabelY(stave.startAngle)"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        class="angle-label-svg"
                        :font-size="labelFontSize"
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
                        :x2="getMarkerX(stave.endAngle)"
                        :y2="getMarkerY(stave.endAngle)"
                        stroke="#f57c00"
                        stroke-width="2"
                        stroke-dasharray="4,2"
                      />
                      <!-- Angle label -->
                      <text
                        :x="getLabelX(stave.endAngle)"
                        :y="getLabelY(stave.endAngle)"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        class="angle-label-svg"
                        :font-size="labelFontSize"
                      >
                        {{ stave.endBladeTilt }}°
                      </text>
                    </g>
                  </g>
                </g>
              </svg>
              <div class="text-caption text-grey-7 text-center q-mt-xs">
                <span v-if="state.inputs.useConical">
                  Blue (solid): Side A ellipse | Green (dashed): Side B ellipse | Light blue: staves | Orange: blade tilt angles
                </span>
                <span v-else>
                  Blue: ellipse outline | Light blue: staves | Orange: blade tilt angles at joints
                </span>
              </div>
            </div>

            <!-- Staves Table -->
            <div class="q-mb-md">
              <div class="text-subtitle2 text-weight-medium q-mb-sm">Stave Dimensions</div>
              <div v-if="isEllipse" class="text-caption text-grey-7 q-mb-sm">
                Each stave has different dimensions due to the ellipse's varying curvature.
              </div>
              <div v-else class="text-caption text-grey-7 q-mb-sm">
                Every stave is identical.
              </div>

              <!-- Rise/run taper needs the both-edges caveat spelled out -->
              <q-banner v-if="isTaperRiseRun" dense class="bg-grey-9 text-grey-3 q-mb-sm" rounded>
                <div class="text-caption">
                  <strong>Taper In</strong> is the offset for <strong>one</strong> long edge,
                  measured over the {{ state.outputs?.staves[0]?.taperRun }}" stave length.
                  <strong>Both</strong> long edges must be tapered by this amount, so the stave
                  narrows by twice this figure overall.
                  <template v-if="state.outputs?.staves[0]">
                    Working from the wide end, measure in
                    {{ state.outputs.staves[0].taperRise }}" from each edge at the narrow end
                    and draw to the wide-end corners.
                  </template>
                </div>
              </q-banner>

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
                  This tool calculates blade tilt angles and dimensions for a complete ellipse or circle. An ellipse has varying curvature, so each stave differs; a circle has constant curvature, so every stave is identical.
                </p>
                <p class="q-ma-none q-mb-xs">
                  <strong>Ellipse:</strong>
                </p>
                <ol class="q-ma-none q-pl-md q-mb-sm">
                  <li>Enter the ellipse length (major axis) and width (minor axis)</li>
                  <li>Choose calculation mode: specify number of staves or desired average stave width</li>
                  <li>Click Calculate to get blade tilt angles and dimensions for each stave</li>
                  <li>Optional: Enter stave thickness to get both concave and convex widths</li>
                </ol>
                <p class="q-ma-none q-mb-xs">
                  <strong>Circle (cylinder):</strong>
                </p>
                <ol class="q-ma-none q-pl-md q-mb-sm">
                  <li>Enter either the diameter, or the stave width you want to cut</li>
                  <li>Enter the number of staves (minimum {{ MIN_STAVES }})</li>
                  <li>Calculate to get the other dimension and the blade tilt</li>
                  <li>All staves are identical rectangles</li>
                </ol>
                <p class="q-ma-none q-mb-xs">
                  <strong>Cone (tapered circle):</strong>
                </p>
                <ol class="q-ma-none q-pl-md q-mb-sm">
                  <li>Tick <em>Cone (tapered)</em> and enter both end diameters plus the depth</li>
                  <li>All staves are identical symmetric trapezoids</li>
                  <li>
                    Stave width is not offered as an input here, because on a cone the width
                    changes along the stave's length
                  </li>
                </ol>
                <p class="q-ma-none q-mb-xs">
                  <strong>Taper: angle vs rise/run</strong>
                </p>
                <ul class="q-ma-none q-pl-md q-mb-sm">
                  <li><em>Angle</em> is what you set on the saw to cut one long edge</li>
                  <li>
                    <em>Rise / Run</em> is the same taper as a mark-out offset: how far in to
                    measure at the narrow end before drawing to the wide-end corner
                  </li>
                  <li>
                    Either way the figure is <strong>per edge</strong>. Both long edges of every
                    stave must be tapered, so the stave narrows by twice that amount overall
                  </li>
                </ul>
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
import { ref, computed, onMounted, watch } from 'vue';
import { Notify } from 'quasar';
import { useEllipseCalculator } from '../composables/useEllipseCalculator';
import { usePinchZoom } from '../composables/usePinchZoom';
import { MIN_STAVES } from '../utils/ellipseFormulas';
import type { QTableColumn } from 'quasar';

const { state, hasResults, hasErrors, calculate: baseCalculate, reset } = useEllipseCalculator();

const calculationMode = ref<'width' | 'count'>('width');

// Circle mode hides the two-axis inputs, conical option, and the
// count-vs-average-width toggle, none of which apply when every stave matches.
const isEllipse = computed(() => state.inputs.shape === 'ellipse');

// Taper shown as a mark-out offset rather than a saw angle
const isTaperRiseRun = computed(
  () =>
    state.inputs.useConical &&
    state.inputs.taperResultMode === 'riseRun' &&
    state.outputs?.staves[0]?.taperRise !== undefined
);

// Pinch-to-zoom for visualization
const svgRef = ref<SVGElement | null>(null);
const { transformAttr, inverseScale, resetZoom, scale } = usePinchZoom(svgRef);

// Computed font size that scales with zoom
const labelFontSize = computed(() => {
  const size = 14 * scale.value;
  console.log('Ellipse label font size:', size, 'scale:', scale.value);
  return size;
});

// Debug scale changes
watch(scale, (newVal) => {
  console.log('Ellipse scale changed:', newVal);
});

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
    }
  ];

  // Add conical columns if in conical mode
  if (state.inputs.useConical && state.outputs?.staves[0]?.sideBConcaveWidth !== undefined) {
    columns.push({
      name: 'concaveWidth',
      label: 'Side A Concave',
      field: 'concaveWidth',
      align: 'center',
      sortable: false,
      format: (val: number) => `${val}"`
    });
    columns.push({
      name: 'sideBConcaveWidth',
      label: 'Side B Concave',
      field: 'sideBConcaveWidth',
      align: 'center',
      sortable: false,
      format: (val: number) => `${val}"`
    });
    columns.push({
      name: 'length',
      label: 'Length',
      field: 'length',
      align: 'center',
      sortable: false,
      format: (val: number) => `${val}"`
    });
    if (isTaperRiseRun.value) {
      columns.push({
        name: 'taperRise',
        label: 'Taper In (per edge)',
        field: 'taperRise',
        align: 'center',
        sortable: false,
        format: (val: number) => `${val}"`
      });
    } else {
      columns.push({
        name: 'taperAngle',
        label: 'Taper',
        field: 'taperAngle',
        align: 'center',
        sortable: false,
        format: (val: number) => `${val}°`
      });
    }
  } else {
    // Regular ellipse columns
    columns.push({
      name: 'concaveWidth',
      label: 'Concave Width',
      field: 'concaveWidth',
      align: 'center',
      sortable: false,
      format: (val: number) => `${val}"`
    });
  }

  // Add convex width columns if thickness is specified
  if (state.inputs.staveThickness && state.outputs?.staves[0]?.convexWidth !== undefined) {
    if (state.inputs.useConical && state.outputs?.staves[0]?.sideBConvexWidth !== undefined) {
      columns.push({
        name: 'convexWidth',
        label: 'Side A Convex',
        field: 'convexWidth',
        align: 'center',
        sortable: false,
        format: (val: number) => `${val}"`
      });
      columns.push({
        name: 'sideBConvexWidth',
        label: 'Side B Convex',
        field: 'sideBConvexWidth',
        align: 'center',
        sortable: false,
        format: (val: number) => `${val}"`
      });
    } else {
      columns.push({
        name: 'convexWidth',
        label: 'Convex Width',
        field: 'convexWidth',
        align: 'center',
        sortable: false,
        format: (val: number) => `${val}"`
      });
    }
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

function handleConicalChange(): void {
  // Clear results when toggling conical mode
  state.outputs = null;
  state.isCalculated = false;
  state.errors = [];
}

function handleShapeChange(): void {
  // Conical carries across both shapes (conical ellipse / cone), so it is
  // deliberately left set when switching.
  state.outputs = null;
  state.isCalculated = false;
  state.errors = [];
}

function handleCircleModeChange(): void {
  // Clear results when switching between known-diameter and known-stave-width
  state.outputs = null;
  state.isCalculated = false;
  state.errors = [];
}

function calculate(): void {
  // Circle mode always supplies the stave count directly, so it uses the
  // 'width' path regardless of the ellipse-only calculation mode toggle.
  baseCalculate(isEllipse.value ? calculationMode.value : 'width');
}

function copyResults(): void {
  if (!state.outputs) return;

  if (!isEllipse.value) {
    const stave = state.outputs.staves[0];
    const cone = state.inputs.useConical;
    let circleText = cone
      ? `Cone Coopering Results\n========================\n`
      : `Cylinder Coopering Results\n========================\n`;
    circleText += `Number of Staves: ${state.outputs.totalStaves}\n`;

    if (cone) {
      circleText += `Side A Diameter: ${state.inputs.diameter}"\n`;
      circleText += `Side B Diameter: ${state.inputs.sideBDiameter}"\n`;
      circleText += `Depth: ${state.inputs.depth}"\n`;
      circleText += `Side A Concave Width: ${stave?.concaveWidth}"\n`;
      circleText += `Side B Concave Width: ${stave?.sideBConcaveWidth}"\n`;
      if (stave?.convexWidth !== undefined) {
        circleText += `Side A Convex Width: ${stave.convexWidth}"\n`;
        circleText += `Side B Convex Width: ${stave.sideBConvexWidth}"\n`;
      }
      circleText += `Blade Tilt: ${stave?.startBladeTilt}°\n`;
      circleText += taperLine(stave);
    } else {
      circleText += `Diameter: ${state.outputs.diameter}"\n`;
      circleText += `Concave Width: ${stave?.concaveWidth}"\n`;
      if (stave?.convexWidth !== undefined) {
        circleText += `Convex Width: ${stave.convexWidth}"\n`;
      }
      circleText += `Blade Tilt: ${stave?.startBladeTilt}°\n`;
    }

    writeToClipboard(circleText);
    return;
  }

  let text = `Ellipse Coopering Results\n========================\n`;
  text += `Side A Length (Major Axis): ${state.inputs.length}"\n`;
  text += `Side A Width (Minor Axis): ${state.inputs.width}"\n`;

  if (state.inputs.useConical) {
    text += `Side B Length (Major Axis): ${state.inputs.sideBLength}"\n`;
    text += `Side B Width (Minor Axis): ${state.inputs.sideBWidth}"\n`;
    text += `Depth: ${state.inputs.depth}"\n`;
  }

  text += `Total Staves: ${state.outputs.totalStaves}\n`;
  if (state.inputs.staveThickness) {
    text += `Stave Thickness: ${state.inputs.staveThickness}"\n`;
  }
  text += `\nStave Details:\n`;
  text += `${'Stave #'.padEnd(10)}${'Start°'.padEnd(10)}${'End°'.padEnd(10)}`;

  if (state.inputs.useConical && state.outputs.staves[0]?.sideBConcaveWidth !== undefined) {
    text += `${'F.Concave"'.padEnd(12)}${'B.Concave"'.padEnd(12)}${'Length"'.padEnd(10)}`;
    text += `${(isTaperRiseRun.value ? 'TaperIn"' : 'Taper°').padEnd(10)}`;
    if (state.outputs.staves[0]?.convexWidth !== undefined) {
      text += `${'F.Convex"'.padEnd(12)}${'B.Convex"'.padEnd(12)}`;
    }
  } else {
    text += `${'Concave"'.padEnd(12)}`;
    if (state.outputs.staves[0]?.convexWidth !== undefined) {
      text += `${'Convex"'.padEnd(12)}`;
    }
  }
  text += `\n`;

  state.outputs.staves.forEach((stave) => {
    text += `${String(stave.index).padEnd(10)}`;
    text += `${String(stave.startBladeTilt).padEnd(10)}`;
    text += `${String(stave.endBladeTilt).padEnd(10)}`;

    if (state.inputs.useConical && stave.sideBConcaveWidth !== undefined) {
      text += `${String(stave.concaveWidth).padEnd(12)}`;
      text += `${String(stave.sideBConcaveWidth).padEnd(12)}`;
      text += `${String(stave.length).padEnd(10)}`;
      text += `${String(isTaperRiseRun.value ? stave.taperRise : stave.taperAngle).padEnd(10)}`;
      if (stave.convexWidth !== undefined) {
        text += `${String(stave.convexWidth).padEnd(12)}`;
        text += `${String(stave.sideBConvexWidth).padEnd(12)}`;
      }
    } else {
      text += `${String(stave.concaveWidth).padEnd(12)}`;
      if (stave.convexWidth !== undefined) {
        text += `${String(stave.convexWidth).padEnd(12)}`;
      }
    }
    text += `\n`;
  });

  if (state.inputs.useConical && isTaperRiseRun.value) {
    text += `\nTaperIn" is per long edge, over the stave length. Taper BOTH long edges.\n`;
  }

  writeToClipboard(text);
}

/**
 * Taper line for copied results, in whichever form the user picked. The
 * per-edge caveat is spelled out because it is easy to cut twice the taper.
 */
function taperLine(stave: { taperAngle?: number; taperRise?: number; taperRun?: number } | undefined): string {
  if (!stave) return '';
  if (isTaperRiseRun.value) {
    return `Taper: measure in ${stave.taperRise}" on EACH long edge over the ${stave.taperRun}" length (${stave.taperAngle}°)\n`;
  }
  return `Taper: ${stave.taperAngle}° on each long edge\n`;
}

function writeToClipboard(text: string): void {
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

// Visualization geometry.
//
// Must stay in sync with the svg viewBox="-10 -10 420 320" above.
const VIEW_MIN_X = -10;
const VIEW_MAX_X = 410;
const VIEW_MIN_Y = -10;
const VIEW_MAX_Y = 310;

const MARKER_OFFSET = 20;
const LABEL_OFFSET = 36;
// Half the vertical extent of a label's glyphs, so the text itself stays inside
// the viewBox rather than just its anchor point.
const LABEL_TEXT_ALLOWANCE = 8;

// Centre the drawing in the viewBox. Previously CENTER_Y was 145, which left
// 155px of headroom above but 165px below, so the topmost label clipped.
const CENTER_X = (VIEW_MIN_X + VIEW_MAX_X) / 2;
const CENTER_Y = (VIEW_MIN_Y + VIEW_MAX_Y) / 2;

// Budget for the outlines themselves: whatever is left after reserving room for
// the angle labels that ride outside them.
const LABEL_RESERVE = LABEL_OFFSET + LABEL_TEXT_ALLOWANCE;
const DRAW_WIDTH = 2 * (CENTER_X - VIEW_MIN_X - LABEL_RESERVE);
const DRAW_HEIGHT = 2 * (CENTER_Y - VIEW_MIN_Y - LABEL_RESERVE);

/**
 * Pixels per inch for the cross-section drawing.
 *
 * Fits the LARGEST outline being drawn. In conical mode Side B can be wider
 * than Side A, and scaling to Side A alone pushed the Side B outline outside
 * the viewBox.
 */
const viewScale = computed(() => {
  const lengths = [state.inputs.length];
  const widths = [state.inputs.width];

  if (state.inputs.useConical) {
    lengths.push(state.inputs.sideBLength as number);
    widths.push(state.inputs.sideBWidth as number);
  }

  const usable = (values: number[]) => values.filter(v => typeof v === 'number' && v > 0);
  const maxLength = Math.max(...usable(lengths));
  const maxWidth = Math.max(...usable(widths));

  if (!Number.isFinite(maxLength) || !Number.isFinite(maxWidth)) return 0;
  return Math.min(DRAW_WIDTH / maxLength, DRAW_HEIGHT / maxWidth);
});

/** Trace a full ellipse of the given real-world axes at the shared scale. */
function ellipsePath(length: number, width: number): string {
  const scale = viewScale.value;
  if (!scale || !(length > 0) || !(width > 0)) return '';

  const a = (length / 2) * scale;
  const b = (width / 2) * scale;

  const steps = 100;
  let path = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (2 * Math.PI);
    const x = CENTER_X + a * Math.cos(t);
    const y = CENTER_Y - b * Math.sin(t);
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return path;
}

function getEllipsePath(): string {
  if (!state.outputs) return '';
  return ellipsePath(state.inputs.length, state.inputs.width);
}

function getBackEllipsePath(): string {
  if (!state.outputs || !state.inputs.useConical) return '';
  return ellipsePath(state.inputs.sideBLength as number, state.inputs.sideBWidth as number);
}

function getEllipseX(angleDegrees: number): number {
  const a = (state.inputs.length / 2) * viewScale.value;
  return CENTER_X + a * Math.cos((angleDegrees * Math.PI) / 180);
}

function getEllipseY(angleDegrees: number): number {
  const b = (state.inputs.width / 2) * viewScale.value;
  return CENTER_Y - b * Math.sin((angleDegrees * Math.PI) / 180);
}

/**
 * A point on the Side A outline, pushed radially outward from the centre.
 * Markers and labels both sit on this ray.
 */
function radialPoint(angleDegrees: number, offset: number): { x: number; y: number } {
  const x = getEllipseX(angleDegrees);
  const y = getEllipseY(angleDegrees);
  const dx = x - CENTER_X;
  const dy = y - CENTER_Y;
  const distance = Math.hypot(dx, dy);

  // Degenerate outline (zero scale); nothing sensible to offset along.
  if (distance === 0) return { x, y };

  const factor = (distance + offset) / distance;
  return { x: CENTER_X + dx * factor, y: CENTER_Y + dy * factor };
}

function getMarkerX(angleDegrees: number): number {
  return radialPoint(angleDegrees, MARKER_OFFSET).x;
}

function getMarkerY(angleDegrees: number): number {
  return radialPoint(angleDegrees, MARKER_OFFSET).y;
}

function getLabelX(angleDegrees: number): number {
  return radialPoint(angleDegrees, LABEL_OFFSET).x;
}

function getLabelY(angleDegrees: number): number {
  return radialPoint(angleDegrees, LABEL_OFFSET).y;
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
}
</style>
