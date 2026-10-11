<template>

    <div class="topology-wrapper">

        <!-- ====================================================== -->
        <!-- HEADER -->
        <!-- ====================================================== -->

        <div class="topology-header">

            <div>

                <h2 class="title">
                    Network Topology
                </h2>

                <p class="subtitle">
                    Switches, devices and network connections
                </p>

            </div>


            <div class="live-status">

                <span class="live-dot"></span>

                LIVE

            </div>

        </div>


        <!-- ====================================================== -->
        <!-- TOPOLOGY BODY -->
        <!-- ====================================================== -->

        <div class="topology-body">


            <!-- ================================================== -->
            <!-- VUE FLOW -->
            <!-- ================================================== -->

            <div class="topology-canvas">

                <VueFlow
                    v-model:nodes="nodes"
                    v-model:edges="edges"

                    :node-types="nodeTypes"

                    fit-view-on-init

                    :min-zoom="0.2"
                    :max-zoom="1.5"

                    :nodes-draggable="true"
                    :nodes-connectable="false"

                    @node-click="handleNodeClick"
                >

                    <Background
                        :gap="20"
                    />

                    <MiniMap />

                    <Controls />

                </VueFlow>

            </div>


            <!-- ================================================== -->
            <!-- DETAILS PANEL -->
            <!-- ================================================== -->

            <transition name="details">

                <div
                    v-if="selectedNode"
                    class="details-panel"
                >

                    <!-- CLOSE -->

                    <button
                        class="close-button"
                        @click="selectedNode = null"
                    >
                        ×
                    </button>


                    <!-- ================================================= -->
                    <!-- ICON -->
                    <!-- ================================================= -->

                    <div
                        class="panel-icon"
                        :class="
                            selectedNode.kind === 'switch'
                                ? 'switch-icon'
                                : 'device-icon'
                        "
                    >

                        {{
                            selectedNode.kind === 'switch'
                                ? '🌐'
                                : '💻'
                        }}

                    </div>


                    <!-- ================================================= -->
                    <!-- NAME -->
                    <!-- ================================================= -->

                    <h3 class="panel-title">

                        {{
                            selectedNode.hostname ||
                            selectedNode.name ||
                            selectedNode.ip ||
                            'Device'
                        }}

                    </h3>


                    <!-- ================================================= -->
                    <!-- TYPE -->
                    <!-- ================================================= -->

                    <div
                        class="type-badge"
                        :class="
                            selectedNode.kind === 'switch'
                                ? 'switch-badge'
                                : (
                                    selectedNode.status === 'OFFLINE'
                                        ? 'offline-badge'
                                        : 'online-badge'
                                )
                        "
                    >

                        {{
                            selectedNode.kind === 'switch'
                                ? 'SWITCH'
                                : (
                                    selectedNode.status ||
                                    'ONLINE'
                                )
                        }}

                    </div>


                    <!-- ================================================= -->
                    <!-- DETAILS -->
                    <!-- ================================================= -->

                    <div class="details-list">


                        <!-- IP -->

                        <div class="detail-row">

                            <span>
                                IP ADDRESS
                            </span>

                            <strong>
                                {{ selectedNode.ip || '-' }}
                            </strong>

                        </div>


                        <!-- MAC -->

                        <div class="detail-row">

                            <span>
                                MAC ADDRESS
                            </span>

                            <strong>
                                {{ selectedNode.mac || '-' }}
                            </strong>

                        </div>


                        <!-- ================================================= -->
                        <!-- SWITCH INFORMATION -->
                        <!-- ================================================= -->

                        <template
                            v-if="
                                selectedNode.kind === 'switch'
                            "
                        >

                            <!-- PORT COUNT -->

                            <div class="detail-row">

                                <span>
                                    PORTS
                                </span>

                                <strong>
                                    {{ selectedNode.portCount || 0 }}
                                </strong>

                            </div>


                            <!-- CHILD SWITCHES -->

                            <div class="detail-row">

                                <span>
                                    CHILD SWITCHES
                                </span>

                                <strong>
                                    {{ selectedNode.childrenCount || 0 }}
                                </strong>

                            </div>

                        </template>


                        <!-- ================================================= -->
                        <!-- DEVICE INFORMATION -->
                        <!-- ================================================= -->

                        <template
                            v-else
                        >

                            <!-- STATUS -->

                            <div class="detail-row">

                                <span>
                                    STATUS
                                </span>

                                <strong
                                    :class="
                                        selectedNode.status === 'OFFLINE'
                                            ? 'status-offline'
                                            : 'status-online'
                                    "
                                >

                                    {{
                                        selectedNode.status ||
                                        'ONLINE'
                                    }}

                                </strong>

                            </div>


                            <!-- SWITCH PORT -->

                            <div
                                v-if="selectedNode.port"
                                class="detail-row"
                            >

                                <span>
                                    SWITCH PORT
                                </span>

                                <strong>
                                    {{ selectedNode.port }}
                                </strong>

                            </div>

                        </template>

                    </div>

                </div>

            </transition>

        </div>

    </div>

