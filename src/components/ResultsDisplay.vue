<template>
  <q-card class="q-mt-md" flat bordered>
    <q-card-section class="q-pa-sm">
      <div class="text-subtitle1 text-weight-medium">Results</div>
      <div class="text-caption text-grey-7">0° = blade perpendicular to table (max 45°)</div>
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

        <!-- Miter Angle -->
        <q-item dense>
          <q-item-section>
            <q-item-label caption>Miter Gauge Angle</q-item-label>
            <q-item-label class="calculation-result text-body1 text-weight-medium">
              {{ results.miterAngle }}°
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
import { Notify } from 'quasar';
import type { PyramidOutputs } from '../types/pyramid';

interface Props {
  results: PyramidOutputs;
}

const props = defineProps<Props>();

function copyResults(): void {
  let text = `Pyramid Calculator Results (0° = blade perpendicular, max 45°)
================================================================
Base Side Length: ${props.results.baseSideLength}"
Miter Gauge: ${props.results.miterAngle}°
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
