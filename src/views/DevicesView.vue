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

        <div class="fixed top-5 right-5 w-96 z-50 space-y-3">

            <div v-for="item in notifications" :key="item.id" @click="removeNotification(item.id)"
                class="bg-white rounded-xl shadow-2xl border-l-4 border-blue-500 p-4 cursor-pointer hover:bg-blue-50 transition">

                <div class="font-bold text-slate-800">

                    {{ item.title }}

                </div>

                <div class="text-gray-600 mt-1">

                    {{ item.message }}

                </div>

                <div class="text-xs text-gray-400 mt-2">

                    Yopish uchun bosing

                </div>

            </div>

        </div>


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
                item => item.id === device.id
            )


        /*
        |--------------------------------------------------------------------------
        | NEW DEVICE
        |--------------------------------------------------------------------------
        */

        if (!previous) {

            notify(
                'Yangi qurilma',
                `${device.name || 'Noma\'lum'} (${device.ip_address})`,
                device
            )

            return
        }


        /*
        |--------------------------------------------------------------------------
        | ONLINE / OFFLINE
        |--------------------------------------------------------------------------
        */

        if (
            previous.status !==
            device.status
        ) {

            if (
                device.status === 'ONLINE'
            ) {

                notify(
                    'Qurilma online bo‘ldi',
                    `${device.name || 'Noma\'lum'} (${device.ip_address})`,
                    device
                )

            } else {

                notify(
                    'Qurilma offline bo‘ldi',
                    `${device.name || 'Noma\'lum'} (${device.ip_address})`,
                    device
                )

            }

        }


        /*
        |--------------------------------------------------------------------------
        | IP CHANGED
        |--------------------------------------------------------------------------
        */

        if (
            previous.ip_address !==
            device.ip_address
        ) {

            notify(
                'IP manzil o‘zgardi',
                `${device.name || 'Noma\'lum'}: ${previous.ip_address} → ${device.ip_address}`,
                device
            )

        }


        /*
        |--------------------------------------------------------------------------
        | MAC CHANGED
        |--------------------------------------------------------------------------
        */

        if (
            previous.mac_address !==
            device.mac_address
        ) {

            notify(
                'MAC manzil o‘zgardi',
                `${device.name || 'Noma\'lum'}: ${previous.mac_address} → ${device.mac_address}`,
                device
            )

        }


        /*
        |--------------------------------------------------------------------------
        | LATEST LOG CHANGED
        |--------------------------------------------------------------------------
        */

        if (
            previous.latest_log?.id !==
            device.latest_log?.id
        ) {

            const event =
                device.latest_log?.event_type

            /*
            | Agar yuqoridagi status/IP/MAC
            | notification allaqachon chiqargan bo‘lsa,
            | yana ikkinchi marta notification bermaymiz.
            */

            if (
                event &&
                event !== 'DEVICE_ONLINE' &&
                event !== 'DEVICE_OFFLINE' &&
                event !== 'IP_CHANGED' &&
                event !== 'MAC_CHANGED' &&
                event !== 'NEW_DEVICE'
            ) {

                notify(
                    eventName(event),
                    device.latest_log?.message ||
                    `${device.name || 'Noma\'lum'} hodisa`
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
    |--------------------------------------------------------------
    | Shu qurilmaning notificationini to'xtatamiz
    |--------------------------------------------------------------
    */

    changedDevices.value = new Set(
        changedDevices.value
    )

    changedDevices.value.delete(id)


    /*
    |--------------------------------------------------------------
    | Agar aynan shu qurilma notification bergan bo'lsa
    |--------------------------------------------------------------
    */

    if (
        notificationDeviceId.value === id
    ) {

        audio.pause()

        audio.currentTime = 0

        notification.value.show = false

        notificationDeviceId.value = null

    }


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
    message,
    device = null
) => {

    const id = ++notificationId

    notifications.value.push({

        id,

        title,

        message

    })


    /*
    |--------------------------------------------------------------------------
    | Device jadvalida highlight
    |--------------------------------------------------------------------------
    */

    if (device) {

        changedDevices.value = {

            ...changedDevices.value,

            [device.id]: {

                title,

                event: device.latest_log?.event_type || null

            }

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Notification sound
    |--------------------------------------------------------------------------
    */

    if (
        settings.value.notification_sound
    ) {

        audio.currentTime = 0

        audio
            .play()
            .catch(() => { })

    }


    /*
    |--------------------------------------------------------------------------
    | Tepadan notificationni avtomatik o‘chirish
    |--------------------------------------------------------------------------
    */

    setTimeout(() => {

        removeNotification(id)

    }, 10000)

}

const removeNotification = (
    id
) => {

    notifications.value =
        notifications.value.filter(
            item => item.id !== id
        )

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