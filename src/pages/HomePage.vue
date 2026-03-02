<template>
  <q-page class="flex flex-center" style="padding: 16px;">
    <div style="width: 100%; max-width: 800px;">
      <!-- Header -->
      <div class="text-center q-mb-lg">
        <h4 class="text-h4 q-mt-md q-mb-xs">Coopering Calculator</h4>
        <p class="text-grey-7 q-ma-none">
          Professional tools for calculating compound miter angles and coopering dimensions
        </p>
      </div>

      <!-- Feature Grid -->
      <div class="row q-col-gutter-md">
        <!-- Pyramid Calculator -->
        <div class="col-6">
          <q-card flat bordered class="feature-card cursor-pointer" @click="navigateTo('/pyramid')">
            <q-card-section class="text-center q-pa-sm">
              <q-icon name="change_history" size="48px" color="primary" class="q-mb-xs" />
              <div class="text-subtitle2 text-weight-medium q-mb-xs">Pyramid</div>
              <div class="text-caption text-grey-7">
                Compound miter angles for n-sided pyramids
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Box Calculator -->
        <div class="col-6">
          <q-card flat bordered class="feature-card cursor-pointer" @click="navigateTo('/box')">
            <q-card-section class="text-center q-pa-sm">
              <q-icon name="category" size="48px" color="primary" class="q-mb-xs" />
              <div class="text-subtitle2 text-weight-medium q-mb-xs">Box</div>
              <div class="text-caption text-grey-7">
                Compound miter angles for n-sided boxes
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Curve Coopering -->
        <div class="col-6">
          <q-card flat bordered class="feature-card cursor-pointer" @click="navigateTo('/curve')">
            <q-card-section class="text-center q-pa-sm">
              <q-icon size="48px" color="primary" class="q-mb-xs">
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <path d="M4 18 Q 12 6, 20 18" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </q-icon>
              <div class="text-subtitle2 text-weight-medium q-mb-xs">Curve Coopering</div>
              <div class="text-caption text-grey-7">
                Blade tilt angles for circular arcs
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Cylinder Coopering -->
        <div class="col-6">
          <q-card flat bordered class="feature-card cursor-pointer" @click="navigateTo('/cylinder')">
            <q-card-section class="text-center q-pa-sm">
              <q-icon name="fiber_manual_record" size="48px" color="primary" class="q-mb-xs" />
              <div class="text-subtitle2 text-weight-medium q-mb-xs">Cylinder</div>
              <div class="text-caption text-grey-7">
                Dimensions for cylindrical coopering
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Ellipse Coopering -->
        <div class="col-6">
          <q-card flat bordered class="feature-card cursor-pointer" @click="navigateTo('/ellipse')">
            <q-card-section class="text-center q-pa-sm">
              <q-icon name="panorama_fish_eye" size="48px" color="primary" class="q-mb-xs" />
              <div class="text-subtitle2 text-weight-medium q-mb-xs">Ellipse</div>
              <div class="text-caption text-grey-7">
                Blade tilts for quarter ellipse sections
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function navigateTo(path: string): void {
  router.push(path);
}
</script>

<style scoped>
.feature-card {
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
