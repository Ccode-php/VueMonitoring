<template>

    <div class="mb-6">

        <input
            :value="search"
            @input="$emit('update:search', $event.target.value)"
            placeholder="IP, MAC yoki qurilma nomi..."
            class="border
                   border-slate-300
                   rounded-xl
                   px-4
                   py-3
                   w-full
                   lg:w-96
                   outline-none
                   focus:ring-2
                   focus:ring-blue-500
                   bg-white"
        >

    </div>

</template>

<script setup>

defineProps({

    search: String

})

defineEmits([

    'update:search'

])

</script>