import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

export const routes = [
  { path: '/', name: 'overview', component: HomeView },
  {
    path: '/transactions',
    name: 'transactions',
    component: () => import('../views/TransactionsView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
