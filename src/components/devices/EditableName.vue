<template>

    <div>

        <label class="block mb-2 font-semibold">Qurilma nomi</label>

        <div class="flex gap-3 items-center">

            <input
                v-model="model"
                @keyup.enter="$emit('save')"
                class="border rounded-lg px-3 py-2 flex-1"
            >

            <button
                @click="$emit('save')"
                class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
                Saqlash
            </button>

            <span v-if="saved" class="text-green-600 font-medium whitespace-nowrap">
                ✓ Saqlandi
            </span>

        </div>

    </div>

</template>

<script setup>

const model = defineModel()

defineProps({
    saved: Boolean
})

defineEmits([
    'save'
])

</script>
