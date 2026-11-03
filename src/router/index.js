import { createRouter, createWebHistory } from 'vue-router'

// Sahifalar kerak bo'lganda yuklanadi (chart.js va vue-flow boshlang'ich bundle'ga kirmaydi)
const routes = [
    { path: '/',            component: () => import('../views/DashboardView.vue'),    meta: { requiresAuth: true, title: 'Dashboard' } },
    { path: '/devices',     component: () => import('../views/DevicesView.vue'),      meta: { requiresAuth: true, title: 'Qurilmalar' } },
    { path: '/devices/:id', component: () => import('../views/DeviceDetailView.vue'), meta: { requiresAuth: true, title: 'Qurilma' } },
    { path: '/scan',        component: () => import('../views/ScanView.vue'),         meta: { requiresAuth: true, title: 'Tarmoqlarni scanner qilish' } },
    { path: '/topology',    component: () => import('../views/TopologyView.vue'),     meta: { requiresAuth: true, title: 'Topology' } },
    { path: '/settings',    component: () => import('../views/SettingsView.vue'),     meta: { requiresAuth: true, title: 'Settings' } },
    { path: '/login',       name: 'login',    component: () => import('../views/LoginView.vue'), meta: { title: 'Login' } },

    // Noma'lum manzil -> bosh sahifa
    { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to) => {
    const token = localStorage.getItem('token')

    if (to.meta.requiresAuth && !token) {
        return '/login'
    }

    if (to.path === '/login' && token) {
        return '/'
    }
})

export default router
