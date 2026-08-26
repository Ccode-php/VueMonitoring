<template>

    <div>

        <!-- HEADER -->

        <div
            class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-3"
        >

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


        <!-- SEARCH -->

        <DeviceFilter
            v-model:search="search"
        />


        <!-- TABLE -->

        <DeviceTable
            :devices="devices"
            :changed-devices="changedDevices"
            @select="goDevice"
        />


        <!-- NOTIFICATIONS -->

        <div
            class="fixed top-5 right-5 w-96 z-50 space-y-3"
        >

            <div
                v-for="item in notifications"
                :key="item.id"

                @click="openNotification(item)"

                class="
                    bg-white
                    rounded-xl
                    shadow-2xl
                    border-l-4
                    p-4
                    cursor-pointer
                    hover:bg-blue-50
                    transition
                "

                :class="notificationBorder(item.eventType)"
            >

                <!-- TITLE -->

                <div class="flex items-center gap-2">

                    <span class="text-lg">

                        {{ notificationIcon(item.eventType) }}

                    </span>

                    <div class="font-bold text-slate-800">

                        {{ item.title }}

                    </div>

                </div>


                <!-- DEVICE -->

                <div
                    class="text-blue-700 font-medium mt-1"
                >

                    {{ item.deviceName }}

                </div>


                <!-- MESSAGE -->

                <div class="text-gray-600 mt-1">

                    {{ item.message }}

                </div>


                <!-- TIME -->

                <div class="text-xs text-gray-400 mt-2">

                    {{ item.time }}

                    · Batafsil ko'rish uchun bosing

                </div>

            </div>

        </div>


        <!-- PAGINATION -->

        <Pagination
            :pagination="pagination"
            @change="changePage"
        />

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
| Settings
|--------------------------------------------------------------------------
*/

const {
    settings,
    loadSettings,
    loadFromStorage
} = useSettings()


/*
|--------------------------------------------------------------------------
| Devices
|--------------------------------------------------------------------------
*/

const devices = ref([])

const pagination = ref({})

const search = ref('')

const lastRefresh = ref('-')


/*
|--------------------------------------------------------------------------
| Timers
|--------------------------------------------------------------------------
*/

let deviceTimer = null

let notificationTimer = null

let searchTimer = null


/*
|--------------------------------------------------------------------------
| First load
|--------------------------------------------------------------------------
*/

const firstLoad = ref(true)


/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

const notifications = ref([])

const changedDevices = ref({})

let notificationId = 0


/*
|--------------------------------------------------------------------------
| Last processed log ID
|--------------------------------------------------------------------------
*/

const lastNotificationId =
    ref(
        Number(
            localStorage.getItem(
                'last_notification_id'
            ) || 0
        )
    )


/*
|--------------------------------------------------------------------------
| Audio
|--------------------------------------------------------------------------
|
| Har bir notification uchun alohida Audio.
|
*/

let audioUnlocked = false


const unlockAudio = async () => {

    if (audioUnlocked) {

        return

    }


    try {

        const sound =
            new Audio(
                '/notification.mp3'
            )

        sound.muted = true

        sound.volume = 0

        await sound.play()

        sound.pause()

        sound.currentTime = 0

        sound.muted = false

        sound.volume = 1

        audioUnlocked = true

        console.log(
            '🔊 Notification audio unlocked'
        )

    } catch (error) {

        console.warn(
            '🔒 Audio unlock failed:',
            error
        )

    }

}


/*
|--------------------------------------------------------------------------
| Notification sound
|--------------------------------------------------------------------------
*/

const playNotificationSound = () => {

    if (
        !settings.value.notification_sound
    ) {

        return

    }


    const sound =
        new Audio(
            '/notification.mp3'
        )

    sound.volume = 1

    sound.preload = 'auto'


    sound.play()
        .then(() => {

            console.log(
                '🔊 Notification sound played'
            )

        })
        .catch(error => {

            console.error(
                '❌ Notification sound error:',
                error
            )

        })

}


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

        const response =
            await api.get(
                '/devices',
                {
                    params: {

                        page,

                        search:
                            search.value

                    }
                }
            )


        devices.value =
            response.data.data


        pagination.value = {

            current_page:
                response.data.current_page,

            last_page:
                response.data.last_page,

            total:
                response.data.total,

            per_page:
                response.data.per_page

        }


        lastRefresh.value =
            new Date()
                .toLocaleTimeString()


    } catch (error) {

        console.error(
            'Devices load error:',
            error
        )

    }
}


/*
|--------------------------------------------------------------------------
| Load NEW notifications
|--------------------------------------------------------------------------
*/