</template>


<script setup>

import {
    ref,
    onMounted,
    onUnmounted
} from 'vue'


import api from '../../api/axios'


import {
    useSettings
} from '../../composables/useSettings'


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


import SwitchNode
    from './SwitchNode.vue'


import DeviceNode
    from './DeviceNode.vue'


import '@vue-flow/core/dist/style.css'

import '@vue-flow/core/dist/theme-default.css'


/*
|--------------------------------------------------------------------------
| SETTINGS
|--------------------------------------------------------------------------
*/

const {
    settings,
    loadSettings,
    loadFromStorage
} = useSettings()


/*
|--------------------------------------------------------------------------
| DATA
|--------------------------------------------------------------------------
*/

const nodes = ref([])

const edges = ref([])

const topology = ref([])

const selectedNode = ref(null)

let timer = null


/*
|--------------------------------------------------------------------------
| CUSTOM NODE TYPES
|--------------------------------------------------------------------------
*/

const nodeTypes = {

    switchNode:
        SwitchNode,

    deviceNode:
        DeviceNode

}


/*
|--------------------------------------------------------------------------
| NODE CLICK
|--------------------------------------------------------------------------
*/

const handleNodeClick = (
    event
) => {

    if (
        !event ||
        !event.node
    ) {

        return

    }


    selectedNode.value =
        event.node.data

}


/*
|--------------------------------------------------------------------------
| LOAD TOPOLOGY
|--------------------------------------------------------------------------
*/

const loadTopology = async () => {

    try {

        const response =
            await api.get('/topology')


        topology.value =
            response.data

    } catch (error) {

        console.error(
            'Topology load error:',
            error
        )

    }

}


/*
|--------------------------------------------------------------------------
| ADD SWITCH NODE
|--------------------------------------------------------------------------
*/

