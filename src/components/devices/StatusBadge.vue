<template>

    <span
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
        :class="badgeClass"
    >

        <span
            class="w-2.5 h-2.5 rounded-full"
            :class="dotClass"
        ></span>

        {{ text }}

    </span>

</template>

<script setup>

import { computed } from 'vue'

const props = defineProps({

    status: String

})

const text = computed(() => {

    switch (props.status) {

        case 'ONLINE':
            return 'Online'

        case 'OFFLINE':
            return 'Offline'

        default:
            return 'Unknown'

    }

})

const badgeClass = computed(() => {

    switch (props.status) {

        case 'ONLINE':
            return 'bg-green-100 text-green-700'

        case 'OFFLINE':
            return 'bg-red-100 text-red-700'

        default:
            return 'bg-slate-100 text-slate-600'

    }

})

const dotClass = computed(() => {

    switch (props.status) {

        case 'ONLINE':
            return 'bg-green-500 animate-pulse'

        case 'OFFLINE':
            return 'bg-red-500'

        default:
            return 'bg-slate-400'

    }

})

</script>