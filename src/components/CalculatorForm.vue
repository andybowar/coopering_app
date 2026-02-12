<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <div class="text-h6">Input Parameters</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit.prevent="onCalculate">
        <q-input
          v-model.number="localInputs.numberOfSides"
          type="number"
          filled
          label="Number of Sides (N)"
          hint="Minimum 3 sides"
          :rules="[val => val >= 3 || 'Must be at least 3']"
          class="q-mb-md"
        >
          <template v-slot:prepend>
            <q-icon name="category" />
          </template>
        </q-input>

        <q-input
          v-model.number="localInputs.baseRadius"
          type="number"
          step="0.01"
          filled
          label="Base Radius (R)"
          hint="Distance from center to vertex"
          :rules="[val => val > 0 || 'Must be greater than 0']"
          class="q-mb-md"
        >
          <template v-slot:prepend>
            <q-icon name="straighten" />
          </template>
          <template v-slot:append>
            <span class="text-caption">inches</span>
          </template>
        </q-input>

        <q-input
          v-model.number="localInputs.height"
          type="number"
          step="0.01"
          filled
          label="Pyramid Height (H)"
          hint="Vertical height from base to apex"
          :rules="[val => val > 0 || 'Must be greater than 0']"
          class="q-mb-md"
        >
          <template v-slot:prepend>
            <q-icon name="height" />
          </template>
          <template v-slot:append>
            <span class="text-caption">inches</span>
          </template>
        </q-input>

        <q-btn
          type="submit"
          color="primary"
          label="Calculate"
          icon="calculate"
          class="full-width"
          size="lg"
          unelevated
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { PyramidInputs } from '../types/pyramid';

interface Props {
  modelValue: PyramidInputs;
}

interface Emits {
  (e: 'update:modelValue', value: PyramidInputs): void;
  (e: 'calculate'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local copy of inputs for v-model binding
const localInputs = reactive<PyramidInputs>({ ...props.modelValue });

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
  emit('calculate');
}
</script>