const addSwitchNode = (
    sw,
    x,
    y,
    result
) => {


    /*
    |--------------------------------------------------------------------------
    | SWITCH ID
    |--------------------------------------------------------------------------
    */

    const switchId =
        `switch-${sw.id}`


    /*
    |--------------------------------------------------------------------------
    | SWITCH NODE
    |--------------------------------------------------------------------------
    */

    result.nodes.push({

        id:
            switchId,

        type:
            'switchNode',

        position: {

            x:
                x,

            y:
                y

        },

        data: {

            kind:
                'switch',

            id:
                sw.id,

            hostname:
                sw.hostname ||
                sw.ip ||
                'Switch',

            ip:
                sw.ip ||
                '',

            mac:
                sw.mac ||
                '',

            portCount:
                (sw.ports || []).length,

            childrenCount:
                (sw.children || []).length

        }

    })


    /*
    |--------------------------------------------------------------------------
    | COLLECT DEVICES
    |--------------------------------------------------------------------------
    */

    const devices = []


    ;(sw.ports || []).forEach(
        port => {

            ;(port.devices || []).forEach(
                device => {

                    devices.push({

                        device:
                            device,

                        port:
                            port

                    })

                }
            )

        }
    )


    /*
    |--------------------------------------------------------------------------
    | ADD DEVICE NODES
    |--------------------------------------------------------------------------
    */

    devices.forEach(
        (
            item,
            index
        ) => {


            const device =
                item.device


            const port =
                item.port


            /*
            |--------------------------------------------------------------------------
            | DEVICE ID
            |--------------------------------------------------------------------------
            */

            const deviceId =
                `device-${device.id}`


            /*
            |--------------------------------------------------------------------------
            | DEVICE POSITION
            |--------------------------------------------------------------------------
            */

            const column =
                index % 3


            const row =
                Math.floor(
                    index / 3
                )


            const deviceX =
                x -
                140 +
                column * 190


            const deviceY =
                y +
                170 +
                row * 110


            /*
            |--------------------------------------------------------------------------
            | DEVICE NODE
            |--------------------------------------------------------------------------
            */

            result.nodes.push({

                id:
                    deviceId,

                type:
                    'deviceNode',

                position: {

                    x:
                        deviceX,

                    y:
                        deviceY

                },

                data: {

                    kind:
                        'device',

                    id:
                        device.id,

                    name:
                        device.name ||
                        device.ip_address ||
                        device.ip ||
                        'Device',

                    ip:
                        device.ip_address ||
                        device.ip ||
                        '',

                    mac:
                        device.mac_address ||
                        device.mac ||
                        '',

                    status:
                        device.status ||
                        'ONLINE',

                    port:
                        port.name ||
                        `Port ${port.index}`

                }

            })


            /*
            |--------------------------------------------------------------------------
            | SWITCH → DEVICE EDGE
            |--------------------------------------------------------------------------
            */

            result.edges.push({

                id:
                    `${switchId}-${deviceId}`,

                source:
                    switchId,

                target:
                    deviceId,

                type:
                    'smoothstep',

                label:
                    port.name ||
                    `Port ${port.index}`,

                style: {

                    strokeWidth:
                        1.5

                }

            })

        }
    )


    /*
    |--------------------------------------------------------------------------
    | CHILD SWITCHES
    |--------------------------------------------------------------------------
    */

    const children =
        sw.children || []


    if (
        children.length === 0
    ) {

        return

    }


    /*
    |--------------------------------------------------------------------------
    | CHILD SWITCH GAP
    |--------------------------------------------------------------------------
    */

    const childGap =
        340


    const totalHeight =
        (
            children.length -
            1
        ) *
        childGap


    let childY =
        y -
        totalHeight / 2


    /*
    |--------------------------------------------------------------------------
    | ADD CHILD SWITCHES
    |--------------------------------------------------------------------------
    */

    children.forEach(
        child => {


            const childX =
                x +
                460


            const childId =
                `switch-${child.id}`


            /*
            |--------------------------------------------------------------------------
            | SWITCH → SWITCH EDGE
            |--------------------------------------------------------------------------
            */

            result.edges.push({

                id:
                    `${switchId}-${childId}`,

                source:
                    switchId,

                target:
                    childId,

                type:
                    'smoothstep',

                animated:
                    true,

                label:
                    'UPLINK',

                style: {

                    strokeWidth:
                        2

                }

            })


            /*
            |--------------------------------------------------------------------------
            | RECURSIVE CHILD
            |--------------------------------------------------------------------------
            */

            addSwitchNode(

                child,

                childX,

                childY,

                result

            )


            childY +=
                childGap

        }
    )

}


/*
|--------------------------------------------------------------------------
| BUILD GRAPH
|--------------------------------------------------------------------------
*/

