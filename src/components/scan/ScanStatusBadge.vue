<template>

    <span
        class="px-3 py-1 rounded-full text-sm font-medium"
        :class="status
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'"
    >

        {{ status ? 'Faol' : 'O‘chiq' }}

    </span>

</template>

<script setup>

defineProps({

    status: Boolean

})

</script>