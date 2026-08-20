<template>

    <div class="bg-white rounded-xl shadow p-6">

        <EditableName

            v-model="device.name"

            @save="$emit('save')"

        />

        <div class="grid md:grid-cols-2 gap-6 mt-8">

            <InfoRow label="IP manzil">

                <span class="font-mono">

                    {{ device.ip_address }}

                </span>

            </InfoRow>

            <InfoRow label="MAC manzil">

                <span class="font-mono">

                    {{ device.mac_address }}

                </span>

            </InfoRow>

            <InfoRow label="Holati">

                <StatusBadge

                    :status="device.status"

                />

            </InfoRow>

            <InfoRow label="Oxirgi ko‘rilgan">

                {{ formatDate(device.last_seen_at) }}

            </InfoRow>

            <InfoRow label="Switch">

                {{ switchName }}

            </InfoRow>

            <InfoRow label="Port">

                {{ portName }}

            </InfoRow>

        </div>

    </div>

</template>

<script setup>

import { computed } from 'vue'

import EditableName from './EditableName.vue'
import InfoRow from './InfoRow.vue'
import StatusBadge from '../devices/StatusBadge.vue'

const props = defineProps({

    device: Object

})

defineEmits([

    'save'

])

const formatDate = (date) => {

    if (!date)

        return '-'

    return new Date(date).toLocaleString()

}

const switchName = computed(() => {

    return props.device.switch_port?.network_switch?.hostname || '-'

})

const portName = computed(() => {

    return props.device.switch_port?.port_name || '-'

})

</script>