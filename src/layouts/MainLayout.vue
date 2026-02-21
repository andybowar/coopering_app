<template>
  <q-layout view="lHh Lpr lff">
    <q-header elevated class="bg-dark text-white ios-safe-header" style="background-color: #2d3748 !important;">
      <q-toolbar class="ios-safe-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          @click="drawerOpen = !drawerOpen"
          aria-label="Menu"
        />
        <q-toolbar-title class="text-center">
          Coopering Calculator
        </q-toolbar-title>
        <!-- Spacer to center title -->
        <q-btn flat dense round icon="menu" style="visibility: hidden;" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerOpen"
      side="left"
      overlay
      bordered
      class="bg-dark text-white"
    >
      <!-- Drawer Header with Close Button -->
      <q-toolbar class="bg-dark text-white drawer-toolbar">
        <q-toolbar-title>Navigation</q-toolbar-title>
        <q-btn
          flat
          dense
          round
          icon="close"
          @click="drawerOpen = false"
          aria-label="Close menu"
        />
      </q-toolbar>

      <q-separator dark />

      <q-list dark>
        <q-expansion-item
          expand-separator
          icon="calculate"
          label="Calculators"
          :default-opened="isCalculatorRoute"
        >
          <q-item
            clickable
            :active="route.path === '/'"
            active-class="bg-primary text-white"
            @click="navigateTo('/')"
          >
            <q-item-section avatar>
              <trapezoid-icon />
            </q-item-section>
            <q-item-section>
              <q-item-label>Box</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            :active="route.path === '/pyramid'"
            active-class="bg-primary text-white"
            @click="navigateTo('/pyramid')"
          >
            <q-item-section avatar>
              <triangle-icon />
            </q-item-section>
            <q-item-section>
              <q-item-label>Pyramid</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            :active="route.path === '/saved-calculations'"
            active-class="bg-primary text-white"
            @click="navigateTo('/saved-calculations')"
          >
            <q-item-section avatar>
              <q-icon name="history" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Saved Calculations</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-item
          clickable
          :active="route.path === '/reference'"
          active-class="bg-primary text-white"
          @click="navigateTo('/reference')"
        >
          <q-item-section avatar>
            <q-icon name="table_chart" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Miter Angle Reference</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TrapezoidIcon from '../components/TrapezoidIcon.vue';
import TriangleIcon from '../components/TriangleIcon.vue';

const route = useRoute();
const router = useRouter();
const drawerOpen = ref(false);

// Check if current route is under calculator section (/, /pyramid, or /saved-calculations)
const isCalculatorRoute = computed(() => {
  return route.path === '/' || route.path === '/pyramid' || route.path === '/saved-calculations';
});

// Navigate and close drawer
function navigateTo(path: string): void {
  router.push(path);
  drawerOpen.value = false;
}
</script>

<style>
/* iOS safe area - works for notch and Dynamic Island */
.ios-safe-header {
  /* Use env() to properly respect notch/Dynamic Island on all devices */
  /* Increased fallback to 60px to account for Dynamic Island/notch */
  padding-top: max(env(safe-area-inset-top), 60px) !important;
}

.ios-safe-toolbar {
  /* Ensure toolbar has minimum height */
  min-height: 50px !important;
}

.q-toolbar-title {
  text-align: center;
  flex: 1;
}

/* Drawer toolbar styling */
.drawer-toolbar {
  min-height: 56px !important;
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