const loadNotifications = async () => {

    try {

        const response =
            await api.get(
                '/devices/notifications',
                {
                    params: {

                        after_id:
                            lastNotificationId.value

                    }
                }
            )


        const logs =
            response.data.logs || []


        if (
            logs.length === 0
        ) {

            return

        }


        /*
        |--------------------------------------------------------------------------
        | Backend latest -> oldest qaytaryapti.
        | Biz esa eski -> yangi tartibda ko'rsatamiz.
        |--------------------------------------------------------------------------
        */

        logs.reverse()


        logs.forEach(log => {

            addNotification(
                log
            )

        })


        /*
        |--------------------------------------------------------------------------
        | Eng katta ID ni saqlaymiz
        |--------------------------------------------------------------------------
        */

        const newLastId =
            Math.max(
                ...logs.map(
                    log =>
                        Number(log.id)
                )
            )


        if (
            newLastId >
            lastNotificationId.value
        ) {

            lastNotificationId.value =
                newLastId


            localStorage.setItem(
                'last_notification_id',
                String(newLastId)
            )

        }


        /*
        |--------------------------------------------------------------------------
        | Table yangilanadi
        |--------------------------------------------------------------------------
        */

        await loadDevices(
            pagination.value.current_page || 1,
            false
        )

    } catch (error) {

        console.error(
            'Notification load error:',
            error
        )

    }

}


/*
|--------------------------------------------------------------------------
| Add notification
|--------------------------------------------------------------------------
*/

const addNotification = (
    log
) => {

    const device =
        log.device || {}


    const notification = {

        id:
            ++notificationId,

        logId:
            log.id,

        deviceId:
            log.device_id,

        eventType:
            log.event_type,

        title:
            eventTitle(
                log.event_type
            ),

        deviceName:
            device.name ||
            'Noma\'lum qurilma',

        message:
            log.message ||
            eventTitle(
                log.event_type
            ),

        time:
            log.created_at
                ? new Date(
                    log.created_at
                ).toLocaleTimeString()
                : ''

    }


    /*
    |--------------------------------------------------------------------------
    | Notificationni qo'shamiz
    |--------------------------------------------------------------------------
    */

    notifications.value.push(
        notification
    )


    /*
    |--------------------------------------------------------------------------
    | Tableda qurilmani belgilaymiz
    |--------------------------------------------------------------------------
    */

    changedDevices.value = {

        ...changedDevices.value,

        [notification.deviceId]:
            true

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
| Event title
|--------------------------------------------------------------------------
*/

const eventTitle = (
    event
) => {

    const events = {

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

    }


    return (
        events[event] ||
        event
    )

}


/*
|--------------------------------------------------------------------------
| Notification icon
|--------------------------------------------------------------------------
*/

const notificationIcon = (
    event
) => {

    const icons = {

        NEW_DEVICE:
            '🆕',

        DEVICE_ONLINE:
            '🟢',

        DEVICE_OFFLINE:
            '🔴',

        IP_CHANGED:
            '🔵',

        MAC_CHANGED:
            '🟣'

    }


    return (
        icons[event] ||
        '⚠️'
    )

}


/*
|--------------------------------------------------------------------------
| Notification border
|--------------------------------------------------------------------------
*/

const notificationBorder = (
    event
) => {

    const borders = {

        NEW_DEVICE:
            'border-green-500',

        DEVICE_ONLINE:
            'border-green-500',

        DEVICE_OFFLINE:
            'border-red-500',

        IP_CHANGED:
            'border-blue-500',

        MAC_CHANGED:
            'border-purple-500'

    }


    return (
        borders[event] ||
        'border-yellow-500'
    )

}


/*
|--------------------------------------------------------------------------
| Notificationni ochish
|--------------------------------------------------------------------------
|
| Faqat BOSILGAN QURILMANING notificationlari o'chadi.
|
*/

const openNotification = (
    notification
) => {

    const deviceId =
        notification.deviceId


    /*
    |--------------------------------------------------------------------------
    | Shu qurilmaga tegishli notificationlarni o'chiramiz
    |--------------------------------------------------------------------------
    */

    notifications.value =
        notifications.value.filter(
            item =>
                item.deviceId !== deviceId
        )


    /*
    |--------------------------------------------------------------------------
    | Tabledagi belgisini olib tashlaymiz
    |--------------------------------------------------------------------------
    */

    const updated = {
        ...changedDevices.value
    }


    delete updated[deviceId]


    changedDevices.value =
        updated


    /*
    |--------------------------------------------------------------------------
    | Device detail
    |--------------------------------------------------------------------------
    */

    router.push(
        `/devices/${deviceId}`
    )

}


/*
|--------------------------------------------------------------------------
| Table device click
|--------------------------------------------------------------------------
*/

const goDevice = (
    id
) => {

    /*
    |--------------------------------------------------------------------------
    | Shu device notificationlarini o'chiramiz
    |--------------------------------------------------------------------------
    */

    notifications.value =
        notifications.value.filter(
            notification =>
                notification.deviceId !== id
        )


    /*
    |--------------------------------------------------------------------------
    | Table belgisini olib tashlash
    |--------------------------------------------------------------------------
    */

    const updated = {
        ...changedDevices.value
    }


    delete updated[id]


    changedDevices.value =
        updated


    /*
    |--------------------------------------------------------------------------
    | Device detail
    |--------------------------------------------------------------------------
    */

    router.push(
        `/devices/${id}`
    )

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
        page >
        pagination.value.last_page
    ) {

        return

    }


    loadDevices(
        page,
        false
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

                loadDevices(
                    1,
                    false
                )

            }, 400)

    }
)


