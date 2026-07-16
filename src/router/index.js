import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '../views/DashboardView.vue'

import DevicesView from '../views/DevicesView.vue'

import DeviceDetailView from '../views/DeviceDetailView.vue'

import ScanView from '../views/ScanView.vue'

import TopologyView from '../views/TopologyView.vue'

const router = createRouter({

    history: createWebHistory(),

    routes: [

        {
            path: '/',
            component: DashboardView,
        },

        {
            path: '/devices',
            component: DevicesView,
        },

        {
            path: '/devices/:id',
            component: DeviceDetailView,
        },

        {
            path: '/scan',
            component: ScanView,
        },

        {
            path: '/topology',
            component: TopologyView,
        },
    ],
})

export default router