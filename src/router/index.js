import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '../views/DashboardView.vue'

import DevicesView from '../views/DevicesView.vue'

import DeviceDetailView from '../views/DeviceDetailView.vue'

import ScanView from '../views/ScanView.vue'

import TopologyView from '../views/TopologyView.vue'

import SettingsView from '../views/SettingsView.vue'

import LoginView from '../views/LoginView.vue'


const router = createRouter({

    history: createWebHistory(),

    routes: [

        {
            path: '/',
            component: DashboardView,
            meta: {
                requiresAuth: true
            }
        },

        {
            path: '/devices',
            component: DevicesView,
            meta: {
                requiresAuth: true
            }
        },

        {
            path: '/devices/:id',
            component: DeviceDetailView,
            meta: {
                requiresAuth: true
            }
        },

        {
            path: '/scan',
            component: ScanView,
            meta: {
                requiresAuth: true
            }
        },

        {
            path: '/topology',
            component: TopologyView,
            meta: {
                requiresAuth: true
            }
        },

        {
            path:'/settings',
            component: SettingsView,
            meta: {
                requiresAuth: true
            }
        },
        
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },

        
    ],
})

router.beforeEach((to) => {

    const token =
        localStorage.getItem('token')

    if (
        to.meta.requiresAuth &&
        !token
    ) {

        return '/login'

    }

    if (
        to.path === '/login' &&
        token
    ) {

        return '/'

    }

})

export default router