<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted } from 'vue';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

const $q = useQuasar();

// Force dark mode and configure status bar
onMounted(async () => {
  $q.dark.set(true);

  // Configure status bar for iOS
  if (Capacitor.getPlatform() === 'ios') {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#2d3748' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  }
});
</script>
