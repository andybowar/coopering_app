<template>
  <q-card class="q-mt-md" flat bordered>
    <q-card-section class="q-pa-sm">
      <div class="text-subtitle1 text-weight-medium">Results</div>
      <div class="text-caption text-grey-7">0° = blade perpendicular to table (max 45°)</div>
    </q-card-section>

    <!-- Warnings -->
    <q-card-section v-if="results.warnings.length > 0" class="q-pa-sm bg-warning text-white">
      <div class="text-caption text-weight-medium q-mb-xs">
        <q-icon name="warning" size="xs" class="q-mr-xs" />
        Table Saw Constraint
      </div>
      <div v-for="(warning, index) in results.warnings" :key="index" class="text-caption">
        {{ warning }}
      </div>
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
        <q-item dense :class="{ 'bg-red-1': !results.isMiteredFeasible }">
          <q-item-section>
            <q-item-label caption>
              Blade Tilt (Mitered)
              <q-icon v-if="!results.isMiteredFeasible" name="error" color="negative" size="xs" />
            </q-item-label>
            <q-item-label
              class="calculation-result text-body1 text-weight-bold"
              :class="results.isMiteredFeasible ? 'blade-tilt-value' : 'text-negative'"
            >
              {{ results.bladeTiltMitered }}°
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Blade Tilt (Butted) -->
        <q-item dense :class="{ 'bg-red-1': !results.isButtedFeasible }">
          <q-item-section>
            <q-item-label caption>
              Blade Tilt (Butted)
              <q-icon v-if="!results.isButtedFeasible" name="error" color="negative" size="xs" />
            </q-item-label>
            <q-item-label
              class="calculation-result text-body1 text-weight-bold"
              :class="results.isButtedFeasible ? 'blade-tilt-value' : 'text-negative'"
            >
              {{ results.bladeTiltButted }}°
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Max Height Suggestion (only show if constrained) -->
        <q-item
          v-if="!results.isMiteredFeasible && results.maxHeightFor45Deg < 999"
          dense
          class="bg-blue-1"
        >
          <q-item-section>
            <q-item-label caption>
              <q-icon name="info" color="info" size="xs" />
              Max Height for 45° Limit
            </q-item-label>
            <q-item-label class="calculation-result text-body1 text-weight-medium text-info">
              {{ results.maxHeightFor45Deg }}"
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
Blade Tilt (Mitered): ${props.results.bladeTiltMitered}° ${props.results.isMiteredFeasible ? '✓' : '⚠️ EXCEEDS 45°'}
Blade Tilt (Butted): ${props.results.bladeTiltButted}° ${props.results.isButtedFeasible ? '✓' : '⚠️ EXCEEDS 45°'}
Side Slope: ${props.results.sideSlope}°
Dihedral Angle: ${props.results.dihedralAngle}°`;

  if (props.results.warnings.length > 0) {
    text += '\n\nWARNINGS:\n' + props.results.warnings.map(w => '- ' + w).join('\n');
  }

  if (!props.results.isMiteredFeasible && props.results.maxHeightFor45Deg < 999) {
    text += `\n\nSuggested max height: ${props.results.maxHeightFor45Deg}"`;
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
