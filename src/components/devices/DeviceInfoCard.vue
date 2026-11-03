<template>

    <div class="bg-white rounded-xl shadow p-6">

        <EditableName
            v-model="name"
            :saved="saved"
            @save="$emit('save', name)"
        />

        <div class="grid md:grid-cols-2 gap-6 mt-8">

            <InfoRow label="IP manzil">
                <span class="font-mono">{{ device.ip_address }}</span>
            </InfoRow>

            <InfoRow label="MAC manzil">
                <span class="font-mono">{{ device.mac_address }}</span>
            </InfoRow>

            <InfoRow label="Holati">
                <StatusBadge :status="device.status" />
            </InfoRow>

            <InfoRow label="Oxirgi ko‘rilgan">
                {{ formatDate(device.last_seen_at) }}
            </InfoRow>

            <InfoRow label="Switch">
                {{ device.switch_port?.network_switch?.hostname || '-' }}
            </InfoRow>

            <InfoRow label="Port">
                {{ device.switch_port?.port_name || '-' }}
            </InfoRow>

        </div>

    </div>

</template>

<script setup>

import { ref, watch } from 'vue'

import EditableName from './EditableName.vue'
import InfoRow from './InfoRow.vue'
import StatusBadge from './StatusBadge.vue'

import { formatDate } from '../../utils/format'

const props = defineProps({
    device: Object,
    saved: Boolean
})

defineEmits([
    'save'
])

// Nom lokal nusxada tahrirlanadi: auto-refresh yozayotgan matnni o'chirib yubormaydi,
// prop'ni to'g'ridan-to'g'ri o'zgartirmaydi.
const name = ref(props.device.name || '')

// Faqat boshqa qurilma ochilganda yangilanadi
watch(() => props.device.id, () => {
    name.value = props.device.name || ''
})

</script>
