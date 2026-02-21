import { createRouter, createWebHashHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import IndexPage from '../pages/IndexPage.vue';
import BoxCalculatorPage from '../pages/BoxCalculatorPage.vue';
import ReferenceChartsPage from '../pages/ReferenceChartsPage.vue';
import SavedCalculationsPage from '../pages/SavedCalculationsPage.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: BoxCalculatorPage },
      { path: 'pyramid', component: IndexPage },
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
