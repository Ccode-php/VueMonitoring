<template>

    <div
        class="device-node"
        :class="{ selected: selected }"
        @click="selectNode"
    >

        <div class="device-icon">
            💻
        </div>

        <div class="device-info">

            <div class="device-name">
                {{ data.name || data.ip || 'Device' }}
            </div>

            <div class="device-ip">
                {{ data.ip || 'No IP' }}
            </div>

            <div class="device-mac">
                {{ data.mac || 'No MAC' }}
            </div>

        </div>

        <div
            class="device-status"
            :class="
                data.status === 'OFFLINE'
                    ? 'offline'
                    : 'online'
            "
        >

            <span></span>

            {{ data.status || 'ONLINE' }}

        </div>

        <div
            v-if="data.port"
            class="port-label"
        >

            {{ data.port }}

        </div>

    </div>

</template>


<script setup>

const props = defineProps({

    data: {
        type: Object,
        required: true
    },

    selected: {
        type: Boolean,
        default: false
    }

})


const selectNode = () => {

    console.log(
        'DEVICE CLICK:',
        props.data
    )

}

</script>


<style scoped>

.device-node {

    width: 170px;

    min-height: 72px;

    position: relative;

    display: flex;

    align-items: center;

    gap: 9px;

    padding: 10px;

    background: white;

    border: 1px solid #cbd5e1;

    border-radius: 10px;

    box-sizing: border-box;

    cursor: pointer;

    box-shadow:
        0 3px 10px
        rgba(15, 23, 42, .09);

    transition: .2s;

}


.device-node:hover {

    transform: translateY(-2px);

    border-color: #64748b;

}


.device-node.selected {

    border-color: #7c3aed;

    box-shadow:
        0 0 0 3px
        rgba(124, 58, 237, .12);

}


.device-icon {

    width: 34px;

    height: 34px;

    flex-shrink: 0;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 8px;

    background: #f1f5f9;

    font-size: 18px;

}


.device-info {

    min-width: 0;

    flex: 1;

}


.device-name {

    font-size: 12px;

    font-weight: 700;

    color: #1e293b;

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;

}


.device-ip {

    margin-top: 3px;

    font-size: 10px;

    color: #475569;

}


.device-mac {

    margin-top: 2px;

    font-size: 8px;

    color: #94a3b8;

}


.device-status {

    position: absolute;

    right: 7px;

    top: 6px;

    display: flex;

    align-items: center;

    gap: 3px;

    font-size: 7px;

    font-weight: 700;

}


.device-status span {

    width: 5px;

    height: 5px;

    border-radius: 50%;

    background: #10b981;

}


.device-status.offline {

    color: #dc2626;

}


.device-status.offline span {

    background: #ef4444;

}


.device-status.online {

    color: #059669;

}


.port-label {

    position: absolute;

    bottom: -18px;

    left: 50%;

    transform: translateX(-50%);

    padding: 2px 6px;

    border-radius: 4px;

    background: #334155;

    color: white;

    font-size: 8px;

    white-space: nowrap;

}

</style>