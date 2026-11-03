<template>

    <div>

        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-3">

            <div>
                <h1 class="text-3xl font-bold">Qurilmalar</h1>

                <div class="text-gray-500 mt-2">
                    Topildi
                    <span class="font-semibold">{{ pagination.total || 0 }}</span>
                    ta qurilma
                </div>
            </div>

            <div class="text-sm text-gray-400">
                Oxirgi yangilanish: {{ lastRefresh }}
            </div>

        </div>

        <DeviceFilter v-model:search="search" />

        <DeviceTable
            :devices="devices"
            :changed-devices="events.changedDevices"
            @select="goDevice"
        />

        <Pagination :pagination="pagination" @change="changePage" />

    </div>

</template>


<script setup>

import { ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import api from '../api/axios'
import { useAutoRefresh } from '../composables/useAutoRefresh'
import { useEventsStore } from '../stores/events'

import DeviceFilter from '../components/devices/DeviceFilter.vue'
import DeviceTable from '../components/devices/DeviceTable.vue'
import Pagination from '../components/common/Pagination.vue'

const router = useRouter()

// Bildirishnoma, ovoz va sariq belgilar markaziy store'da (har sahifada ishlaydi)
const events = useEventsStore()

const devices = ref([])
const pagination = ref({})
const search = ref('')
const lastRefresh = ref('-')

let searchTimer = null


const loadDevices = async (page = pagination.value.current_page || 1) => {
    try {
        const response = await api.get('/devices', {
            params: { page, search: search.value }
        })

        devices.value = response.data.data || []

        pagination.value = {
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            total: response.data.total,
            per_page: response.data.per_page,
        }

        lastRefresh.value = new Date().toLocaleTimeString()
    } catch (error) {
        console.error('Devices load error:', error)
    }
}


const changePage = (page) => {
    if (page < 1 || page > pagination.value.last_page) return

    loadDevices(page)
}


const goDevice = (id) => {
    events.dismissDevice(id)

    router.push('/devices/' + id)
}


// Qidiruv: yozishdan 400ms keyin 1-sahifadan
watch(search, () => {
    clearTimeout(searchTimer)

    searchTimer = setTimeout(() => loadDevices(1), 400)
})

onUnmounted(() => clearTimeout(searchTimer))


useAutoRefresh(() => loadDevices())

</script>
