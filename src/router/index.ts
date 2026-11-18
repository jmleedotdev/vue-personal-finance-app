import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

export const routes = [
  { path: '/pots', name: 'pots', component: () => import('../views/PotsView.vue') },
  { path: '/budgets', name: 'budgets', component: () => import('../views/BudgetsView.vue') },
  {
    path: '/recurring-bills',
    name: 'recurring-bills',
    component: () => import('../views/RecurringBillsView.vue'),
  },
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
