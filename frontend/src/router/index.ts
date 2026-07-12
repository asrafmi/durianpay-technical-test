import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ROUTE_LOGIN, ROUTE_DASHBOARD, ROUTE_SETTINGS } from '../constants/routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: ROUTE_LOGIN,
    },
    {
      path: ROUTE_LOGIN,
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/',
      component: () => import('../layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: ROUTE_DASHBOARD,
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
          meta: { title: 'Payments' },
        },
        {
          path: ROUTE_SETTINGS,
          name: 'settings',
          component: () => import('../components/ComingSoon.vue'),
          meta: { title: 'Settings' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../components/ComingSoon.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: ROUTE_LOGIN, query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { path: ROUTE_DASHBOARD }
  }
})

export default router
