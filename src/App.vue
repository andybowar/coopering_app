<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted } from 'vue';

const $q = useQuasar();

// Force dark mode
onMounted(() => {
  $q.dark.set(true);
});
</script>
