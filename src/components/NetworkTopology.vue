<template>

    <div style="height: 700px">

        <VueFlow v-model:nodes="nodes" v-model:edges="edges" fit-view-on-init :fit-view="true" :min-zoom="0.2"
            :max-zoom="2">

            <Background :gap="20" />

            <MiniMap />

            <Controls />

        </VueFlow>

    </div>

</template>

<script setup>

import { ref, onMounted, onUnmounted } from 'vue'
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

const drawSwitch = (sw, x, y) => {

    const switchId = "switch-" + sw.id

    nodes.value.push({

        id: switchId,

        position: {
            x,
            y
        },

        data: {
            label: "🌐 " + sw.hostname
        }

    })

    let childY = y

    sw.children.forEach(child => {

        const childId = "switch-" + child.id

        edges.value.push({

            id: switchId + "-" + childId,

            source: switchId,

            target: childId

        })

        drawSwitch(

            child,

            x + 280,

            childY

        )

        childY += 220

    })

    let deviceY = y + 70

    sw.ports.forEach(port => {

        port.devices.forEach(device => {

            const deviceId = "device-" + device.id

            nodes.value.push({

                id: deviceId,

                position: {

                    x,

                    y: deviceY

                },

                data: {

                    label:
                        "💻 " +
                        (device.name || device.ip)

                }

            })

            edges.value.push({

                id: switchId + "-" + deviceId,

                source: switchId,

                target: deviceId,

                label: port.port

            })

            deviceY += 70

        })

    })

}



const createNodes = () => {

    nodes.value = []

    edges.value = []

    let currentY = 50

    topology.value.forEach(root => {

        drawSwitch(

            root,

            100,

            currentY

        )

        currentY += 450

    })

}

onMounted(async () => {

    await loadTopology()

    createNodes()

})

</script>