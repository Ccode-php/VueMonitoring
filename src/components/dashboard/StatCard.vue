<template>

    <div
        class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition">

        <div class="flex justify-between items-start">

            <div>

                <p
                    class="text-slate-500 text-sm">

                    {{ title }}

                </p>

                <h2
                    class="text-4xl font-bold mt-3 text-slate-800">

                    {{ value }}

                </h2>

            </div>

            <div
                :class="color"
                class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl">

                {{ icon }}

            </div>

        </div>

    </div>

</template>

<script setup>

defineProps({

    title: String,

    value: [String, Number],

    icon: String,

    color: String

})

</script>