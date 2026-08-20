<template>

    <div v-if="pagination.last_page > 1" class="mt-8 flex flex-col items-center gap-4">

        <div class="text-sm text-gray-500">

            Jami

            <b>{{ pagination.total }}</b>

            ta qurilma

        </div>

        <div class="flex flex-wrap justify-center items-center gap-1">

            <button class="px-3 py-2 border rounded disabled:opacity-40" :disabled="pagination.current_page === 1"
                @click="$emit('change', 1)">
                «
            </button>

            <button class="px-3 py-2 border rounded disabled:opacity-40" :disabled="pagination.current_page === 1"
                @click="$emit('change', pagination.current_page - 1)">
                ‹
            </button>

            <template v-for="page in pages" :key="page">

                <span v-if="page === '...'" class="px-2">
                    ...
                </span>

                <button v-else @click="$emit('change', page)" :class="[

                    'px-3 py-2 rounded border min-w-10',

                    page === pagination.current_page

                        ?

                        'bg-blue-600 text-white border-blue-600'

                        :

                        'bg-white hover:bg-slate-100'

                ]">

                    {{ page }}

                </button>

            </template>

            <button class="px-3 py-2 border rounded disabled:opacity-40"
                :disabled="pagination.current_page === pagination.last_page"
                @click="$emit('change', pagination.current_page + 1)">
                ›
            </button>

            <button class="px-3 py-2 border rounded disabled:opacity-40"
                :disabled="pagination.current_page === pagination.last_page"
                @click="$emit('change', pagination.last_page)">
                »
            </button>

        </div>

    </div>

</template>

<script setup>

import {

    computed

} from 'vue'

const props = defineProps({

    pagination: Object

})

defineEmits([

    'change'

])

const pages = computed(() => {

    const current = props.pagination.current_page

    const last = props.pagination.last_page

    if (!last)

        return []

    const items = []

    items.push(1)

    if (current > 3)

        items.push('...')

    for (

        let i = Math.max(2, current - 1);

        i <= Math.min(last - 1, current + 1);

        i++

    ) {

        items.push(i)

    }

    if (current < last - 2)

        items.push('...')

    if (last > 1)

        items.push(last)

    return items

})

</script>