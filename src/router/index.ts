import { createRouter, createWebHashHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import IndexPage from '../pages/IndexPage.vue';
import BoxCalculatorPage from '../pages/BoxCalculatorPage.vue';
import TrigCalculatorPage from '../pages/TrigCalculatorPage.vue';
import GeneralTriangleCalculatorPage from '../pages/GeneralTriangleCalculatorPage.vue';
import CurveCooperingPage from '../pages/CurveCooperingPage.vue';
import ReferenceChartsPage from '../pages/ReferenceChartsPage.vue';
import SavedCalculationsPage from '../pages/SavedCalculationsPage.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: BoxCalculatorPage },
      { path: 'pyramid', component: IndexPage },
      { path: 'curve-coop', component: CurveCooperingPage },
      { path: 'trig-right', component: TrigCalculatorPage },
      { path: 'trig-general', component: GeneralTriangleCalculatorPage },
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
