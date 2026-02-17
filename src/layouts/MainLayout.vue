<template>
  <q-layout view="lHh Lpr lff">
    <q-header elevated class="bg-dark text-white ios-safe-header" style="background-color: #2d3748 !important;">
      <q-toolbar class="ios-safe-toolbar">
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
/* iOS safe area - works for notch and Dynamic Island */
.ios-safe-header {
  /* Add top padding to clear notch/Dynamic Island */
  padding-top: 50px !important;
}

.ios-safe-toolbar {
  /* Ensure toolbar has minimum height */
  min-height: 50px !important;
}

.q-toolbar-title {
  text-align: center;
  flex: 1;
}

/* Add safe area padding to page content */
.q-page {
  padding-top: env(safe-area-inset-top);
  /* Add bottom padding for iOS banner ad (60px to account for 50px banner + spacing) */
  padding-bottom: 60px !important;
}

/* Ensure page container also respects bottom padding */
.q-page-container {
  padding-bottom: 60px !important;
}
</style>
