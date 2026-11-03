<template>

    <div class="device-node" :class="{ selected: selected }">

        <div class="device-icon">💻</div>

        <div class="device-info">
            <div class="device-name">{{ data.name || data.ip || 'Device' }}</div>
            <div class="device-ip">{{ data.ip || 'No IP' }}</div>
            <div class="device-mac">{{ data.mac || 'No MAC' }}</div>
        </div>

        <div class="device-status" :class="data.status === 'OFFLINE' ? 'offline' : 'online'">
            <span></span>
            {{ data.status || 'ONLINE' }}
        </div>

        <div v-if="data.port" class="port-label">{{ data.port }}</div>

    </div>

</template>

<script setup>

// Bosish hodisasini VueFlow'ning @node-click i ushlaydi (NetworkTopology.vue)
defineProps({
    data: {
        type: Object,
        required: true
    },

    selected: {
        type: Boolean,
        default: false
    }
})

</script>
