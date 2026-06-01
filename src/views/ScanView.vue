<template>

    <div>

        <h1 class="text-3xl font-bold mb-5">

            Tarmoqlarni Skanerlash

        </h1>

        <div class="bg-white p-5 rounded shadow">

            <label class="block mb-2 font-medium">

                Tarmoq manzili

            </label>

            <input
                v-model="network"
                class="border rounded p-3 w-full"
                placeholder="192.168.1.0/24"
            >

            <button
                @click="addNetwork"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 mt-3 rounded"
            >
                Tarmoq qo'shish
            </button>

        </div>

        <div class="bg-white p-5 rounded shadow mt-5">

            <h2 class="text-xl font-bold mb-4">

                Kuzatilayotgan tarmoqlar

            </h2>

            <table class="w-full border-collapse">

                <thead>

                    <tr class="bg-gray-100 border-b">

                        <th class="p-3 text-left">
                            Tarmoq
                        </th>

                        <th class="p-3 text-center">
                            Holati
                        </th>

                        <th class="p-3 text-center">
                            Amallar
                        </th>

                    </tr>

                </thead>

                <tbody>

                    <tr
                        v-for="task in tasks"
                        :key="task.id"
                        class="border-b hover:bg-gray-50"
                    >

                        <td class="p-3 font-medium">

                            {{ task.network }}

                        </td>

                        <td class="p-3 text-center">

                            <span
                                v-if="task.enabled"
                                class="bg-green-100 text-green-700 px-3 py-1 rounded"
                            >
                                Faol
                            </span>

                            <span
                                v-else
                                class="bg-red-100 text-red-700 px-3 py-1 rounded"
                            >
                                O‘chiq
                            </span>

                        </td>

                        <td class="p-3 text-center">

                            <button
                                @click="toggle(task.id)"
                                class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded mr-2"
                            >
                                Yoqish/O‘chirish
                            </button>

                            <button
                                @click="remove(task.id)"
                                class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                            >
                                O‘chirish
                            </button>

                        </td>

                    </tr>

                    <tr
                        v-if="tasks.length === 0"
                    >

                        <td
                            colspan="3"
                            class="text-center p-5 text-gray-500"
                        >

                            Tarmoqlar mavjud emas

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    </div>

</template>
    
    <script setup>
    
    import {
        ref,
        onMounted
    }
    from 'vue'
    
    import api from '../api/axios'
    
    const network = ref('')
    
    const tasks = ref([])
    
    const loadTasks = async () => {
    
        const response =
            await api.get(
                '/scan-tasks'
            )
    
        tasks.value =
            response.data
    }
    
    const addNetwork = async () => {
    
        await api.post(
            '/scan-tasks',
            {
                network:
                    network.value
            }
        )
    
        network.value = ''
    
        loadTasks()
    }
    
    const toggle = async (id) => {
    
        await api.put(
            `/scan-tasks/${id}/toggle`
        )
    
        loadTasks()
    }
    
    const remove = async (id) => {
    
        await api.delete(
            `/scan-tasks/${id}`
        )
    
        loadTasks()
    }
    
    onMounted(
        loadTasks
    )
    
    </script>