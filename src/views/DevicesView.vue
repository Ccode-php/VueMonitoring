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

        <DeviceFilter v-model:search="search" />


        <!-- Table -->

        <DeviceTable :devices="devices" :changed-devices="changedDevices" @select="goDevice" />


        <!-- Notification -->

        <Notification :show="notification.show" :title="notification.title" :message="notification.message" />


        <!-- Pagination -->

        <Pagination :pagination="pagination" @change="changePage" />

    </div>

</template>


<script setup>

import api from '../api/axios'

import {
    ref,
    onMounted,
    onUnmounted,
    watch
} from 'vue'

import {
    useSettings
} from '../composables/useSettings'

import {
    useRouter
} from 'vue-router'

import DeviceFilter
    from '../components/devices/DeviceFilter.vue'

import DeviceTable
    from '../components/devices/DeviceTable.vue'

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

const {
    settings,
    loadSettings,
    loadFromStorage
} = useSettings()

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

const notifications = ref([])

let notificationId = 0

const changedDevices = ref({})

const notificationDeviceId = ref(null)

const audio = new Audio('/notification.mp3')

const playNotificationSound = () => {

    audio.currentTime = 0

    audio
        .play()
        .catch(() => { })

}

audio.loop = true

const pendingNotifications = ref([])
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
        |--------------------------------------------------------------------------
        | Yangi qurilma
        |--------------------------------------------------------------------------
        */

        if (!previous) {

            addDeviceNotification(
                device,
                'Yangi qurilma',
                'NEW_DEVICE'
            )

            return
        }


        /*
        |--------------------------------------------------------------------------
        | Status o'zgardi
        |--------------------------------------------------------------------------
        */

        if (
            previous.status !==
            device.status
        ) {

            if (
                device.status === 'ONLINE'
            ) {

                addDeviceNotification(
                    device,
                    'Qurilma online',
                    'DEVICE_ONLINE'
                )

            } else {

                addDeviceNotification(
                    device,
                    'Qurilma offline',
                    'DEVICE_OFFLINE'
                )

            }

        }


        /*
        |--------------------------------------------------------------------------
        | IP o'zgardi
        |--------------------------------------------------------------------------
        */

        if (
            previous.ip_address !==
            device.ip_address
        ) {

            addDeviceNotification(
                device,
                'IP o‘zgardi',
                'IP_CHANGED'
            )

        }


        /*
        |--------------------------------------------------------------------------
        | MAC o'zgardi
        |--------------------------------------------------------------------------
        */

        if (
            previous.mac_address !==
            device.mac_address
        ) {

            addDeviceNotification(
                device,
                'MAC o‘zgardi',
                'MAC_CHANGED'
            )

        }

    })

}

const addDeviceNotification = (
    device,
    title,
    eventType
) => {

    /*
    |--------------------------------------------------------------------------
    | Shu qurilma notification olgan deb belgilaymiz
    |--------------------------------------------------------------------------
    */

    changedDevices.value = {

        ...changedDevices.value,

        [device.id]: {

            id: device.id,

            title,

            eventType,

            deviceName:
                device.name ||
                'Noma\'lum qurilma',

            ip:
                device.ip_address

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Notification oynasi
    |--------------------------------------------------------------------------
    */

    notification.value = {

        show: true,

        title,

        message:
            `${device.name || 'Noma\'lum qurilma'} (${device.ip_address})`

    }


    /*
    |--------------------------------------------------------------------------
    | Ovoz
    |--------------------------------------------------------------------------
    */

    playNotificationSound()

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

const eventName = (
    event
) => {

    return {

        NEW_DEVICE:
            'Yangi qurilma',

        DEVICE_ONLINE:
            'Qurilma online bo‘ldi',

        DEVICE_OFFLINE:
            'Qurilma offline bo‘ldi',

        IP_CHANGED:
            'IP manzil o‘zgardi',

        MAC_CHANGED:
            'MAC manzil o‘zgardi'

    }[event] || event

}
/*
|--------------------------------------------------------------------------
| Open device
|--------------------------------------------------------------------------
*/

const goDevice = (
    id
) => {

    /*
    |--------------------------------------------------------------------------
    | Faqat bosilgan qurilmaning notificationini o'chiramiz
    |--------------------------------------------------------------------------
    */

    if (
        changedDevices.value[id]
    ) {

        const updated = {
            ...changedDevices.value
        }

        delete updated[id]

        changedDevices.value = updated

    }


    /*
    |--------------------------------------------------------------------------
    | Device detail sahifasiga o'tamiz
    |--------------------------------------------------------------------------
    */

    router.push(
        '/devices/' + id
    )

}


/*
|--------------------------------------------------------------------------
| Notification
|--------------------------------------------------------------------------
*/


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

const startAutoRefresh = () => {

    clearInterval(timer)

    timer = null


    if (
        !settings.value.auto_refresh
    ) {

        return

    }


    const interval =
        Math.max(
            Number(
                settings.value.scan_interval || 60
            ),
            1
        ) * 1000


    timer = setInterval(() => {

        loadDevices(
            pagination.value.current_page || 1,
            true
        )

    }, interval)

}

const handleSettingsUpdated = async () => {

    loadFromStorage()

    await loadSettings()

    startAutoRefresh()

}

onMounted(async () => {

    /*
    |--------------------------------------------------------------------------
    | Settingsni olish
    |--------------------------------------------------------------------------
    */

    loadFromStorage()

    await loadSettings()


    /*
    |--------------------------------------------------------------------------
    | Birinchi load
    |--------------------------------------------------------------------------
    */

    await loadDevices(
        1,
        false
    )


    /*
    |--------------------------------------------------------------------------
    | Auto refresh
    |--------------------------------------------------------------------------
    */

    startAutoRefresh()

})


/*
|--------------------------------------------------------------------------
| Cleanup
|--------------------------------------------------------------------------
*/

onUnmounted(() => {

    clearInterval(timer)

    clearTimeout(searchTimer)

    window.removeEventListener(
        'app-settings-updated',
        handleSettingsUpdated
    )

})

</script>