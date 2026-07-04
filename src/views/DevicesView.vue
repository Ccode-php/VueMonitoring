```vue
<template>

    <div>

        <h1 class="text-3xl font-bold mb-6">
            Qurilmalar
        </h1>

        <div class="bg-white rounded-lg shadow overflow-x-auto">

            <table class="w-full">

                <thead class="bg-gray-100">

                    <tr>

                        <th class="text-left p-3">
                            Nomi
                        </th>

                        <th class="text-left p-3">
                            IP manzil
                        </th>

                        <th class="text-left p-3">
                            MAC manzil
                        </th>

                        <th class="text-center p-3">
                            Holati
                        </th>

                    </tr>

                </thead>

                <tbody>

                    <tr v-for="device in devices" :key="device.id" class="border-b hover:bg-gray-50 cursor-pointer"
                        @click="goDevice(device.id)">

                        <td class="p-3">
                            {{ device.name || '-' }}
                        </td>

                        <td class="p-3">
                            {{ device.ip_address }}
                        </td>

                        <td class="p-3">
                            {{ device.mac_address }}
                        </td>

                        <td class="text-center">

                            <span v-if="device.status == 'ONLINE'"
                                class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                Online
                            </span>

                            <span v-else class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                                Offline
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

onMounted(() => {

    loadDevices()

    timer = setInterval(loadDevices, 60000)

})

onUnmounted(() => {

    clearInterval(timer)

})

</script>
```