/*
|--------------------------------------------------------------------------
| Device auto refresh
|--------------------------------------------------------------------------
*/

const startDeviceRefresh = () => {

    clearInterval(
        deviceTimer
    )


    if (
        !settings.value.auto_refresh
    ) {

        return

    }


    const seconds =
        Math.max(
            Number(
                settings.value.scan_interval ||
                60
            ),
            1
        )


    deviceTimer =
        setInterval(() => {

            loadDevices(
                pagination.value.current_page ||
                1,

                false
            )

        }, seconds * 1000)

}


/*
|--------------------------------------------------------------------------
| Notification refresh
|--------------------------------------------------------------------------
|
| Notification uchun alohida timer.
|
*/

const startNotificationRefresh = () => {

    clearInterval(
        notificationTimer
    )


    notificationTimer =
        setInterval(() => {

            loadNotifications()

        }, 3000)

}


/*
|--------------------------------------------------------------------------
| Settings changed
|--------------------------------------------------------------------------
*/

const handleSettingsUpdated =
    async () => {

        loadFromStorage()

        await loadSettings()

        startDeviceRefresh()

    }


/*
|--------------------------------------------------------------------------
| Mounted
|--------------------------------------------------------------------------
*/

onMounted(
    async () => {

        /*
        |--------------------------------------------------------------------------
        | Settings
        |--------------------------------------------------------------------------
        */

        loadFromStorage()

        await loadSettings()


        /*
        |--------------------------------------------------------------------------
        | Chrome audio unlock
        |--------------------------------------------------------------------------
        */

        document.addEventListener(
            'pointerdown',
            unlockAudio,
            {
                once: true
            }
        )


        /*
        |--------------------------------------------------------------------------
        | Settings event
        |--------------------------------------------------------------------------
        */

        window.addEventListener(
            'app-settings-updated',
            handleSettingsUpdated
        )


        /*
        |--------------------------------------------------------------------------
        | Devices
        |--------------------------------------------------------------------------
        */

        await loadDevices(
            1,
            false
        )


        /*
        |--------------------------------------------------------------------------
        | Eski notification ID ni aniqlaymiz
        |--------------------------------------------------------------------------
        */

        if (
            lastNotificationId.value === 0
        ) {

            /*
            | Birinchi kirishda eski loglarni
            | notification qilmaymiz.
            */

            const response =
                await api.get(
                    '/devices/notifications',
                    {
                        params: {
                            after_id: 0
                        }
                    }
                )


            const logs =
                response.data.logs || []


            if (
                logs.length > 0
            ) {

                const maxId =
                    Math.max(
                        ...logs.map(
                            log =>
                                Number(log.id)
                        )
                    )


                lastNotificationId.value =
                    maxId


                localStorage.setItem(
                    'last_notification_id',
                    String(maxId)
                )

            }

        }


        /*
        |--------------------------------------------------------------------------
        | Timers
        |--------------------------------------------------------------------------
        */

        startDeviceRefresh()

        startNotificationRefresh()

    }
)


/*
|--------------------------------------------------------------------------
| Cleanup
|--------------------------------------------------------------------------
*/

onUnmounted(() => {

    clearInterval(
        deviceTimer
    )

    clearInterval(
        notificationTimer
    )

    clearTimeout(
        searchTimer
    )


    document.removeEventListener(
        'pointerdown',
        unlockAudio
    )


    window.removeEventListener(
        'app-settings-updated',
        handleSettingsUpdated
    )

})

</script>