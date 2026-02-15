<template>
  <q-layout view="lHh Lpr lff">
    <q-header elevated class="bg-dark text-white safe-area-header" style="background-color: #2d3748 !important;">
      <q-toolbar class="safe-area-toolbar">
        <q-toolbar-title class="text-center">
          Woodworking Calculator
        </q-toolbar-title>
      </q-toolbar>
      <q-tabs v-model="activeTab" align="center">
        <q-route-tab
          name="calculator"
          to="/"
          label="Calculator"
          icon="calculate"
        />
        <q-route-tab
          name="reference"
          to="/reference"
          label="Miter Angle Ref"
          icon="table_chart"
        />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeTab = ref('calculator');

// Update active tab based on current route
watch(
  () => route.path,
  (newPath) => {
    activeTab.value = newPath === '/reference' ? 'reference' : 'calculator';
  },
  { immediate: true }
);
</script>

<style>
/* iOS safe area support - needs to be global, not scoped */
.safe-area-header {
  padding-top: env(safe-area-inset-top) !important;
}

.safe-area-toolbar {
  min-height: 50px !important;
}

.q-toolbar-title {
  text-align: center;
  flex: 1;
}

/* Ensure page container also respects safe areas */
.q-layout__section--marginal {
  padding-top: env(safe-area-inset-top);
}
</style>
