<template>
  <div class="angle-input-wrapper">
    <!-- Mode Toggle -->
    <div class="mode-toggle-container">
      <q-btn-toggle
        v-model="inputMode"
        :options="[
          { label: 'Angle', value: 'angle' },
          { label: 'Rise/Run', value: 'riseRun' }
        ]"
        dense
        spread
        toggle-color="green"
        toggle-text-color="black"
        size="sm"
        @update:model-value="handleModeChange"
      />
    </div>

    <!-- Angle Input Mode -->
    <div v-if="inputMode === 'angle'" class="angle-mode">
      <q-input
        :model-value="modelValue"
        type="number"
        step="0.1"
        dense
        outlined
        :placeholder="placeholder || '°'"
        :suffix="suffix || '°'"
        :readonly="readonly"
        :filled="filled"
        :label="label"
        class="compact-input"
        @update:model-value="handleAngleInput"
        :error="!!angleError"
        :error-message="angleError"
      />
    </div>

    <!-- Rise/Run Input Mode -->
    <div v-else class="rise-run-mode">
      <div class="rise-run-inputs">
        <q-input
          v-model.number="rise"
          type="number"
          step="0.1"
          dense
          outlined
          label="Rise"
          placeholder="0"
          :readonly="readonly"
          :filled="filled"
          class="compact-input rise-input"
          @update:model-value="handleRiseRunInput"
          :error="!!riseRunError"
        />
        <q-input
          v-model.number="run"
          type="number"
          step="0.1"
          dense
          outlined
          label="Run"
          placeholder="12"
          :readonly="readonly"
          :filled="filled"
          class="compact-input run-input"
          @update:model-value="handleRiseRunInput"
          :error="!!riseRunError"
        />
      </div>
      <div v-if="riseRunError" class="error-message text-negative text-caption">
        {{ riseRunError }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import type { AngleInputMode } from '../types/angleInput';
import { riseRunToAngle, angleToRiseRun, validateRiseRun } from '../utils/angleConversion';

interface Props {
  modelValue: number | undefined;
  label?: string;
  placeholder?: string;
  dense?: boolean;
  outlined?: boolean;
  readonly?: boolean;
  filled?: boolean;
  validation?: (val: number) => boolean | string;
  suffix?: string;
  angleReference?: 'horizontal' | 'vertical'; // For Box Calculator
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  dense: true,
  outlined: true,
  readonly: false,
  filled: false,
  suffix: '°',
  angleReference: 'horizontal'
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | undefined): void;
}>();

// Local state
const inputMode = ref<AngleInputMode>('angle');
const rise = ref<number | undefined>(undefined);
const run = ref<number | undefined>(12); // Default carpentry value
const angleError = ref<string>('');
const riseRunError = ref<string>('');

// Computed property for fromVertical based on angleReference
const fromVertical = computed(() => props.angleReference === 'vertical');

// Load mode preference from localStorage
onMounted(() => {
  const savedMode = localStorage.getItem('angleInputMode');
  if (savedMode === 'angle' || savedMode === 'riseRun') {
    inputMode.value = savedMode;
  }
});

// Handle mode change
function handleModeChange(newMode: AngleInputMode) {
  inputMode.value = newMode;
  localStorage.setItem('angleInputMode', newMode);

  // Convert current value when switching modes
  if (newMode === 'riseRun' && props.modelValue !== undefined) {
    const converted = angleToRiseRun(props.modelValue, fromVertical.value);
    if (converted) {
      rise.value = converted.rise;
      run.value = converted.run;
    }
  } else if (newMode === 'angle' && rise.value !== undefined && run.value !== undefined) {
    const calculatedAngle = riseRunToAngle(rise.value, run.value, fromVertical.value);
    if (calculatedAngle !== undefined) {
      emit('update:modelValue', calculatedAngle);
    }
  }

  // Clear errors when switching modes
  angleError.value = '';
  riseRunError.value = '';
}

// Handle angle input
function handleAngleInput(value: number | string | null | undefined) {
  const numValue = typeof value === 'number' ? value :
                   typeof value === 'string' ? parseFloat(value) :
                   undefined;

  // Validate if validation function provided
  if (numValue !== undefined && props.validation) {
    const validationResult = props.validation(numValue);
    if (validationResult !== true) {
      angleError.value = validationResult as string;
      return;
    }
  }

  angleError.value = '';
  emit('update:modelValue', numValue);
}

// Handle rise/run input
function handleRiseRunInput() {
  // Validate rise/run values
  const validation = validateRiseRun(rise.value, run.value);
  if (validation !== true) {
    riseRunError.value = validation;
    return;
  }

  // Calculate angle
  const calculatedAngle = riseRunToAngle(rise.value, run.value, fromVertical.value);

  // Validate calculated angle if validation function provided
  if (calculatedAngle !== undefined && props.validation) {
    const validationResult = props.validation(calculatedAngle);
    if (validationResult !== true) {
      riseRunError.value = validationResult as string;
      return;
    }
  }

  riseRunError.value = '';
  emit('update:modelValue', calculatedAngle);
}

// Watch for external changes to modelValue (e.g., from reset or calculation results)
watch(() => props.modelValue, (newValue) => {
  // If in rise/run mode and value changed externally, convert it
  if (inputMode.value === 'riseRun' && newValue !== undefined) {
    const converted = angleToRiseRun(newValue, fromVertical.value);
    if (converted) {
      rise.value = converted.rise;
      run.value = converted.run;
    }
  }
});

// Watch for angleReference changes (Box Calculator toggle)
watch(() => props.angleReference, () => {
  // Recalculate if in rise/run mode
  if (inputMode.value === 'riseRun') {
    handleRiseRunInput();
  }
});
</script>

<style scoped>
.angle-input-wrapper {
  max-width: 250px;
}

.mode-toggle-container {
  margin-bottom: 8px;
}

.angle-mode {
  width: 100%;
}

.rise-run-mode {
  width: 100%;
}

.rise-run-inputs {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.rise-input,
.run-input {
  flex: 1;
  max-width: 100px;
}

.error-message {
  margin-top: 4px;
  font-size: 12px;
  padding-left: 4px;
}

.compact-input {
  font-size: 14px;
}

/* Responsive: stack vertically on very small screens */
@media (max-width: 400px) {
  .rise-run-inputs {
    flex-direction: column;
  }

  .rise-input,
  .run-input {
    max-width: 100%;
  }
}
</style>
