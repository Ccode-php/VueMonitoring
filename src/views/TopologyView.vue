<template>

    <div class="topology-page">

        <div class="topology-content">

            <NetworkTopology />

        </div>

    </div>

</template>


<script setup>

import NetworkTopology
    from '../components/Network/NetworkTopology.vue'

</script>


<style scoped>

.topology-page {

    width: 100%;

    min-width: 0;

    max-width: none;

    box-sizing: border-box;

}


.topology-content {

    width: 100%;

    min-width: 0;

    max-width: none;

    box-sizing: border-box;

}

</style>