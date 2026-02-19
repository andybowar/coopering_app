import { createRouter, createWebHashHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import IndexPage from '../pages/IndexPage.vue';
import ReferenceChartsPage from '../pages/ReferenceChartsPage.vue';
import CalculatorHistoryPage from '../pages/CalculatorHistoryPage.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: IndexPage },
      { path: 'reference', component: ReferenceChartsPage },
      { path: 'history', component: CalculatorHistoryPage }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
