<template>

    <div class="bg-white rounded-xl shadow p-6 mb-6">

        <h2 class="text-lg font-semibold mb-4">

            Yangi tarmoq qo'shish

        </h2>

        <div class="flex gap-3">

            <input

                v-model="model"

                placeholder="192.168.1.0/24"

                class="flex-1 border rounded-lg px-4 py-2"

            >

            <button

                @click="$emit('save')"

                class="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg"

            >

                Qo'shish

            </button>

        </div>

    </div>

</template>

<script setup>

const model = defineModel()

defineEmits([

    'save'

])

</script>