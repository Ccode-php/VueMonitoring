<template>

    <div>

        <h1 class="text-3xl font-bold mb-6">
            Qurilmalar
        </h1>

        <div class="bg-white rounded-lg shadow overflow-x-auto">

            <table class="w-full">

                <thead class="bg-gray-100">

                    <tr>

                        <th class="p-3 text-left">
                            Nomi
                        </th>

                        <th class="p-3 text-left">
                            IP manzil
                        </th>

                        <th class="p-3 text-left">
                            MAC manzil
                        </th>

                        <th class="p-3 text-center">
                            Holati
                        </th>

                        <th class="p-3 text-left">
                            So'nggi hodisa
                        </th>

                    </tr>

                </thead>

                <tbody>

                    <tr
                        v-for="device in devices"
                        :key="device.id"
                        class="border-b hover:bg-gray-50 cursor-pointer"
                        @click="goDevice(device.id)"
                    >

                        <td class="p-3">
                            {{ device.name || '-' }}
                        </td>

                        <td class="p-3">
                            {{ device.ip_address }}
                        </td>

                        <td class="p-3">
                            {{ device.mac_address }}
                        </td>

                        <td class="p-3 text-center">

                            <span
                                v-if="device.status === 'ONLINE'"
                                class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                            >
                                Online
                            </span>

                            <span
                                v-else
                                class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                            >
                                Offline
                            </span>

                        </td>

                        <td class="p-3">

                            <span v-if="device.latest_log">
                                {{ eventName(device.latest_log.event_type) }}
                            </span>

                            <span v-else>
                                -
                            </span>

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    </div>

</template>

<script setup>

import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'

const router = useRouter()

const devices = ref([])

let timer = null

const loadDevices = async () => {

    const res = await api.get('/devices')

    devices.value = res.data.data
}

const goDevice = (id) => {

    router.push('/devices/' + id)
}

const eventName = (event) => {

    const events = {

        NEW_DEVICE: 'Yangi qurilma',

        IP_CHANGED: 'IP o‘zgardi',

        MAC_CHANGED: 'MAC o‘zgardi',

        DEVICE_OFFLINE: 'Offline bo‘ldi',

        DEVICE_ONLINE: 'Online bo‘ldi',

    }

    return events[event] || event
}

onMounted(() => {

    loadDevices()

    timer = setInterval(loadDevices, 60000)
})

onUnmounted(() => {

    clearInterval(timer)
})

</script>