<template>
  <q-card class="q-mt-md" flat bordered>
    <q-card-section class="q-pa-sm">
      <div class="text-subtitle1 text-weight-medium">Results</div>
    </q-card-section>

    <q-card-section class="q-pa-none">
      <q-list dense separator>
        <!-- Blade Tilt (Mitered) -->
        <q-item dense>
          <q-item-section>
            <q-item-label caption>
              Blade Tilt, Mitered Joint
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
              Blade Tilt, Butted Joint
            </q-item-label>
            <q-item-label
              class="calculation-result text-body1 text-weight-bold"
            >
              {{ results.bladeTiltButted }}°
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Miter Angle -->
        <q-item dense>
          <q-item-section>
            <q-item-label caption>Miter Angle</q-item-label>
            <q-item-label class="calculation-result text-body1 text-weight-medium">
              {{ results.miterAngle }}°
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Miter Complement -->
        <q-item dense>
          <q-item-section>
            <q-item-label caption>Miter Complement</q-item-label>
            <q-item-label class="calculation-result text-body1 text-weight-medium">
              {{ results.miterComplement }}°
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
import type { BoxOutputs } from '../types/box';
import type { BoxInputs } from '../types/box';

interface Props {
  results: BoxOutputs;
  inputs: BoxInputs;
}

const props = defineProps<Props>();

function copyResults(): void {
  const angleFromLabel = props.inputs.fromVertical ? 'Vertical' : 'Horizontal';
  let text = `
Box Calculator Results
Sides: ${props.inputs.numberOfSides}
Side Angle: ${props.inputs.sideAngle}° from ${angleFromLabel}

Results:
========
Blade Tilt (Mitered): ${props.results.bladeTiltMitered}°
Blade Tilt (Butted): ${props.results.bladeTiltButted}°
Miter Angle: ${props.results.miterAngle}°
Miter Complement: ${props.results.miterComplement}°
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
