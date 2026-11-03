<template>

    <div class="bg-white rounded-xl shadow p-6 mt-6">

        <h2 class="text-xl font-semibold mb-6">Hodisalar tarixi</h2>

        <div v-if="logs.length" class="space-y-6">

            <div v-for="log in logs" :key="log.id" class="flex gap-4">

                <div class="flex-shrink-0 mt-1">
                    <div
                        class="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        :class="eventBg(log.event_type)"
                    >
                        {{ eventIcon(log.event_type) }}
                    </div>
                </div>

                <div class="flex-1 border-l-2 border-slate-200 pl-5 pb-6">

                    <div class="flex justify-between items-center">
                        <div class="font-semibold">{{ eventName(log.event_type) }}</div>
                        <div class="text-xs text-gray-500">{{ formatDate(log.created_at) }}</div>
                    </div>

                    <div class="mt-2 text-gray-700">{{ log.message }}</div>

                    <div v-if="log.old_ip || log.new_ip" class="mt-2 text-sm text-blue-600">
                        IP: {{ log.old_ip || '-' }} → {{ log.new_ip || '-' }}
                    </div>

                    <div v-if="log.old_mac || log.new_mac" class="text-sm text-red-600">
                        MAC: {{ log.old_mac || '-' }} → {{ log.new_mac || '-' }}
                    </div>

                </div>

            </div>

        </div>

        <div v-else class="text-center text-gray-500 py-10">
            Hodisalar mavjud emas
        </div>

    </div>

</template>

<script setup>

import { formatDate } from '../../utils/format'
import { eventName, eventIcon, eventBg } from '../../utils/events'

defineProps({
    logs: {
        type: Array,
        default: () => []
    }
})

</script>
