<template>

    <div class="bg-white rounded-xl shadow overflow-hidden">

        <table class="w-full">

            <thead class="bg-slate-300">

                <tr>

                    <th class="p-3 text-left">

                        Tarmoqlar

                    </th>

                    <th class="p-3 text-center">

                        Status

                    </th>

                    <th class="p-3 text-center">

                        Amallar

                    </th>

                </tr>

            </thead>

            <tbody>

                <ScanRow v-for="network in networks" :key="network.id" :network="network"
                    @toggle="$emit('toggle', $event)" @delete="$emit('delete', $event)" />

            </tbody>

        </table>

    </div>

</template>

<script setup>

import ScanRow from './ScanRow.vue'

defineProps({

    networks: Array

})

defineEmits([

    'toggle',

    'delete'

])

</script>