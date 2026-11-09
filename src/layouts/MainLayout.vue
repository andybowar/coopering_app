<template>
  <q-layout view="lHh Lpr lff">
    <q-header
      elevated
      class="bg-dark text-white"
      :class="{ 'ios-safe-header': !isDesktop }"
      style="background-color: #2d3748 !important;"
    >
      <!-- Desktop: persistent top navigation -->
      <q-toolbar v-if="isDesktop" class="desktop-toolbar">
        <q-toolbar-title shrink class="desktop-title cursor-pointer" @click="navigateTo('/')">
          Coopering Calculator
        </q-toolbar-title>

        <q-space />

        <nav class="row no-wrap items-center q-gutter-x-xs" aria-label="Main">
          <template v-for="entry in navEntries" :key="entry.label">
            <!-- Single link -->
            <q-btn
              v-if="'path' in entry"
              flat
              no-caps
              :class="{ 'nav-active': route.path === entry.path }"
              @click="navigateTo(entry.path)"
            >
              <nav-icon :icon="entry.icon" />
              <span class="q-ml-sm">{{ entry.label }}</span>
            </q-btn>

            <!-- Group: dropdown menu -->
            <q-btn-dropdown
              v-else
              flat
              no-caps
              :class="{ 'nav-active': isGroupActive(entry) }"
              content-class="bg-dark text-white"
            >
              <template v-slot:label>
                <nav-icon :icon="entry.icon" />
                <span class="q-ml-sm">{{ entry.label }}</span>
              </template>
              <q-list dark style="min-width: 220px">
                <q-item
                  v-for="item in entry.items"
                  :key="item.path"
                  v-close-popup
                  clickable
                  :active="route.path === item.path"
                  active-class="bg-primary text-white"
                  @click="navigateTo(item.path)"
                >
                  <q-item-section avatar>
                    <nav-icon :icon="item.icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ item.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </template>
        </nav>
      </q-toolbar>

      <!-- Mobile: hamburger opens the drawer -->
      <q-toolbar v-else class="ios-safe-toolbar">
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
      v-if="!isDesktop"
      v-model="drawerOpen"
      side="left"
      overlay
      behavior="mobile"
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
        <template v-for="entry in navEntries" :key="entry.label">
          <q-item
            v-if="'path' in entry"
            clickable
            :active="route.path === entry.path"
            active-class="bg-primary text-white"
            @click="navigateTo(entry.path)"
          >
            <q-item-section avatar>
              <nav-icon :icon="entry.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ entry.label }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-expansion-item
            v-else
            expand-separator
            :default-opened="isGroupActive(entry)"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <nav-icon :icon="entry.icon" />
              </q-item-section>
              <q-item-section>{{ entry.label }}</q-item-section>
            </template>

            <q-item
              v-for="item in entry.items"
              :key="item.path"
              clickable
              :active="route.path === item.path"
              active-class="bg-primary text-white"
              @click="navigateTo(item.path)"
            >
              <q-item-section avatar>
                <nav-icon :icon="item.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-expansion-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, h, defineComponent, type Component, type PropType } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar, QIcon } from 'quasar';
import TrapezoidIcon from '../components/TrapezoidIcon.vue';
import TriangleIcon from '../components/TriangleIcon.vue';
import RightTriangleIcon from '../components/RightTriangleIcon.vue';

/** A Material icon name, or a component that renders an svg icon. */
type NavIconSource = string | Component;

interface NavLink {
  label: string;
  path: string;
  icon: NavIconSource;
}

interface NavGroup {
  label: string;
  icon: NavIconSource;
  items: NavLink[];
}

type NavEntry = NavLink | NavGroup;

// Small inline icons that have no Material equivalent.
const CurveIcon = () =>
  h('svg', { viewBox: '0 0 24 24', width: 24, height: 24 }, [
    h('path', { d: 'M4 6 Q 12 18, 20 6', stroke: 'currentColor', fill: 'none', 'stroke-width': 2, 'stroke-linecap': 'round' })
  ]);

const ArcIcon = () =>
  h('svg', { viewBox: '0 0 24 24', width: 24, height: 24 }, [
    h('path', { d: 'M4 18 Q 12 6, 20 18', stroke: 'currentColor', fill: 'none', 'stroke-width': 2, 'stroke-linecap': 'round' }),
    h('line', { x1: 12, y1: 18, x2: 12, y2: 9, stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-dasharray': '2,2', opacity: 0.7 })
  ]);

/** Renders either a Material icon name or an icon component at 24px. */
const NavIcon = defineComponent({
  props: { icon: { type: [String, Object, Function] as PropType<NavIconSource>, required: true } },
  setup(props) {
    return () =>
      typeof props.icon === 'string'
        ? h(QIcon, { name: props.icon, size: '24px' })
        : h(QIcon, { size: '24px' }, () => h(props.icon as Component));
  }
});

const navEntries: NavEntry[] = [
  { label: 'Home', path: '/', icon: 'home' },
  {
    label: 'Calculators',
    icon: 'calculate',
    items: [
      { label: 'Pyramid', path: '/pyramid', icon: TriangleIcon },
      { label: 'Box', path: '/box', icon: TrapezoidIcon },
      { label: 'Curve Coopering', path: '/curve', icon: CurveIcon },
      { label: 'Ellipse & Cylinder', path: '/ellipse', icon: 'panorama_fish_eye' },
      { label: 'Arc Radius', path: '/arc-radius', icon: ArcIcon },
      { label: 'Saved Calculations', path: '/saved-calculations', icon: 'history' }
    ]
  },
  {
    label: 'Trigonometry Solver',
    icon: RightTriangleIcon,
    items: [
      { label: 'Right Triangle', path: '/trig-right', icon: RightTriangleIcon },
      { label: 'Regular Triangle', path: '/trig-general', icon: TriangleIcon }
    ]
  },
  { label: 'Miter Angle Reference', path: '/reference', icon: 'table_chart' }
];

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const drawerOpen = ref(false);

// md breakpoint and up (>= 1024px) gets the persistent top nav.
const isDesktop = computed(() => $q.screen.gt.sm);

// Don't leave a stale open drawer behind when resizing across the breakpoint.
watch(isDesktop, () => {
  drawerOpen.value = false;
});

function isGroupActive(group: NavGroup): boolean {
  return group.items.some((item) => item.path === route.path);
}

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

.ios-safe-toolbar .q-toolbar-title {
  text-align: center;
  flex: 1;
}

/* Desktop top navigation */
.desktop-toolbar {
  min-height: 56px;
  padding-top: env(safe-area-inset-top);
}

.desktop-title {
  font-weight: 500;
}

.desktop-toolbar .q-btn {
  opacity: 0.85;
}

.desktop-toolbar .q-btn:hover,
.desktop-toolbar .q-btn.nav-active {
  opacity: 1;
}

.desktop-toolbar .q-btn.nav-active {
  background-color: rgba(255, 255, 255, 0.12);
}

/* Drawer toolbar styling */
.drawer-toolbar {
  min-height: 56px !important;
  /* Add safe area padding for notch/Dynamic Island */
  padding-top: max(env(safe-area-inset-top), 60px) !important;
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
