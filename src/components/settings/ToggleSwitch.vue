<template>

    <label class="inline-flex items-center cursor-pointer">

        <input
            type="checkbox"
            class="sr-only peer"
            :checked="modelValue"
            @change="$emit('update:modelValue', $event.target.checked)"
        >

        <!--
            Oldin to'p (knob) alohida <div> edi va peer-checked unga ta'sir qilmasdi.
            Endi to'p `after:` psevdo-elementi, shuning uchun peer-checked ishlaydi.
        -->
        <div
            class="relative w-11 h-6 bg-gray-300 rounded-full transition
                   peer-checked:bg-blue-600
                   after:content-[''] after:absolute after:top-0.5 after:left-0.5
                   after:w-5 after:h-5 after:bg-white after:rounded-full after:transition
                   peer-checked:after:translate-x-5"
        ></div>

    </label>

</template>

<script setup>

defineProps({
    modelValue: Boolean
})

defineEmits([
    'update:modelValue'
])

</script>
