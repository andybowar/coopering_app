<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="currentColor"
  >
    <!-- Right triangle with right angle at bottom-right -->
    <path d="M 4 20 L 20 20 L 20 4 Z" />
    <!-- Small square to indicate right angle -->
    <path d="M 18 20 L 18 18 L 20 18" fill="none" stroke="currentColor" stroke-width="0.5" />
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
