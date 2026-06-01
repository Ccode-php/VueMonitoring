<template>

    <div>

        <h1 class="text-3xl font-bold mb-5">

            Qurilmalar

        </h1>

        <div class="bg-white rounded shadow overflow-x-auto">

            <table class="w-full">

                <thead>

                    <tr class="border-b bg-gray-100">

                        <th class="p-3 text-left">
                            IP Manzil
                        </th>

                        <th class="p-3 text-left">
                            MAC Manzil
                        </th>

                        <th class="p-3 text-left">
                            Qurilma nomi
                        </th>

                        <th class="p-3 text-left">
                            Ishlab chiqaruvchi
                        </th>

                        <th class="p-3 text-center">
                            Holati
                        </th>

                        <th class="p-3 text-left">
                            So‘nggi hodisa
                        </th>

                    </tr>

                </thead>

                <tbody>

                    <tr v-for="device in devices" :key="device.id"
                        class="border-b hover:bg-blue-50 cursor-pointer transition" @click="goDevice(device.id)">

                        <td class="p-3">
                            {{ device.ip_address }}
                        </td>

                        <td class="p-3">
                            {{ device.mac_address }}
                        </td>

                        <td class="p-3">
                            {{ device.hostname || '-' }}
                        </td>

                        <td class="p-3">
                            {{ device.vendor || '-' }}
                        </td>

                        <td class="p-3 text-center">

                            <span v-if="device.status === 'ONLINE'"
                                class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                Online
                            </span>

                            <span v-else class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                                Offline
                            </span>

                        </td>

                        <td class="p-3">

                            <div v-if="device.last_event" class="space-y-1">

                                <div class="font-bold text-yellow-700">

                                    {{ device.last_event }}

                                </div>

                                <div class="text-sm text-gray-600">

                                    {{ device.last_event_message }}

                                </div>

                                <div class="text-xs text-gray-400">

                                    {{ formatDate(device.last_event_at) }}

                                </div>

                            </div>

                            <div v-else class="text-gray-400">
                                Hodisa mavjud emas
                            </div>

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    </div>

</template>

<script setup>

import {
    ref,
    onMounted,
    onUnmounted
} from 'vue'

import { useRouter } from 'vue-router'

import api from '../api/axios'

const router = useRouter()

const devices = ref([])

let intervalId = null

const loadDevices = async () => {

    const response =
        await api.get('/devices')

    devices.value =
        response.data.data
}

const goDevice = (id) => {

    router.push(
        '/devices/' + id
    )
}

const formatDate = (date) => {

    if (!date) {
        return '-'
    }

    return new Date(date)
        .toLocaleString()
}

onMounted(() => {

    loadDevices()

    intervalId =
        setInterval(
            loadDevices,
            55000
        )
})

onUnmounted(() => {

    clearInterval(intervalId)
})

</script>