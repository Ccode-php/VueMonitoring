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

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import api from '../api/axios'

import DeviceInfoCard from '../components/devices/DeviceInfoCard.vue'
import DeviceTimeline from '../components/devices/DeviceTimeline.vue'

const route = useRoute()

const device = ref(null)

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

onMounted(loadDevice)

</script>