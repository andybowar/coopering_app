<template>
  <q-card flat bordered>
    <q-card-section class="q-pa-sm">
      <div class="text-subtitle1 text-weight-medium">Inputs</div>
    </q-card-section>

    <q-card-section class="q-pa-sm">
      <q-form @submit.prevent="onCalculate">
        <q-input
          v-model.number="localInputs.numberOfSides"
          type="number"
          dense
          outlined
          label="Sides (n)"
          :rules="[val => val >= 3 || 'Min 3']"
          class="q-mb-sm"
        />

        <q-input
          v-model.number="localInputs.sideAngle"
          type="number"
          step="0.1"
          dense
          outlined
          label="Side Angle"
          suffix="°"
          :rules="[val => val > 0 && val < 90 || 'Must be 0 < angle < 90']"
          class="q-mb-sm"
        />

        <div class="q-mb-sm">
          <div class="text-caption q-mb-xs">Angle From</div>
          <q-radio
            v-model="localInputs.fromVertical"
            :val="true"
            label="Vertical"
            color="white"
            dense
            class="q-mr-md"
          />
          <q-radio
            v-model="localInputs.fromVertical"
            :val="false"
            label="Horizontal"
            color="white"
            dense
          />
        </div>

        <q-checkbox
          v-model="saveCalculation"
          label="Save this calculation"
          class="q-mb-sm"
          dense
        />

        <q-btn
          type="submit"
          color="primary"
          label="Calculate"
          class="full-width"
          unelevated
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import type { BoxInputs } from '../types/box';

interface Props {
  modelValue: BoxInputs;
}

interface Emits {
  (e: 'update:modelValue', value: BoxInputs): void;
  (e: 'calculate', payload: { save: boolean }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local copy of inputs for v-model binding
const localInputs = reactive<BoxInputs>({ ...props.modelValue });

// Save calculation checkbox state
const saveCalculation = ref(false);

// Watch for changes and emit updates
watch(
  () => localInputs,
  (newValue) => {
    emit('update:modelValue', { ...newValue });
  },
  { deep: true }
);

// Watch for external changes to props
watch(
  () => props.modelValue,
  (newValue) => {
    Object.assign(localInputs, newValue);
  },
  { deep: true }
);

function onCalculate(): void {
  emit('calculate', { save: saveCalculation.value });
  // Reset checkbox after calculation
  saveCalculation.value = false;
}
</script>
