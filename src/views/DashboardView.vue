<template>

    <div>

        <h1 class="text-3xl font-bold mb-6">
            Tarmoq Boshqaruv Paneli
        </h1>

        <!-- Statistika -->

        <div class="grid lg:grid-cols-5 md:grid-cols-2 gap-5 mb-8">

            <div class="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl p-6 shadow">

                <div class="text-sm opacity-80">
                    Jami qurilmalar
                </div>

                <div class="text-4xl font-bold mt-2">
                    {{ stats.totalDevices }}
                </div>

            </div>

            <div class="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl p-6 shadow">

                <div class="text-sm opacity-80">
                    Online
                </div>

                <div class="text-4xl font-bold mt-2">
                    {{ stats.onlineDevices }}
                </div>

            </div>

            <div class="bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl p-6 shadow">

                <div class="text-sm opacity-80">
                    Offline
                </div>

                <div class="text-4xl font-bold mt-2">
                    {{ stats.offlineDevices }}
                </div>

            </div>

            <div class="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-xl p-6 shadow">

                <div class="text-sm opacity-80">
                    Tarmoqlar
                </div>

                <div class="text-4xl font-bold mt-2">
                    {{ stats.totalNetworks }}
                </div>

            </div>

            <div class="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl p-6 shadow">

                <div class="text-sm opacity-80">
                    Faol
                </div>

                <div class="text-4xl font-bold mt-2">
                    {{ stats.activeNetworks }}
                </div>

            </div>

        </div>

        <!-- Network Map (hozircha oddiy) -->

        <div class="bg-white rounded-lg shadow p-5 mb-6">

            <h2 class="text-xl font-bold mb-4">
                Tarmoq sxemasi
            </h2>

            <div class="grid lg:grid-cols-4 md:grid-cols-2 gap-5">

                <div v-for="device in devices" :key="device.id"
                    class="rounded-xl shadow-lg p-5 bg-white hover:shadow-2xl transition">

                    <div class="flex items-center justify-between">

                        <div class="font-bold text-lg">

                            {{ device.name || "Noma'lum" }}

                        </div>

                        <div class="w-4 h-4 rounded-full" :class="device.status == 'ONLINE'
                            ? 'bg-green-500'
                            : 'bg-red-500'">

                        </div>

                    </div>

                    <div class="mt-3 text-gray-600">

                        {{ device.ip_address }}

                    </div>

                    <div class="text-xs text-gray-400">

                        {{ device.mac_address }}

                    </div>

                    <div class="mt-4">

                        <span v-if="device.status == 'ONLINE'" class="px-3 py-1 rounded-full bg-green-100 text-green-700">

                            ONLINE

                        </span>

                        <span v-else class="px-3 py-1 rounded-full bg-red-100 text-red-700">

                            OFFLINE

                        </span>

                    </div>

                </div>

            </div>

        </div>

        <!-- So'nggi hodisalar -->

        <div class="bg-white rounded-lg shadow p-5">

            <h2 class="text-xl font-bold mb-4">
                So'nggi hodisalar
            </h2>

            <div v-for="log in logs" :key="log.id" class="border-b py-3">

                <div class="flex justify-between">

                    <div class="font-semibold">

                        {{ eventName(log.event_type) }}

                    </div>

                    <div class="text-sm text-gray-500">

                        {{ formatDate(log.created_at) }}

                    </div>

                </div>

                <div class="text-gray-700">

                    {{ log.message }}

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
} from 'vue'

import api from '../api/axios'

const stats = ref({})

const logs = ref([])

const devices = ref([])

let timer = null

const loadData = async () => {

    try {

        const res =
            await api.get('/dashboard')

        stats.value =
            res.data.stats

        logs.value =
            res.data.logs

        devices.value =
            res.data.devices

    } catch (err) {

        console.log(err)

    }

}

const formatDate = (date) => {

    if (!date)
        return '-'

    return new Date(date).toLocaleString()

}

const eventName = (event) => {

    const events = {

        NEW_DEVICE: 'Yangi qurilma',

        DEVICE_ONLINE: 'Online bo‘ldi',

        DEVICE_OFFLINE: 'Offline bo‘ldi',

        IP_CHANGED: 'IP o‘zgardi',

        MAC_CHANGED: 'MAC o‘zgardi',

    }

    return events[event] || event

}

onMounted(() => {

    loadData()

    timer =
        setInterval(
            loadData,
            55000
        )

})

onUnmounted(() => {

    clearInterval(timer)

})

</script>