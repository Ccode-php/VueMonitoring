<template>

    <div>

        <label class="block mb-2 font-semibold">

            Qurilma nomi

        </label>

        <div class="flex gap-3">

            <input

                v-model="model"

                class="border rounded-lg px-3 py-2 flex-1"

            >

            <button

                @click="$emit('save')"

                class="bg-blue-600 text-white px-5 rounded-lg"

            >

                Saqlash

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