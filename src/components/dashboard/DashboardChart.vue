<template>

    <div class="h-80">

        <Doughnut
            :data="chartData"
            :options="chartOptions" />

    </div>

</template>

<script setup>

import {
    computed
} from 'vue'

import {
    Doughnut
} from 'vue-chartjs'

import {
    Chart,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js'

Chart.register(
    ArcElement,
    Tooltip,
    Legend
)

const props = defineProps({

    online: Number,

    offline: Number

})

const chartData = computed(() => ({

    labels: [

        'Online',

        'Offline'

    ],

    datasets: [

        {

            data: [

                props.online || 0,

                props.offline || 0

            ],

            backgroundColor: [

                '#22c55e',

                '#ef4444'

            ],

            borderWidth: 0,

        }

    ]

}))

const chartOptions = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

        legend: {

            position: 'bottom'

        }

    }

}

</script>