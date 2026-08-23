<template>

    <div style="height: 700px">

        <VueFlow
            v-model:nodes="nodes"
            v-model:edges="edges"
            fit-view-on-init
            :fit-view="true"
            :min-zoom="0.2"
            :max-zoom="2"
        >

            <Background :gap="20" />

            <MiniMap />

            <Controls />

        </VueFlow>

    </div>

</template>


<script setup>

import {
    ref,
    onMounted,
    onUnmounted
} from 'vue'

import api from '../api/axios'

import {
    useSettings
} from '../composables/useSettings'


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


/*
|--------------------------------------------------------------------------
| Settings
|--------------------------------------------------------------------------
*/

const {
    settings,
    loadSettings,
    loadFromStorage
} = useSettings()


/*
|--------------------------------------------------------------------------
| Topology state
|--------------------------------------------------------------------------
*/

const nodes = ref([])

const edges = ref([])

const topology = ref([])


/*
|--------------------------------------------------------------------------
| Timer
|--------------------------------------------------------------------------
*/

let timer = null


/*
|--------------------------------------------------------------------------
| Load topology
|--------------------------------------------------------------------------
*/

const loadTopology = async () => {

    try {

        const res =
            await api.get('/topology')

        topology.value =
            res.data

    } catch (error) {

        console.error(
            'Topology load error:',
            error
        )

    }

}


/*
|--------------------------------------------------------------------------
| Draw switch
|--------------------------------------------------------------------------
*/

const drawSwitch = (
    sw,
    x,
    y
) => {

    const switchId =
        'switch-' + sw.id


    nodes.value.push({

        id: switchId,

        position: {
            x,
            y
        },

        data: {
            label:
                '🌐 ' +
                (sw.hostname || sw.ip)
        }

    })


    /*
    |--------------------------------------------------------------------------
    | Child switches
    |--------------------------------------------------------------------------
    */

    let childY = y


    sw.children.forEach(
        child => {

            const childId =
                'switch-' + child.id


            edges.value.push({

                id:
                    switchId +
                    '-' +
                    childId,

                source:
                    switchId,

                target:
                    childId

            })


            drawSwitch(
                child,
                x + 280,
                childY
            )


            childY += 220

        }
    )


    /*
    |--------------------------------------------------------------------------
    | Devices
    |--------------------------------------------------------------------------
    */

    let deviceY =
        y + 70


    sw.ports.forEach(
        port => {

            port.devices.forEach(
                device => {

                    const deviceId =
                        'device-' +
                        device.id


                    nodes.value.push({

                        id: deviceId,

                        position: {

                            x,

                            y: deviceY

                        },

                        data: {

                            label:
                                '💻 ' +
                                (
                                    device.name ||
                                    device.ip_address ||
                                    device.ip
                                )

                        }

                    })


                    edges.value.push({

                        id:
                            switchId +
                            '-' +
                            deviceId,

                        source:
                            switchId,

                        target:
                            deviceId,

                        label:
                            port.name ||
                            port.port_name ||
                            ''

                    })


                    deviceY += 70

                }
            )

        }
    )

}


/*
|--------------------------------------------------------------------------
| Create nodes
|--------------------------------------------------------------------------
*/

const createNodes = () => {

    nodes.value = []

    edges.value = []


    let currentY = 50


    topology.value.forEach(
        root => {

            drawSwitch(
                root,
                100,
                currentY
            )


            currentY += 450

        }
    )

}


/*
|--------------------------------------------------------------------------
| Start Auto Refresh
|--------------------------------------------------------------------------
*/

const startAutoRefresh = () => {

    clearInterval(timer)

    timer = null


    if (
        !settings.value.auto_refresh
    ) {

        console.log(
            'Topology auto refresh: OFF'
        )

        return

    }


    const interval =
        Math.max(
            Number(
                settings.value.scan_interval ||
                60
            ),
            1
        ) * 1000


    console.log(
        `Topology auto refresh: ON (${interval / 1000}s)`
    )


    timer = setInterval(
        async () => {

            console.log(
                'Topology auto refresh...'
            )


            await loadTopology()

            createNodes()

        },
        interval
    )

}


/*
|--------------------------------------------------------------------------
| Mounted
|--------------------------------------------------------------------------
*/

onMounted(
    async () => {

        loadFromStorage()

        await loadSettings()

        await loadTopology()

        createNodes()

        startAutoRefresh()

    }
)


/*
|--------------------------------------------------------------------------
| Unmounted
|--------------------------------------------------------------------------
*/

onUnmounted(() => {

    clearInterval(timer)

})

</script>