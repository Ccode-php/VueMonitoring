<template>


    <div v-if="device">
    
        <h1 class="text-3xl font-bold mb-5">
            Qurilma ma'lumotlari
        </h1>
    
        <div class="bg-white p-5 rounded shadow">
    
            <div class="grid grid-cols-2 gap-4">
    
                <div>
                    <div class="text-gray-500">
                        IP manzil
                    </div>
    
                    <div class="font-bold">
                        {{ device.ip_address }}
                    </div>
                </div>
    
                <div>
                    <div class="text-gray-500">
                        MAC manzil
                    </div>
    
                    <div class="font-bold">
                        {{ device.mac_address }}
                    </div>
                </div>
    
                <div>
                    <div class="text-gray-500 mb-1">
                        Qurilma nomi
                    </div>
    
                    <input
                        v-model="device.hostname"
                        type="text"
                        class="border rounded px-3 py-2 w-full"
                        placeholder="Qurilma nomini kiriting"
                    >
                </div>
    
                <div>
                    <div class="text-gray-500 mb-1">
                        Ishlab chiqaruvchi
                    </div>
    
                    <input
                        v-model="device.vendor"
                        type="text"
                        class="border rounded px-3 py-2 w-full"
                        placeholder="Masalan: HP, Cisco, Mikrotik"
                    >
                </div>
    
                <div>
                    <div class="text-gray-500">
                        Qurilma turi
                    </div>
    
                    <div>
                        {{ device.device_type || '-' }}
                    </div>
                </div>
    
                <div>
                    <div class="text-gray-500">
                        Tizim nomi
                    </div>
    
                    <div>
                        {{ device.system_name || '-' }}
                    </div>
                </div>
    
                <div class="col-span-2">
                    <div class="text-gray-500">
                        Tizim tavsifi
                    </div>
    
                    <div>
                        {{ device.system_description || '-' }}
                    </div>
                </div>
    
                <div>
                    <div class="text-gray-500">
                        SNMP holati
                    </div>
    
                    <div>
    
                        <span
                            v-if="device.snmp_enabled"
                            class="bg-green-100 text-green-700 px-2 py-1 rounded"
                        >
                            Yoqilgan
                        </span>
    
                        <span
                            v-else
                            class="bg-red-100 text-red-700 px-2 py-1 rounded"
                        >
                            O‘chirilgan
                        </span>
    
                    </div>
                </div>
    
                <div>
                    <div class="text-gray-500">
                        SNMP versiyasi
                    </div>
    
                    <div>
                        {{ device.snmp_version || '-' }}
                    </div>
                </div>
    
                <div>
                    <div class="text-gray-500">
                        Holati
                    </div>
    
                    <div>
    
                        <span
                            v-if="device.status === 'ONLINE'"
                            class="bg-green-100 text-green-700 px-3 py-1 rounded-full"
                        >
                            Online
                        </span>
    
                        <span
                            v-else
                            class="bg-red-100 text-red-700 px-3 py-1 rounded-full"
                        >
                            Offline
                        </span>
    
                    </div>
                </div>
    
                <div>
                    <div class="text-gray-500">
                        Oxirgi ko‘rilgan vaqt
                    </div>
    
                    <div>
                        {{
                            device.last_seen_at
                                ? new Date(device.last_seen_at).toLocaleString()
                                : '-'
                        }}
                    </div>
                </div>
    
                <div class="col-span-2">
    
                    <button
                        @click="saveDevice"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
                    >
                        Ma'lumotlarni saqlash
                    </button>
    
                </div>
    
            </div>
    
        </div>
    
        <div
            class="bg-white p-5 rounded shadow mt-5"
            v-if="device.metrics && device.metrics.length"
        >
    
            <h2 class="text-2xl font-bold mb-5">
                Qurilma statistikasi
            </h2>
    
            <div
                v-for="metric in device.metrics"
                :key="metric.id"
                class="border-b py-3"
            >
    
                <div>
                    CPU:
                    {{ metric.cpu || 0 }} %
                </div>
    
                <div>
                    Xotira:
                    {{ metric.memory || 0 }} %
                </div>
    
                <div>
                    Harorat:
                    {{ metric.temperature || 0 }} °C
                </div>
    
                <div>
                    Tarmoq kirish:
                    {{ metric.network_in || 0 }}
                </div>
    
                <div>
                    Tarmoq chiqish:
                    {{ metric.network_out || 0 }}
                </div>
    
                <div class="text-sm text-gray-500 mt-2">
    
                    {{
                        new Date(
                            metric.created_at
                        ).toLocaleString()
                    }}
    
                </div>
    
            </div>
    
        </div>
    
        <div class="bg-white p-5 rounded shadow mt-5">
    
            <h2 class="text-2xl font-bold mb-3">
                Qurilma hodisalari
            </h2>
    
            <div
                v-for="log in device.logs"
                :key="log.id"
                class="border-b py-4"
            >
    
                <div class="flex justify-between">
    
                    <div class="font-bold text-yellow-600">
    
                        {{ eventName(log.event_type) }}
    
                    </div>
    
                    <div class="text-sm text-gray-500">
    
                        {{
                            new Date(
                                log.created_at
                            ).toLocaleString()
                        }}
    
                    </div>
    
                </div>
    
                <div class="mt-2 text-gray-700">
    
                    {{ log.message }}
    
                </div>
    
                <div
                    v-if="log.old_ip || log.new_ip"
                    class="text-sm text-blue-600 mt-2"
                >
    
                    IP:
                    {{ log.old_ip }}
                    →
                    {{ log.new_ip }}
    
                </div>
    
                <div
                    v-if="log.old_mac || log.new_mac"
                    class="text-sm text-red-600 mt-2"
                >
    
                    MAC:
                    {{ log.old_mac }}
                    →
                    {{ log.new_mac }}
    
                </div>
    
            </div>
    
        </div>
    
    </div>
    
    
    </template>
    
    <script setup>
    
    import { ref, onMounted } from 'vue'
    import { useRoute } from 'vue-router'
    import api from '../api/axios'
    
    const route = useRoute()
    
    const device = ref(null)
    
    const eventName = (event) => {
    
        const events = {
    
            NEW_DEVICE: 'Yangi qurilma',
    
            IP_CHANGED: 'IP manzil o‘zgardi',
    
            MAC_CHANGED: 'MAC manzil o‘zgardi',
    
            DEVICE_OFFLINE: 'Qurilma offline bo‘ldi',
    
            DEVICE_ONLINE: 'Qurilma online bo‘ldi',
        }
    
        return events[event] || event
    }
    
    const loadDevice = async () => {
    
        const response =
            await api.get(
                '/devices/' + route.params.id
            )
    
        device.value = response.data
    }
    
    const saveDevice = async () => {
    
        try {
    
            await api.put(
                '/devices/' + device.value.id,
                {
                    hostname: device.value.hostname,
                    vendor: device.value.vendor,
                }
            )
    
            alert(
                "Qurilma ma'lumotlari saqlandi"
            )
    
        } catch (error) {
    
            console.log(error)
    
            alert(
                "Xatolik yuz berdi"
            )
        }
    }
    
    onMounted(loadDevice)
    
    </script>
    
