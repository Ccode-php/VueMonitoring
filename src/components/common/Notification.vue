<template>

    <Transition name="slide">

        <div
            v-if="show"
            class="fixed top-5 right-5 w-80 bg-white rounded-xl shadow-2xl border-l-4 border-blue-500 p-4 z-50">

            <div class="font-bold">

                {{ title }}

            </div>

            <div class="text-gray-600 mt-1">

                {{ message }}

            </div>

        </div>

    </Transition>

</template>

<script setup>

defineProps({

    show: Boolean,

    title: String,

    message: String

})

</script>

<style scoped>

.slide-enter-active,
.slide-leave-active{

    transition:.3s;

}

.slide-enter-from{

    opacity:0;

    transform:translateX(100%);

}

.slide-leave-to{

    opacity:0;

    transform:translateX(100%);

}

</style>