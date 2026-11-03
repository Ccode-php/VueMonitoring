<template>

    <div v-if="device" class="space-y-6">

        <h1 class="text-3xl font-bold">Qurilma</h1>

        <DeviceInfoCard :device="device" :saved="saved" @save="saveDevice" />

        <DeviceTimeline :logs="device.logs" />

    </div>

</template>

<script setup>

import { ref } from 'vue'
import { useRoute } from 'vue-router'

import api from '../api/axios'
import { useAutoRefresh } from '../composables/useAutoRefresh'

import DeviceInfoCard from '../components/devices/DeviceInfoCard.vue'
import DeviceTimeline from '../components/devices/DeviceTimeline.vue'

const route = useRoute()

const device = ref(null)
const saved = ref(false)

const loadDevice = async () => {
    try {
        const res = await api.get('/devices/' + route.params.id)

        device.value = res.data
    } catch (err) {
        console.error(err)
    }
}

const saveDevice = async (name) => {
    saved.value = false

    try {
        await api.put('/devices/' + device.value.id, { name })

        device.value.name = name
        saved.value = true

        setTimeout(() => { saved.value = false }, 3000)
    } catch (err) {
        console.error(err)

        alert(err.response?.data?.message || 'Saqlashda xatolik')
    }
}

useAutoRefresh(loadDevice)

</script>
