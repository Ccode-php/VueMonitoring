<template>

    <div>

        <h1 class="text-3xl font-bold mb-6">Tarmoqlar</h1>

        <ScanForm v-model="network" @save="addNetwork" />

        <div v-if="error" class="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {{ error }}
        </div>

        <ScanTable :networks="networks" @toggle="toggleNetwork" @delete="deleteNetwork" />

    </div>

</template>

<script setup>

import { ref, onMounted } from 'vue'

import api from '../api/axios'

import ScanForm from '../components/scan/ScanForm.vue'
import ScanTable from '../components/scan/ScanTable.vue'

const networks = ref([])
const network = ref('')
const error = ref('')

// Laravel'ning tushunarli xatosini (masalan "Tarmoq formati noto'g'ri") ko'rsatadi
const showError = (err) => {
    error.value =
        err.response?.data?.errors?.network?.[0] ||
        err.response?.data?.message ||
        'Xatolik yuz berdi'
}

const loadNetworks = async () => {
    try {
        const res = await api.get('/scan-tasks')

        networks.value = res.data
    } catch (err) {
        showError(err)
    }
}

const addNetwork = async () => {
    error.value = ''

    if (!network.value.trim()) return

    try {
        await api.post('/scan-tasks', { network: network.value.trim() })

        network.value = ''

        await loadNetworks()
    } catch (err) {
        showError(err)
    }
}

const toggleNetwork = async (item) => {
    error.value = ''

    try {
        await api.put('/scan-tasks/' + item.id + '/toggle')

        await loadNetworks()
    } catch (err) {
        showError(err)
    }
}

const deleteNetwork = async (id) => {
    if (!confirm("Tarmoqni o'chirasizmi?")) return

    error.value = ''

    try {
        await api.delete('/scan-tasks/' + id)

        await loadNetworks()
    } catch (err) {
        showError(err)
    }
}

onMounted(loadNetworks)

</script>
