<template>

    <tr class="border-b hover:bg-slate-50">
    
        <td class="p-3">
    
            {{ network.network }}
    
        </td>
    
        <td class="p-3 text-center">
    
            <ScanStatusBadge
                :status="network.enabled"
            />
    
        </td>
    
        <td class="p-3">
    
            <div class="flex gap-2">
    
                <button
                    @click="$emit('toggle', network)"
                    class="px-3 py-1 rounded bg-blue-600 text-white"
                >
    
                    {{ network.enabled ? 'Disable' : 'Enable' }}
    
                </button>
    
                <button
                    @click="$emit('delete', network.id)"
                    class="px-3 py-1 rounded bg-red-600 text-white"
                >
    
                    Delete
    
                </button>
    
            </div>
    
        </td>
    
    </tr>
    
    </template>
    
    <script setup>
    
    import ScanStatusBadge from './ScanStatusBadge.vue'
    
    defineProps({
    
        network: Object
    
    })
    
    defineEmits([
    
        'toggle',
    
        'delete'
    
    ])
    
    </script>