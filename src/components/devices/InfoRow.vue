<template>

    <div>

        <div class="text-sm text-slate-500 mb-1">

            {{ label }}

        </div>

        <div class="font-semibold break-all">

            <slot />

        </div>

    </div>

</template>

<script setup>

defineProps({

    label: String

})

</script>