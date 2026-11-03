<template>

    <div class="switch-node" :class="{ selected: selected }">

        <div class="switch-icon">🌐</div>

        <div class="switch-info">
            <div class="switch-name">{{ data.hostname || data.ip || 'Switch' }}</div>
            <div class="switch-ip">{{ data.ip || 'No IP' }}</div>
            <div class="switch-mac">{{ data.mac || 'No MAC' }}</div>
        </div>

        <!-- Switch holati endi serverdan keladi (oldin doim ONLINE edi) -->
        <div class="switch-status" :class="{ offline: data.status === 'OFFLINE' }">
            <span></span>
            {{ data.status || 'ONLINE' }}
        </div>

    </div>

</template>

<script setup>

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