const createGraph = () => {


    const result = {

        nodes: [],

        edges: []

    }


    /*
    |--------------------------------------------------------------------------
    | ROOT SWITCH POSITION
    |--------------------------------------------------------------------------
    */

    let rootY =
        500


    /*
    |--------------------------------------------------------------------------
    | BUILD ALL ROOT SWITCHES
    |--------------------------------------------------------------------------
    */

    topology.value.forEach(
        root => {

            addSwitchNode(

                root,

                500,

                rootY,

                result

            )


            rootY +=
                1000

        }
    )


    /*
    |--------------------------------------------------------------------------
    | APPLY GRAPH
    |--------------------------------------------------------------------------
    */

    nodes.value =
        result.nodes


    edges.value =
        result.edges


    console.log(
        'Topology nodes:',
        nodes.value
    )


    console.log(
        'Topology edges:',
        edges.value
    )

}


/*
|--------------------------------------------------------------------------
| AUTO REFRESH
|--------------------------------------------------------------------------
*/

const startAutoRefresh = () => {


    clearInterval(
        timer
    )


    timer = null


    /*
    |--------------------------------------------------------------------------
    | CHECK SETTING
    |--------------------------------------------------------------------------
    */

    if (
        !settings.value.auto_refresh
    ) {

        return

    }


    /*
    |--------------------------------------------------------------------------
    | INTERVAL
    |--------------------------------------------------------------------------
    */

    const seconds =
        Math.max(

            Number(
                settings.value.scan_interval ||
                60
            ),

            1

        )


    /*
    |--------------------------------------------------------------------------
    | START TIMER
    |--------------------------------------------------------------------------
    */

    timer = setInterval(
        async () => {


            await loadTopology()


            createGraph()

        },
        seconds * 1000
    )

}


/*
|--------------------------------------------------------------------------
| MOUNT
|--------------------------------------------------------------------------
*/

onMounted(
    async () => {


        loadFromStorage()


        await loadSettings()


        await loadTopology()


        createGraph()


        startAutoRefresh()

    }
)


/*
|--------------------------------------------------------------------------
| UNMOUNT
|--------------------------------------------------------------------------
*/

onUnmounted(() => {


    clearInterval(
        timer
    )

})

</script>


<style scoped>

.topology-wrapper {

    width: 100%;

    height: 100%;

    min-width: 0;

    max-width: none;

    box-sizing: border-box;

    background: white;

    border: 1px solid #e5e7eb;

    border-radius: 16px;

    overflow: hidden;

}


/* ================================================================ */
/* HEADER */
/* ================================================================ */

.topology-header {

    height: 75px;

    padding:
        0 24px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    border-bottom:
        1px solid #e5e7eb;

    box-sizing: border-box;

}


.title {

    margin: 0;

    font-size: 18px;

    font-weight: 700;

    color: #111827;

}


.subtitle {

    margin:
        4px 0 0;

    font-size: 13px;

    color: #6b7280;

}


/* ================================================================ */
/* LIVE */
/* ================================================================ */

.live-status {

    display: flex;

    align-items: center;

    gap: 7px;

    padding:
        6px 11px;

    border-radius: 20px;

    background:
        #ecfdf5;

    color:
        #047857;

    font-size: 11px;

    font-weight: 700;

}


.live-dot {

    width: 7px;

    height: 7px;

    border-radius: 50%;

    background:
        #10b981;

}


/* ================================================================ */
/* BODY */
/* ================================================================ */

.topology-body {

    position: relative;

    width: 100%;

    min-width: 0;

}


/* ================================================================ */
/* CANVAS */
/* ================================================================ */

.topology-canvas {

    width: 100%;

    height:
        calc(100vh - 175px);

    min-height:
        650px;

    min-width: 0;

    position: relative;

}


/* ================================================================ */
/* DETAILS PANEL */
/* ================================================================ */

