<template>

    <div class="bg-white rounded-xl shadow">

        <table class="w-full">

            <thead class="bg-slate-300">
                <tr class="text-slate-900 text-sm uppercase">
                    <th class="px-5 py-4 text-left">Qurilma</th>
                    <th class="px-5 py-4 text-left">IP manzil</th>
                    <th class="px-5 py-4 text-left">MAC manzil</th>
                    <th class="px-5 py-4 text-center">Holati</th>
                    <th class="px-5 py-4 text-left">Oxirgi hodisa</th>
                </tr>
            </thead>

            <tbody>

                <tr
                    v-for="device in devices"
                    :key="device.id"
                    @click="emit('select', device.id)"
                    :class="[
                        'border-b border-slate-200 hover:bg-blue-50 transition duration-200 cursor-pointer',
                        changedDevices[device.id] ? 'bg-yellow-50 ring-2 ring-yellow-300' : ''
                    ]"
                >

                    <td class="px-5 py-4 text-slate-900 font-medium">
                        {{ device.name || 'Noma\'lum qurilma' }}
                    </td>

                    <td class="px-5 py-4 text-blue-900 font-mono">
                        {{ device.ip_address }}
                    </td>

                    <td class="px-5 py-4 text-slate-900 font-mono">
                        {{ device.mac_address }}
                    </td>

                    <td class="px-5 py-4">
                        <div class="flex justify-center">
                            <StatusBadge :status="device.status" />
                        </div>
                    </td>

                    <td class="px-5 py-4">

                        <div v-if="device.latest_log">

                            <div class="flex items-center gap-2">

                                <span
                                    v-if="changedDevices[device.id]"
                                    class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400 text-white text-xs font-bold"
                                >!</span>

                                <span
                                    class="font-semibold"
                                    :class="changedDevices[device.id] ? 'text-yellow-700' : 'text-slate-700'"
                                >
                                    {{ eventName(device.latest_log.event_type) }}
                                </span>

                            </div>

                            <div class="text-xs text-slate-500 mt-1">
                                {{ device.latest_log.message }}
                            </div>

                            <div
                                v-if="device.latest_log.old_ip || device.latest_log.new_ip"
                                class="text-xs text-blue-600 mt-1"
                            >
                                IP: {{ device.latest_log.old_ip || '-' }} → {{ device.latest_log.new_ip || '-' }}
                            </div>

                            <div
                                v-if="device.latest_log.old_mac || device.latest_log.new_mac"
                                class="text-xs text-purple-600 mt-1"
                            >
                                MAC: {{ device.latest_log.old_mac || '-' }} → {{ device.latest_log.new_mac || '-' }}
                            </div>

                        </div>

                        <div v-else class="text-slate-400">Hodisa yo'q</div>

                    </td>

                </tr>

                <tr v-if="devices.length === 0">
                    <td colspan="5" class="py-12 text-center text-gray-500">
                        Qurilmalar topilmadi.
                    </td>
                </tr>

            </tbody>

        </table>

    </div>

</template>

<script setup>

import StatusBadge from './StatusBadge.vue'
import { eventName } from '../../utils/events'

defineProps({
    devices: {
        type: Array,
        default: () => []
    },

    changedDevices: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits([
    'select'
])

</script>
