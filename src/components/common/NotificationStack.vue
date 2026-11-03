<template>

    <div class="fixed top-5 right-5 w-96 z-50 space-y-3">

        <div
            v-for="item in events.notifications"
            :key="item.id"
            @click="events.dismiss(item.id)"
            class="bg-white rounded-xl shadow-2xl border-l-4 border-blue-500 p-4 cursor-pointer hover:bg-blue-50 transition"
        >

            <div class="font-bold text-slate-800">{{ item.title }}</div>

            <div class="text-gray-600 mt-1">{{ item.message }}</div>

            <div class="text-xs text-gray-400 mt-2">Yopish uchun bosing</div>

        </div>

    </div>

</template>

<script setup>

import { useEventsStore } from '../../stores/events'

const events = useEventsStore()

</script>
