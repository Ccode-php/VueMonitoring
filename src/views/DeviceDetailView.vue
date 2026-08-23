<template>

    <div v-if="device" class="space-y-6">

        <h1 class="text-3xl font-bold">

            Qurilma

        </h1>

        <DeviceInfoCard :device="device" @save="saveDevice" />

        <DeviceTimeline :logs="device.logs" />

    </div>

</template>

<script setup>


import api from '../api/axios'

import {
    ref,
    onMounted,
    onUnmounted
} from 'vue'

import {
    useSettings
} from '../composables/useSettings'

import { useRoute } from 'vue-router'

import DeviceInfoCard from '../components/devices/DeviceInfoCard.vue'
import DeviceTimeline from '../components/devices/DeviceTimeline.vue'

const route = useRoute()

const device = ref(null)
const {
    settings,
    loadSettings,
    loadFromStorage
} = useSettings()

let timer = null

const loadDevice = async () => {

    try {

        const res = await api.get(
            '/devices/' + route.params.id
        )

        device.value = res.data

    } catch (err) {

        console.error(err)

    }

}

const saveDevice = async () => {

    try {

        await api.put(

            '/devices/' + device.value.id,

            {

                name: device.value.name

            }

        )

    } catch (err) {

        console.error(err)

    }

}

const startAutoRefresh = () => {

clearInterval(timer)

timer = null

if (
    !settings.value.auto_refresh
) {

    return

}

const interval =
    Math.max(
        Number(settings.value.scan_interval || 60),
        1
    ) * 1000

timer = setInterval(
    loadDevice,
    interval
)

}

onMounted(async () => {

loadFromStorage()

await loadSettings()

await loadDevice()

startAutoRefresh()

})

onUnmounted(() => {

clearInterval(timer)

})

</script>