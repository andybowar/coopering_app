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
          label="Sides (N)"
          :rules="[val => val >= 3 || 'Min 3']"
          class="q-mb-sm"
        />

        <q-input
          v-model.number="localInputs.baseRadius"
          type="number"
          step="0.01"
          dense
          outlined
          label="Radius (R)"
          suffix="in"
          :rules="[val => val > 0 || 'Must be > 0']"
          class="q-mb-sm"
        />

        <q-input
          v-model.number="localInputs.height"
          type="number"
          step="0.01"
          dense
          outlined
          label="Height (H)"
          suffix="in"
          :rules="[val => val > 0 || 'Must be > 0']"
          class="q-mb-sm"
        />

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
import type { PyramidInputs } from '../types/pyramid';

interface Props {
  modelValue: PyramidInputs;
}

interface Emits {
  (e: 'update:modelValue', value: PyramidInputs): void;
  (e: 'calculate', payload: { save: boolean }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local copy of inputs for v-model binding
const localInputs = reactive<PyramidInputs>({ ...props.modelValue });

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