.details-panel {

    position: absolute;

    top: 15px;

    right: 15px;

    width: 300px;

    padding: 22px;

    box-sizing: border-box;

    background: white;

    border:
        1px solid #e2e8f0;

    border-radius: 16px;

    box-shadow:
        0 15px 40px
        rgba(15, 23, 42, .18);

    z-index: 100;

}


/* ================================================================ */
/* CLOSE */
/* ================================================================ */

.close-button {

    position: absolute;

    top: 10px;

    right: 12px;

    width: 30px;

    height: 30px;

    display: flex;

    align-items: center;

    justify-content: center;

    border: none;

    border-radius: 8px;

    background:
        #f1f5f9;

    color:
        #475569;

    font-size: 21px;

    line-height: 1;

    cursor: pointer;

}


.close-button:hover {

    background:
        #e2e8f0;

}


/* ================================================================ */
/* PANEL ICON */
/* ================================================================ */

.panel-icon {

    width: 50px;

    height: 50px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 13px;

    font-size: 26px;

}


.switch-icon {

    background:
        #eff6ff;

}


.device-icon {

    background:
        #f1f5f9;

}


/* ================================================================ */
/* PANEL TITLE */
/* ================================================================ */

.panel-title {

    margin:
        13px 0 8px;

    padding-right:
        25px;

    font-size: 18px;

    font-weight: 700;

    color:
        #0f172a;

    word-break: break-word;

}


/* ================================================================ */
/* BADGE */
/* ================================================================ */

.type-badge {

    display: inline-block;

    padding:
        4px 10px;

    border-radius: 6px;

    font-size: 9px;

    font-weight: 700;

}


.switch-badge {

    background:
        #dbeafe;

    color:
        #1d4ed8;

}


.online-badge {

    background:
        #dcfce7;

    color:
        #15803d;

}


.offline-badge {

    background:
        #fee2e2;

    color:
        #dc2626;

}


/* ================================================================ */
/* DETAILS LIST */
/* ================================================================ */

.details-list {

    margin-top:
        18px;

    border-top:
        1px solid #e2e8f0;

}


/* ================================================================ */
/* DETAIL ROW */
/* ================================================================ */

.detail-row {

    display: flex;

    flex-direction: column;

    gap: 4px;

    padding:
        12px 0;

    border-bottom:
        1px solid #f1f5f9;

}


.detail-row span {

    font-size: 9px;

    color:
        #94a3b8;

    font-weight: 700;

    letter-spacing:
        .04em;

}


.detail-row strong {

    font-size: 12px;

    color:
        #334155;

    word-break: break-all;

}


.status-online {

    color:
        #059669 !important;

}


.status-offline {

    color:
        #dc2626 !important;

}


/* ================================================================ */
/* PANEL ANIMATION */
/* ================================================================ */

.details-enter-active,
.details-leave-active {

    transition:
        all .2s ease;

}


.details-enter-from,
.details-leave-to {

    opacity: 0;

    transform:
        translateX(20px);

}


/* ================================================================ */
/* VUE FLOW */
/* ================================================================ */

:deep(.vue-flow) {

    width: 100%;

    height: 100%;

}


:deep(.vue-flow__node) {

    box-sizing:
        border-box;

}


/* ================================================================ */
/* EDGES */
/* ================================================================ */

:deep(.vue-flow__edge-path) {

    stroke:
        #64748b;

}


:deep(.vue-flow__edge.animated .vue-flow__edge-path) {

    stroke:
        #2563eb;

}


:deep(.vue-flow__edge-text) {

    font-size:
        10px;

    font-weight:
        600;

}


:deep(.vue-flow__edge-textbg) {

    fill:
        white;

}


/* ================================================================ */
/* MINIMAP */
/* ================================================================ */

:deep(.vue-flow__minimap) {

    border-radius:
        10px;

}


/* ================================================================ */
/* CONTROLS */
/* ================================================================ */

:deep(.vue-flow__controls) {

    border-radius:
        10px;

    overflow:
        hidden;

}

</style>