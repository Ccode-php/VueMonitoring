<template>

    <div class="topology-wrapper">

        <!-- HEADER -->

        <div class="topology-header">

            <div>
                <h2 class="topology-title">Network Topology</h2>
                <p class="topology-subtitle">Switches, devices and network connections</p>
            </div>

            <div class="live-status">
                <span class="live-dot"></span>
                LIVE
            </div>

        </div>


        <div class="topology-body">

            <!-- VUE FLOW -->

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
                    @node-drag-stop="handleDragStop"
                >
                    <Background :gap="20" />
                    <MiniMap />
                    <Controls />
                </VueFlow>

            </div>


            <!-- DETAILS PANEL -->

            <transition name="details">

                <div v-if="selectedNode" class="details-panel">

                    <button class="close-button" @click="selectedNode = null">×</button>

                    <div
                        class="panel-icon"
                        :class="isSwitch ? 'panel-icon-switch' : 'panel-icon-device'"
                    >
                        {{ isSwitch ? '🌐' : '💻' }}
                    </div>

                    <h3 class="panel-title">
                        {{ selectedNode.hostname || selectedNode.name || selectedNode.ip || 'Device' }}
                    </h3>

                    <div
                        class="type-badge"
                        :class="isSwitch ? 'switch-badge' : (selectedNode.status === 'OFFLINE' ? 'offline-badge' : 'online-badge')"
                    >
                        {{ isSwitch ? 'SWITCH' : (selectedNode.status || 'ONLINE') }}
                    </div>

                    <div class="details-list">

                        <div class="detail-row">
                            <span>IP ADDRESS</span>
                            <strong>{{ selectedNode.ip || '-' }}</strong>
                        </div>

                        <div class="detail-row">
                            <span>MAC ADDRESS</span>
                            <strong>{{ selectedNode.mac || '-' }}</strong>
                        </div>

                        <div class="detail-row">
                            <span>STATUS</span>
                            <strong :class="selectedNode.status === 'OFFLINE' ? 'status-offline' : 'status-online'">
                                {{ selectedNode.status || 'ONLINE' }}
                            </strong>
                        </div>

                        <template v-if="isSwitch">

                            <div class="detail-row">
                                <span>PORTS</span>
                                <strong>{{ selectedNode.portCount || 0 }}</strong>
                            </div>

                            <div class="detail-row">
                                <span>CHILD SWITCHES</span>
                                <strong>{{ selectedNode.childrenCount || 0 }}</strong>
                            </div>

                        </template>

                        <div v-else-if="selectedNode.port" class="detail-row">
                            <span>SWITCH PORT</span>
                            <strong>{{ selectedNode.port }}</strong>
                        </div>

                    </div>

                </div>

            </transition>

        </div>

    </div>

</template>


<script setup>

import { ref, computed } from 'vue'

import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

import api from '../../api/axios'
import { useAutoRefresh } from '../../composables/useAutoRefresh'

import SwitchNode from './SwitchNode.vue'
import DeviceNode from './DeviceNode.vue'


const nodes = ref([])
const edges = ref([])
const topology = ref([])
const selectedNode = ref(null)

const isSwitch = computed(() => selectedNode.value?.kind === 'switch')

const nodeTypes = {
    switchNode: SwitchNode,
    deviceNode: DeviceNode,
}


/*
|--------------------------------------------------------------------------
| Foydalanuvchi surgan node joylari
|--------------------------------------------------------------------------
| Oldin har yangilanishda hamma node joyiga qaytar edi.
*/

const POSITIONS_KEY = 'topology_positions'

const positions = (() => {
    try {
        return JSON.parse(localStorage.getItem(POSITIONS_KEY)) || {}
    } catch {
        return {}
    }
})()

const savePositions = () => {
    try {
        localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions))
    } catch { /* localStorage yo'q bo'lishi mumkin */ }
}

const handleDragStop = ({ node }) => {
    positions[node.id] = { x: node.position.x, y: node.position.y }

    savePositions()
}

const handleNodeClick = ({ node }) => {
    if (node) selectedNode.value = node.data
}


/*
|--------------------------------------------------------------------------
| Ma'lumot
|--------------------------------------------------------------------------
*/

const loadTopology = async () => {
    try {
        const response = await api.get('/topology')

        topology.value = response.data
    } catch (error) {
        console.error('Topology load error:', error)
    }
}


/*
|--------------------------------------------------------------------------
| Daraxtni node va edge'larga aylantirish
|--------------------------------------------------------------------------
*/

const addSwitchNode = (sw, x, y, result) => {
    const switchId = `switch-${sw.id}`

    result.nodes.push({
        id: switchId,
        type: 'switchNode',
        position: positions[switchId] || { x, y },
        data: {
            kind: 'switch',
            id: sw.id,
            hostname: sw.hostname || sw.ip || 'Switch',
            ip: sw.ip || '',
            mac: sw.mac || '',
            status: sw.status || 'ONLINE',
            portCount: (sw.ports || []).length,
            childrenCount: (sw.children || []).length,
        },
    })

    // Switchga ulangan qurilmalar
    const devices = []

    ;(sw.ports || []).forEach((port) => {
        ;(port.devices || []).forEach((device) => devices.push({ device, port }))
    })

    devices.forEach(({ device, port }, index) => {
        const deviceId = `device-${device.id}`
        const portName = port.name || `Port ${port.index}`

        const defaultPosition = {
            x: x - 140 + (index % 3) * 190,
            y: y + 170 + Math.floor(index / 3) * 110,
        }

        result.nodes.push({
            id: deviceId,
            type: 'deviceNode',
            position: positions[deviceId] || defaultPosition,
            data: {
                kind: 'device',
                id: device.id,
                name: device.name || device.ip_address || 'Device',
                ip: device.ip_address || '',
                mac: device.mac_address || '',
                status: device.status || 'ONLINE',
                port: portName,
            },
        })

        result.edges.push({
            id: `${switchId}-${deviceId}`,
            source: switchId,
            target: deviceId,
            type: 'smoothstep',
            label: portName,
            style: { strokeWidth: 1.5 },
        })
    })

    // Child switchlar (rekursiv)
    const children = sw.children || []

    const childGap = 340
    let childY = y - ((children.length - 1) * childGap) / 2

    children.forEach((child) => {
        const childId = `switch-${child.id}`

        result.edges.push({
            id: `${switchId}-${childId}`,
            source: switchId,
            target: childId,
            type: 'smoothstep',
            animated: true,
            label: 'UPLINK',
            style: { strokeWidth: 2 },
        })

        addSwitchNode(child, x + 460, childY, result)

        childY += childGap
    })
}

const createGraph = () => {
    const result = { nodes: [], edges: [] }

    let rootY = 500

    topology.value.forEach((root) => {
        addSwitchNode(root, 500, rootY, result)

        rootY += 1000
    })

    nodes.value = result.nodes
    edges.value = result.edges

    // Ochiq panel eskirgan ma'lumot ko'rsatmasligi uchun yangilanadi
    if (selectedNode.value) {
        const current = result.nodes.find(
            (n) => n.data.kind === selectedNode.value.kind && n.data.id === selectedNode.value.id
        )

        selectedNode.value = current ? current.data : null
    }
}


/*
|--------------------------------------------------------------------------
| Yuklash va davriy yangilash (useAutoRefresh: interval + yangi hodisa)
|--------------------------------------------------------------------------
*/

useAutoRefresh(async () => {
    await loadTopology()

    createGraph()
})

</script>
