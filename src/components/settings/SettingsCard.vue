<template>
    <div class="bg-white rounded-xl shadow p-6">

        <h2 class="text-xl font-semibold mb-5">

            {{ title }}

        </h2>

        <slot />

    </div>
</template>

<script setup>

defineProps({

    title: String

})

</script>