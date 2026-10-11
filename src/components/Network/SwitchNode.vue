<template>

    <div
        class="switch-node"
        :class="{ selected: selected }"
        @click="selectNode"
    >

        <div class="switch-icon">
            🌐
        </div>

        <div class="switch-info">

            <div class="switch-name">
                {{ data.hostname || data.ip || 'Switch' }}
            </div>

            <div class="switch-ip">
                {{ data.ip || 'No IP' }}
            </div>

            <div class="switch-mac">
                {{ data.mac || 'No MAC' }}
            </div>

        </div>

        <div class="switch-status">

            <span></span>

            ONLINE

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
        'SWITCH CLICK:',
        props.data
    )

}

</script>


<style scoped>

.switch-node {

    width: 250px;

    min-height: 90px;

    position: relative;

    display: flex;

    align-items: center;

    gap: 12px;

    padding: 12px 14px;

    background: white;

    border: 2px solid #2563eb;

    border-radius: 12px;

    box-sizing: border-box;

    cursor: pointer;

    box-shadow:
        0 5px 15px
        rgba(15, 23, 42, .12);

    transition: .2s;

}


.switch-node:hover {

    transform: translateY(-2px);

    box-shadow:
        0 8px 20px
        rgba(15, 23, 42, .18);

}


.switch-node.selected {

    border-color: #7c3aed;

    box-shadow:
        0 0 0 3px
        rgba(124, 58, 237, .15);

}


.switch-icon {

    width: 44px;

    height: 44px;

    flex-shrink: 0;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 10px;

    background: #eff6ff;

    font-size: 23px;

}


.switch-info {

    min-width: 0;

    flex: 1;

}


.switch-name {

    font-size: 14px;

    font-weight: 700;

    color: #111827;

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;

}


.switch-ip {

    margin-top: 3px;

    font-size: 11px;

    color: #475569;

}


.switch-mac {

    margin-top: 2px;

    font-size: 9px;

    color: #94a3b8;

}


.switch-status {

    position: absolute;

    right: 10px;

    top: 8px;

    display: flex;

    align-items: center;

    gap: 4px;

    font-size: 8px;

    font-weight: 700;

    color: #059669;

}


.switch-status span {

    width: 6px;

    height: 6px;

    border-radius: 50%;

    background: #10b981;

}

</style>