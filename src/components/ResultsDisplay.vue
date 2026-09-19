<template>
  <q-card class="q-mt-md" flat bordered>
    <q-card-section class="q-pa-sm">
      <div class="text-subtitle1 text-weight-medium">Results</div>
    </q-card-section>

    <q-card-section class="q-pa-none">
      <q-list dense separator>
        <!-- Base Side Length -->
        <q-item dense>
          <q-item-section>
            <q-item-label caption>Base Side Length</q-item-label>
            <q-item-label class="calculation-result text-body1 text-weight-medium">
              {{ results.baseSideLength }}"
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Miter Angle (as a degree measurement) -->
        <q-item v-if="!isRiseRun" dense>
          <q-item-section>
            <q-item-label caption>Miter Angle</q-item-label>
            <q-item-label class="calculation-result text-body1 text-weight-medium">
              {{ results.miterAngle }}°
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Miter Angle (as a rise/run layout offset) -->
        <q-item v-else dense>
          <q-item-section>
            <q-item-label caption>Miter Angle (Rise / Run)</q-item-label>
            <q-item-label class="calculation-result text-body1 text-weight-medium">
              Measure in {{ results.miterRise }}" over a {{ results.miterRun }}" board
            </q-item-label>
            <q-item-label caption class="q-mt-xs">
              Square a line across one end of the board, measure in
              {{ results.miterRise }}" from the corner, then draw from that mark
              to the opposite corner {{ results.miterRun }}" away. Equivalent to
              {{ results.miterAngle }}°.
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Blade Tilt (Mitered) -->
        <q-item dense>
          <q-item-section>
            <q-item-label caption>
              Blade Tilt (Mitered)
            </q-item-label>
            <q-item-label
              class="calculation-result text-body1 text-weight-bold"
            >
              {{ results.bladeTiltMitered }}°
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Blade Tilt (Butted) -->
        <q-item dense>
          <q-item-section>
            <q-item-label caption>
              Blade Tilt (Butted)
            </q-item-label>
            <q-item-label
              class="calculation-result text-body1 text-weight-bold"
            >
              {{ results.bladeTiltButted }}°
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Side Slope -->
        <q-item dense>
          <q-item-section>
            <q-item-label caption>Side Slope</q-item-label>
            <q-item-label class="calculation-result text-body1 text-weight-medium">
              {{ results.sideSlope }}°
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Dihedral Angle -->
        <q-item dense>
          <q-item-section>
            <q-item-label caption>Dihedral Angle</q-item-label>
            <q-item-label class="calculation-result text-body1 text-weight-medium">
              {{ results.dihedralAngle }}°
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-actions align="center" class="q-pa-sm">
      <q-btn
        flat
        dense
        color="primary"
        label="Copy"
        icon="content_copy"
        size="sm"
        @click="copyResults"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Notify } from 'quasar';
import type { PyramidOutputs } from '../types/pyramid';
import type { PyramidInputs } from '../types/pyramid';

interface Props {
  results: PyramidOutputs;
  inputs: PyramidInputs;
}

const props = defineProps<Props>();

// Rise/run display requires both the mode and a usable offset
const isRiseRun = computed(
  () =>
    props.inputs.miterResultMode === 'riseRun' &&
    props.results.miterRise !== null &&
    props.results.miterRise !== undefined
);

function copyResults(): void {
  const miterLine = isRiseRun.value
    ? `Miter Gauge: measure in ${props.results.miterRise}" over a ${props.results.miterRun}" board (${props.results.miterAngle}°)`
    : `Miter Gauge: ${props.results.miterAngle}°`;

  let text = `
Pyramid Calculator Results
Sides: ${props.inputs.numberOfSides}
Base Radius: ${props.inputs.baseRadius}"
Height: ${props.inputs.height}"

Results:
========
Base Side Length: ${props.results.baseSideLength}"
${miterLine}
Blade Tilt (Mitered): ${props.results.bladeTiltMitered}°}
Blade Tilt (Butted): ${props.results.bladeTiltButted}°}
Side Slope: ${props.results.sideSlope}°
Dihedral Angle: ${props.results.dihedralAngle}°`;

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
