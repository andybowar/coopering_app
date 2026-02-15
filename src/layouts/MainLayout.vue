<template>
  <q-layout view="lHh Lpr lff">
    <q-header elevated class="bg-dark text-white" style="background-color: #2d3748 !important;">
      <q-toolbar>
        <q-toolbar-title>
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
