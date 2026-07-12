<template>

    <div>

        <h1 class="text-3xl font-bold mb-6">
            Tarmoq Boshqaruv Paneli
        </h1>

        <!-- Statistika -->

        <div class="grid grid-cols-5 gap-5 mb-6">

            <div class="bg-white rounded-lg shadow p-5">
                <div class="text-gray-500">
                    Jami qurilmalar
                </div>

                <div class="text-3xl font-bold">
                    {{ stats.total }}
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-5">
                <div class="text-gray-500">
                    Online
                </div>

                <div class="text-3xl font-bold text-green-600">
                    {{ stats.online }}
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-5">
                <div class="text-gray-500">
                    Offline
                </div>

                <div class="text-3xl font-bold text-red-600">
                    {{ stats.offline }}
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-5">
                <div class="text-gray-500">
                    Tarmoqlar
                </div>

                <div class="text-3xl font-bold text-blue-600">
                    {{ stats.totalNetworks }}
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-5">
                <div class="text-gray-500">
                    Faol tarmoqlar
                </div>

                <div class="text-3xl font-bold text-green-600">
                    {{ stats.activeNetworks }}
                </div>
            </div>

        </div>

        <!-- Network Map (hozircha oddiy) -->

        <div class="bg-white rounded-lg shadow p-5 mb-6">

            <h2 class="text-xl font-bold mb-4">
                Tarmoq sxemasi
            </h2>

            <div class="flex flex-wrap gap-3">

                <div
                    v-for="device in devices"
                    :key="device.id"
                    class="border rounded-lg p-3 w-48"
                    :class="device.status=='ONLINE'
                        ? 'border-green-400 bg-green-50'
                        : 'border-red-400 bg-red-50'">

                    <div class="font-bold">
                        {{ device.name || 'Nomaʼlum' }}
                    </div>

                    <div class="text-sm text-gray-600">
                        {{ device.ip_address }}
                    </div>

                    <div class="text-xs mt-2">

                        <span
                            v-if="device.status=='ONLINE'"
                            class="text-green-600">

                            🟢 Online

                        </span>

                        <span
                            v-else
                            class="text-red-600">

                            🔴 Offline

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

            <div
                v-for="log in logs"
                :key="log.id"
                class="border-b py-3">

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