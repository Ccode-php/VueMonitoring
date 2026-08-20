<template>

    <label class="inline-flex items-center cursor-pointer">
    
        <input
            type="checkbox"
            class="sr-only peer"
            :checked="modelValue"
            @change="$emit('update:modelValue',$event.target.checked)"
        >
    
        <div
            class="w-11 h-6
            bg-gray-300
            rounded-full
            peer-checked:bg-blue-600
            relative
            transition">
    
            <div
                class="absolute
                top-0.5
                left-0.5
                bg-white
                w-5
                h-5
                rounded-full
                transition
                peer-checked:translate-x-5">
            </div>
    
        </div>
    
    </label>
    
    </template>
    
    <script setup>
    
    defineProps({
    
        modelValue:Boolean
    
    })
    
    defineEmits([
    
        'update:modelValue'
    
    ])
    
    </script>