import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SalesView from '../views/SalesView.vue'
import InventoryView from '../views/InventoryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/sales',
      name: 'sales',
      component: SalesView,
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: InventoryView,
    },
  ],
})

export default router
