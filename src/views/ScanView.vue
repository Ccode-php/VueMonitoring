<template>

    <div>

        <h1 class="text-3xl font-bold mb-6">

            Tarmoqlar

        </h1>

        <ScanForm v-model="network" @save="addNetwork" />

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

const loadNetworks = async () => {

    try {

        const res = await api.get('/scan-tasks')

        networks.value = res.data

    }

    catch (err) {

        console.error(err)

    }

}

const addNetwork = async () => {

    if (!network.value)

        return

    try {

        await api.post('/scan-tasks', {

            network: network.value

        })

        network.value = ''

        loadNetworks()

    }

    catch (err) {

        console.error(err)

    }

}

const toggleNetwork = async (item) => {

    try {

        await api.put(

            '/scan-tasks/' +

            item.id +

            '/toggle'

        )

        loadNetworks()

    }

    catch (err) {

        console.error(err)

    }

}

const deleteNetwork = async (id) => {

    if (

        !confirm(

            "Tarmoqni o'chirasizmi?"

        )

    )

        return

    try {

        await api.delete(

            '/scan-tasks/' + id

        )

        loadNetworks()

    }

    catch (err) {

        console.error(err)

    }

}

onMounted(loadNetworks)

</script>