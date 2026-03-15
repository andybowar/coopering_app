<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { App } from '@capacitor/app';

const $q = useQuasar();
const router = useRouter();

// Force dark mode
onMounted(() => {
  $q.dark.set(true);
});

// Handle Android back button
let backButtonListener: any;

onMounted(async () => {
  // Listen for back button events
  backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
    const currentPath = router.currentRoute.value.path;

    // If on home page, exit the app
    if (currentPath === '/') {
      App.exitApp();
    } else {
      // Otherwise, navigate to home page
      router.push('/');
    }
  });
});

onUnmounted(() => {
  // Clean up listener when component unmounts
  if (backButtonListener) {
    backButtonListener.remove();
  }
});
</script>
