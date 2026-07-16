<template>

    <div style="height: 700px">

        <VueFlow v-model:nodes="nodes" v-model:edges="edges" fit-view-on-init>

            <Background />

            <MiniMap />

            <Controls />

        </VueFlow>

    </div>

</template>

<script setup>

import { ref, onMounted } from 'vue'
import api from '../api/axios'

import {
    VueFlow
} from '@vue-flow/core'

import {
    Background
} from '@vue-flow/background'

import {
    MiniMap
} from '@vue-flow/minimap'

import {
    Controls
} from '@vue-flow/controls'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const nodes = ref([])

const edges = ref([])

const topology = ref([])

const loadTopology = async () => {

    const res = await api.get('/topology')

    topology.value = res.data

}

const createNodes = () => {

nodes.value = []
edges.value = []

let switchY = 50

topology.value.forEach((sw) => {

    const switchId = "switch-" + sw.id

    nodes.value.push({

        id: switchId,

        position: {

            x: 400,
            y: switchY,

        },

        data: {

            label: "🌐 " + (sw.hostname || sw.ip)

        }

    })

    let deviceY = switchY

    sw.ports.forEach((port) => {

        port.devices.forEach((device, index) => {

            const deviceId =
                "device-" + device.id

            nodes.value.push({

                id: deviceId,

                position: {

                    x: 750,

                    y: deviceY

                },

                data: {

                    label:
                        (device.name || device.ip)

                }

            })

            edges.value.push({

                id:
                    switchId + "-" + deviceId,

                source:
                    switchId,

                target:
                    deviceId,

                label:
                    port.port

            })

            deviceY += 90

        })

    })

    switchY += 350

})

}

onMounted(async () => {

    await loadTopology()

    createNodes()

})

</script>