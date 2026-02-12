<template>
  <q-card class="q-mt-md">
    <q-card-section>
      <div class="text-h6">Calculation Results</div>
      <div class="text-caption text-grey-7">All angles in degrees, length in inches</div>
    </q-card-section>

    <q-card-section>
      <q-list bordered separator>
        <!-- Base Side Length -->
        <q-item>
          <q-item-section avatar>
            <q-icon name="square_foot" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label overline>Base Side Length</q-item-label>
            <q-item-label class="calculation-result text-h6">
              {{ results.baseSideLength }}"
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Miter Angle -->
        <q-item>
          <q-item-section avatar>
            <q-icon name="architecture" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label overline>Miter Angle</q-item-label>
            <q-item-label class="calculation-result text-h6">
              {{ results.miterAngle }}°
            </q-item-label>
            <q-item-label caption>Set miter saw to this angle</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Miter Complement -->
        <q-item>
          <q-item-section avatar>
            <q-icon name="architecture" color="grey" />
          </q-item-section>
          <q-item-section>
            <q-item-label overline>Miter Complement</q-item-label>
            <q-item-label class="calculation-result text-h6">
              {{ results.miterComplement }}°
            </q-item-label>
            <q-item-label caption>Alternative miter setting</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Side Slope -->
        <q-item>
          <q-item-section avatar>
            <q-icon name="trending_up" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label overline>Side Slope</q-item-label>
            <q-item-label class="calculation-result text-h6">
              {{ results.sideSlope }}°
            </q-item-label>
            <q-item-label caption>Angle of pyramid face from horizontal</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Blade Tilt (Mitered) -->
        <q-item>
          <q-item-section avatar>
            <q-icon name="build" color="accent" />
          </q-item-section>
          <q-item-section>
            <q-item-label overline>Blade Tilt (Mitered Joints)</q-item-label>
            <q-item-label class="calculation-result text-h6 blade-tilt-value">
              {{ results.bladeTiltMitered }}°
            </q-item-label>
            <q-item-label caption>Table saw blade angle for mitered joints</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Blade Tilt (Butted) -->
        <q-item>
          <q-item-section avatar>
            <q-icon name="build" color="accent" />
          </q-item-section>
          <q-item-section>
            <q-item-label overline>Blade Tilt (Butted Joints)</q-item-label>
            <q-item-label class="calculation-result text-h6 blade-tilt-value">
              {{ results.bladeTiltButted }}°
            </q-item-label>
            <q-item-label caption>Table saw blade angle for butted joints</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Dihedral Angle -->
        <q-item>
          <q-item-section avatar>
            <q-icon name="call_split" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label overline>Dihedral Angle</q-item-label>
            <q-item-label class="calculation-result text-h6">
              {{ results.dihedralAngle }}°
            </q-item-label>
            <q-item-label caption>Interior angle between adjacent faces</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-actions align="center">
      <q-btn
        flat
        color="primary"
        label="Copy Results"
        icon="content_copy"
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
  const text = `
N-Sided Pyramid Calculations
============================
Base Side Length: ${props.results.baseSideLength}"
Miter Angle: ${props.results.miterAngle}°
Miter Complement: ${props.results.miterComplement}°
Side Slope: ${props.results.sideSlope}°
Blade Tilt (Mitered): ${props.results.bladeTiltMitered}°
Blade Tilt (Butted): ${props.results.bladeTiltButted}°
Dihedral Angle: ${props.results.dihedralAngle}°
  `.trim();

  navigator.clipboard.writeText(text).then(
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
