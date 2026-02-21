<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="currentColor"
  >
    <path d="M 12 3 L 21 19 L 3 19 Z" />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  size?: string;
}

withDefaults(defineProps<Props>(), {
  size: '24px'
});
</script>
