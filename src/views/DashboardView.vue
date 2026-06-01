<template>

    <div>

        <h1 class="text-3xl font-bold mb-5">
            Tarmoq Boshqaruv Paneli
        </h1>

        <div class="grid grid-cols-5 gap-5 mb-5">

            <div class="bg-white p-5 rounded shadow">

                <div class="text-gray-500">
                    Jami Qurilmalar
                </div>

                <div class="text-3xl font-bold">
                    {{ stats.total }}
                </div>

            </div>

            <div class="bg-white p-5 rounded shadow">

                <div class="text-gray-500">
                    Online Qurilmalar
                </div>

                <div class="text-3xl font-bold text-green-500">
                    {{ stats.online }}
                </div>

            </div>

            <div class="bg-white p-5 rounded shadow">

                <div class="text-gray-500">
                    Offline Qurilmalar
                </div>

                <div class="text-3xl font-bold text-red-500">
                    {{ stats.offline }}
                </div>

            </div>

            <div class="bg-white p-5 rounded shadow">

                <div class="text-gray-500">
                    Jami Tarmoqlar
                </div>

                <div class="text-3xl font-bold text-blue-500">
                    {{ stats.totalNetworks }}
                </div>

            </div>

            <div class="bg-white p-5 rounded shadow">

                <div class="text-gray-500">
                    Faol Tarmoqlar
                </div>

                <div class="text-3xl font-bold text-green-500">
                    {{ stats.activeNetworks }}
                </div>

            </div>

        </div>

    </div>

</template> 


<script setup>

import {
    ref,
    onMounted,
    onUnmounted
}
from 'vue'

import api from '../api/axios'

let intervalId = null

const stats = ref({

    total: 0,

    online: 0,

    offline: 0,

    totalNetworks: 0,

    activeNetworks: 0,
})

const loadData = async () => {

    try {

        const devicesResponse =
            await api.get('/devices')

        const devices =
            devicesResponse.data.data || []

        stats.value.total =
            devices.length

        stats.value.online =
            devices.filter(
                d => d.status === 'ONLINE'
            ).length

        stats.value.offline =
            devices.filter(
                d => d.status === 'OFFLINE'
            ).length

        const networksResponse =
            await api.get('/scan-tasks')

        const networks =
            networksResponse.data || []

        stats.value.totalNetworks =
            networks.length

        stats.value.activeNetworks =
            networks.filter(
                n => n.enabled
            ).length

    } catch (error) {

        console.log(error)
    }
}

onMounted(() => {

    loadData()

    intervalId =
        setInterval(
            loadData,
            55000
        )
})

onUnmounted(() => {

    clearInterval(intervalId)
})

</script>