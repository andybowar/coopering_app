import { createRouter, createWebHashHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import HomePage from '../pages/HomePage.vue';
import IndexPage from '../pages/IndexPage.vue';
import BoxCalculatorPage from '../pages/BoxCalculatorPage.vue';
import TrigCalculatorPage from '../pages/TrigCalculatorPage.vue';
import GeneralTriangleCalculatorPage from '../pages/GeneralTriangleCalculatorPage.vue';
import ArcRadiusCalculatorPage from '../pages/ArcRadiusCalculatorPage.vue';
import CurveCooperingPage from '../pages/CurveCooperingPage.vue';
import EllipseCalculatorPage from '../pages/EllipseCalculatorPage.vue';
import ReferenceChartsPage from '../pages/ReferenceChartsPage.vue';
import SavedCalculationsPage from '../pages/SavedCalculationsPage.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: HomePage },
      { path: 'pyramid', component: IndexPage },
      { path: 'box', component: BoxCalculatorPage },
      { path: 'curve', component: CurveCooperingPage },
      // Cylinder coopering merged into the ellipse calculator's Circle mode.
      // Kept as a redirect so existing links and the installed PWA still work.
      { path: 'cylinder', redirect: '/ellipse' },
      { path: 'ellipse', component: EllipseCalculatorPage },
      { path: 'trig-right', component: TrigCalculatorPage },
      { path: 'trig-general', component: GeneralTriangleCalculatorPage },
      { path: 'arc-radius', component: ArcRadiusCalculatorPage },
      { path: 'reference', component: ReferenceChartsPage },
      { path: 'saved-calculations', component: SavedCalculationsPage }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
