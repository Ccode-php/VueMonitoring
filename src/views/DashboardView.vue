<template>

    <div>

        <!-- Header -->

        <div class="flex items-center justify-between mb-8">

            <div>

                <h1 class="text-3xl font-bold text-slate-800">
                    Tarmoq Boshqaruv Paneli
                </h1>

                <p class="text-slate-500 mt-1">
                    Tarmoqning joriy holati va qurilmalar statistikasi
                </p>

            </div>

            <button
                @click="loadData"
                :disabled="loading"
                class="px-4 py-2
                       bg-blue-600
                       hover:bg-blue-700
                       disabled:bg-blue-400
                       text-white
                       rounded-lg
                       transition">

                {{ loading ? 'Yangilanmoqda...' : '🔄 Yangilash' }}

            </button>

        </div>


        <!-- Statistics -->

        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            <StatCard
                title="Devices"
                :value="stats.totalDevices ?? 0"
                icon="💻"
                color="bg-slate-100"
            />

            <StatCard
                title="Online"
                :value="stats.onlineDevices ?? 0"
                icon="🟢"
                color="bg-green-100"
            />

            <StatCard
                title="Offline"
                :value="stats.offlineDevices ?? 0"
                icon="🔴"
                color="bg-red-100"
            />

            <StatCard
                title="Networks"
                :value="stats.totalNetworks ?? 0"
                icon="🌐"
                color="bg-indigo-100"
            />

        </div>


        <!-- Main information -->

        <div class="grid xl:grid-cols-3 gap-6 mt-8">


            <!-- Chart -->

            <div class="xl:col-span-2
                        bg-white
                        rounded-2xl
                        shadow-sm
                        border
                        border-slate-200
                        p-6">

                <div class="flex justify-between items-center mb-6">

                    <div>

                        <h2 class="text-xl font-semibold text-slate-800">
                            Tarmoq holati
                        </h2>

                        <p class="text-sm text-slate-500 mt-1">
                            Qurilmalarning joriy holati
                        </p>

                    </div>

                    <div
                        class="text-sm
                               text-slate-500">

                        Active networks:
                        <span class="font-semibold text-slate-800">
                            {{ stats.activeNetworks ?? 0 }}
                        </span>

                    </div>

                </div>

                <DashboardChart
                    :online="stats.onlineDevices"
                    :offline="stats.offlineDevices"
                />

            </div>


            <!-- Last Scan -->

            <div
                class="bg-white
                       rounded-2xl
                       shadow-sm
                       border
                       border-slate-200
                       p-6">

                <h2 class="text-xl font-semibold text-slate-800">
                    Scanner
                </h2>

                <p class="text-sm text-slate-500 mt-1">
                    Oxirgi qurilma aniqlangan vaqt
                </p>


                <div class="mt-8">

                    <div class="text-4xl mb-3">
                        🕐
                    </div>

                    <div class="text-sm text-slate-500">
                        Last Scan
                    </div>

                    <div class="text-lg font-semibold text-slate-800 mt-1">
                        {{ formatDate(stats.lastScan) }}
                    </div>

                </div>


                <div
                    class="mt-8
                           border-t
                           border-slate-200
                           pt-5">

                    <div class="flex justify-between">

                        <span class="text-slate-500">
                            Active Networks
                        </span>

                        <span class="font-semibold text-green-600">
                            {{ stats.activeNetworks ?? 0 }}
                        </span>

                    </div>

                    <div class="flex justify-between mt-3">

                        <span class="text-slate-500">
                            Total Networks
                        </span>

                        <span class="font-semibold">
                            {{ stats.totalNetworks ?? 0 }}
                        </span>

                    </div>

                </div>

            </div>

        </div>


        <!-- Latest devices -->

        <div
            class="bg-white
                   rounded-2xl
                   shadow-sm
                   border
                   border-slate-200
                   p-6
                   mt-8">

            <div class="flex justify-between items-center mb-5">

                <div>

                    <h2 class="text-xl font-semibold text-slate-800">
                        Oxirgi qurilmalar
                    </h2>

                    <p class="text-sm text-slate-500 mt-1">
                        Scanner tomonidan oxirgi aniqlangan qurilmalar
                    </p>

                </div>

                <RouterLink
                    to="/devices"
                    class="text-blue-600
                           hover:text-blue-700
                           text-sm
                           font-medium">

                    Barchasini ko‘rish →

                </RouterLink>

            </div>


            <div class="overflow-x-auto">

                <table class="w-full">

                    <thead>

                        <tr
                            class="border-b
                                   border-slate-200
                                   text-left
                                   text-sm
                                   text-slate-500">

                            <th class="py-3">
                                Nomi
                            </th>

                            <th>
                                IP
                            </th>

                            <th>
                                MAC
                            </th>

                            <th>
                                Holati
                            </th>

                            <th>
                                Oxirgi ko‘rilgan
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        <tr
                            v-for="device in latestDevices"
                            :key="device.id"
                            class="border-b
                                   border-slate-100
                                   hover:bg-slate-50">

                            <td class="py-4 font-medium text-slate-800">

                                {{ device.name || 'Unknown' }}

                            </td>

                            <td class="text-slate-600">

                                {{ device.ip_address }}

                            </td>

                            <td class="text-slate-500 font-mono text-sm">

                                {{ device.mac_address }}

                            </td>

                            <td>

                                <span
                                    v-if="device.status === 'ONLINE'"
                                    class="inline-flex
                                           items-center
                                           px-3
                                           py-1
                                           rounded-full
                                           text-xs
                                           font-medium
                                           bg-green-100
                                           text-green-700">

                                    🟢 Online

                                </span>

                                <span
                                    v-else
                                    class="inline-flex
                                           items-center
                                           px-3
                                           py-1
                                           rounded-full
                                           text-xs
                                           font-medium
                                           bg-red-100
                                           text-red-700">

                                    🔴 Offline

                                </span>

                            </td>

                            <td class="text-sm text-slate-500">

                                {{ formatDate(device.last_seen_at) }}

                            </td>

                        </tr>


                        <tr v-if="latestDevices.length === 0">

                            <td
                                colspan="5"
                                class="text-center
                                       py-10
                                       text-slate-400">

                                Hozircha qurilmalar mavjud emas.

                            </td>

                        </tr>

                    </tbody>

                </table>

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

import {
    useSettings
} from '../composables/useSettings'

import api from '../api/axios'

import StatCard
    from '../components/dashboard/StatCard.vue'

import DashboardChart
    from '../components/dashboard/DashboardChart.vue'


const latestDevices = ref([])

const stats = ref({})

const loading = ref(false)

let timer = null

const {
    settings,
    loadSettings,
    loadFromStorage
} = useSettings()


const loadData = async () => {

    loading.value = true

    try {

        const res =
            await api.get('/dashboard')

        stats.value =
            res.data.stats

        latestDevices.value =
            res.data.latestDevices

    } catch (error) {

        console.error(
            'Dashboard error:',
            error
        )

    } finally {

        loading.value = false

    }

}


const formatDate = (date) => {

    if (!date) {

        return '-'

    }

    return new Date(date).toLocaleString()

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
    loadData,
    interval
)

}

const handleSettingsUpdated = async () => {

loadFromStorage()

await loadSettings()

startAutoRefresh()

}

onMounted(async () => {

loadFromStorage()

await loadSettings()

await loadData()

startAutoRefresh()

window.addEventListener(
    'app-settings-updated',
    handleSettingsUpdated
)

})


onUnmounted(() => {

clearInterval(timer)

window.removeEventListener(
    'app-settings-updated',
    handleSettingsUpdated
)

})

</script>