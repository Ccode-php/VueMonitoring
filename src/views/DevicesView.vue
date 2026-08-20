<template>

    <div>

        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-3">

            <div>

                <h1 class="text-3xl font-bold">
                    Qurilmalar
                </h1>

                <div class="text-gray-500 mt-2">

                    Topildi

                    <span class="font-semibold">
                        {{ pagination.total || 0 }}
                    </span>

                    ta qurilma

                </div>

            </div>

            <div class="text-sm text-gray-400">

                Oxirgi yangilanish:

                {{ lastRefresh }}

            </div>

        </div>


        <!-- Search -->

        <DeviceFilter
            v-model:search="search"
        />


        <!-- Table -->

        <DeviceTable
            :devices="devices"
            @select="goDevice"
        />


        <!-- Notification -->

        <Notification
            :show="notification.show"
            :title="notification.title"
            :message="notification.message"
        />


        <!-- Pagination -->

        <Pagination
            :pagination="pagination"
            @change="changePage"
        />

    </div>

</template>


<script setup>

import {
    ref,
    onMounted,
    onUnmounted,
    watch
} from 'vue'

import {
    useRouter
} from 'vue-router'

import api from '../api/axios'

import DeviceFilter
    from '../components/devices/DeviceFilter.vue'

import DeviceTable
    from '../components/devices/DeviceTable.vue'

import Notification
    from '../components/common/Notification.vue'

import Pagination
    from '../components/common/Pagination.vue'


/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
*/

const router = useRouter()


/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const devices = ref([])

const pagination = ref({})

const search = ref('')

const lastRefresh = ref('-')

const firstLoad = ref(true)

let timer = null

let searchTimer = null


/*
|--------------------------------------------------------------------------
| Notification
|--------------------------------------------------------------------------
*/

const notification = ref({

    show: false,

    title: '',

    message: ''

})


const audio = new Audio('/notification.mp3')


/*
|--------------------------------------------------------------------------
| Load devices
|--------------------------------------------------------------------------
*/

const loadDevices = async (
    page = 1,
    showNotification = false
) => {

    try {

        const oldDevices = JSON.parse(
            JSON.stringify(devices.value)
        )


        const res = await api.get(
            '/devices',
            {
                params: {

                    page,

                    search: search.value

                }

            }
        )


        devices.value =
            res.data.data


        pagination.value = {

            current_page:
                res.data.current_page,

            last_page:
                res.data.last_page,

            total:
                res.data.total,

            per_page:
                res.data.per_page

        }


        /*
        |--------------------------------------------------------------------------
        | Notification faqat AUTO REFRESH paytida
        |--------------------------------------------------------------------------
        */

        if (
            showNotification &&
            !firstLoad.value
        ) {

            checkChanges(
                oldDevices,
                devices.value
            )

        }


        firstLoad.value = false


    } catch (err) {

        console.error(
            'Devices load error:',
            err
        )

    }


    lastRefresh.value =
        new Date().toLocaleTimeString()

}


/*
|--------------------------------------------------------------------------
| Detect changes
|--------------------------------------------------------------------------
*/

const checkChanges = (
    oldDevices,
    newDevices
) => {

    newDevices.forEach(device => {

        const previous =
            oldDevices.find(
                item =>
                    item.id === device.id
            )


        /*
        | New device
        */

        if (!previous) {

            notify(

                'Yangi qurilma',

                `${device.name || 'Noma\'lum'} (${device.ip_address})`

            )

            return
        }


        /*
        | Status changed
        */

        if (
            previous.status !==
            device.status
        ) {

            if (
                device.status === 'ONLINE'
            ) {

                notify(

                    'Qurilma online',

                    `${device.name || 'Noma\'lum'} (${device.ip_address})`

                )

            } else {

                notify(

                    'Qurilma offline',

                    `${device.name || 'Noma\'lum'} (${device.ip_address})`

                )

            }

        }

    })

}


/*
|--------------------------------------------------------------------------
| Pagination
|--------------------------------------------------------------------------
*/

const changePage = (
    page
) => {

    if (
        page < 1 ||
        page > pagination.value.last_page
    ) {

        return

    }


    /*
    | Paginationda notification YO‘Q
    */

    loadDevices(
        page,
        false
    )

}


/*
|--------------------------------------------------------------------------
| Open device
|--------------------------------------------------------------------------
*/

const goDevice = (
    id
) => {

    router.push(
        '/devices/' + id
    )

}


/*
|--------------------------------------------------------------------------
| Notification
|--------------------------------------------------------------------------
*/

const notify = (
    title,
    message
) => {

    notification.value = {

        show: true,

        title,

        message

    }


    audio
        .play()
        .catch(() => {})


    setTimeout(() => {

        notification.value.show = false

    }, 4000)

}


/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

watch(
    search,
    () => {

        clearTimeout(
            searchTimer
        )


        searchTimer =
            setTimeout(() => {

                /*
                | Qidiruv boshlanganda
                | 1-sahifaga qaytamiz
                */

                loadDevices(
                    1,
                    false
                )

            }, 400)

    }
)


/*
|--------------------------------------------------------------------------
| Auto refresh
|--------------------------------------------------------------------------
*/

onMounted(() => {

    loadDevices(
        1,
        false
    )


    timer = setInterval(() => {

        loadDevices(

            pagination.value.current_page || 1,

            true

        )

    }, 60000)

})


/*
|--------------------------------------------------------------------------
| Cleanup
|--------------------------------------------------------------------------
*/

onUnmounted(() => {

    clearInterval(timer)

    clearTimeout(searchTimer)

})

</script>