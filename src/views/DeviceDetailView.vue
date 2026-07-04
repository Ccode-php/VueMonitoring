```vue
<template>

    <div v-if="device">

        <h1 class="text-3xl font-bold mb-6">

            Qurilma

        </h1>

        <div class="bg-white rounded-lg shadow p-6">

            <div class="grid grid-cols-2 gap-6">

                <div class="col-span-2">

                    <label class="block mb-2 font-semibold">

                        Qurilma nomi

                    </label>

                    <input v-model="device.name" class="border rounded w-full p-2">

                </div>

                <div>

                    <div class="text-gray-500">

                        IP manzil

                    </div>

                    <div class="font-semibold">

                        {{ device.ip_address }}

                    </div>

                </div>

                <div>

                    <div class="text-gray-500">

                        MAC manzil

                    </div>

                    <div class="font-semibold">

                        {{ device.mac_address }}

                    </div>

                </div>

                <div>

                    <div class="text-gray-500">

                        Holati

                    </div>

                    <span v-if="device.status == 'ONLINE'" class="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        Online
                    </span>

                    <span v-else class="bg-red-100 text-red-700 px-3 py-1 rounded-full">
                        Offline
                    </span>

                </div>

                <div>

                    <div class="text-gray-500">

                        Oxirgi ko‘rilgan

                    </div>

                    <div>

                        {{ formatDate(device.last_seen_at) }}

                    </div>

                </div>

                <div class="col-span-2">

                    <button @click="saveDevice" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded">

                        Saqlash

                    </button>

                </div>

            </div>

        </div>

        <div class="bg-white rounded-lg shadow p-6 mt-6">

            <h2 class="text-2xl font-bold mb-4">

                Hodisalar

            </h2>

            <div v-for="log in device.logs" :key="log.id" class="border-b py-4">

                <div class="flex justify-between">

                    <div class="font-semibold">

                        {{ eventName(log.event_type) }}

                    </div>

                    <div class="text-gray-500 text-sm">

                        {{ formatDate(log.created_at) }}

                    </div>

                </div>

                <div class="mt-2">

                    {{ log.message }}

                </div>

                <div v-if="log.old_ip || log.new_ip" class="text-blue-600 text-sm mt-2">

                    IP:

                    {{ log.old_ip }}

                    →

                    {{ log.new_ip }}

                </div>

                <div v-if="log.old_mac || log.new_mac" class="text-red-600 text-sm">

                    MAC:

                    {{ log.old_mac }}

                    →

                    {{ log.new_mac }}

                </div>

            </div>

        </div>

    </div>

</template>

<script setup>

import { ref, onMounted } from 'vue'

import { useRoute } from 'vue-router'

import api from '../api/axios'

const route = useRoute()

const device = ref(null)

const loadDevice = async () => {

    const res = await api.get('/devices/' + route.params.id)

    device.value = res.data

}

const saveDevice = async () => {

    await api.put('/devices/' + device.value.id, {

        name: device.value.name

    })

    alert('Saqlandi')

}

const formatDate = (date) => {

    if (!date) return '-'

    return new Date(date).toLocaleString()

}

const eventName = (event) => {

    const events = {

        NEW_DEVICE: 'Yangi qurilma',

        IP_CHANGED: 'IP o‘zgardi',

        MAC_CHANGED: 'MAC o‘zgardi',

        DEVICE_OFFLINE: 'Offline',

        DEVICE_ONLINE: 'Online'

    }

    return events[event] || event

}

onMounted(loadDevice)

</script>
```
