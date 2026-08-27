<template>

    <div>

        <!-- ==============================================================
             HEADER
        ============================================================== -->

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


        <!-- ==============================================================
             SEARCH
        ============================================================== -->

        <DeviceFilter
            v-model:search="search"
        />


        <!-- ==============================================================
             DEVICES TABLE
        ============================================================== -->

        <DeviceTable
            :devices="devices"
            :changed-devices="changedDevices"
            @select="goDevice"
        />


        <!-- ==============================================================
             NOTIFICATIONS
        ============================================================== -->

        <div
            class="fixed top-5 right-5 w-96 z-50 space-y-3"
        >

            <div
                v-for="item in notifications"
                :key="item.id"

                @click.stop="removeNotification(item.id)"

                class="
                    bg-white
                    rounded-xl
                    shadow-2xl
                    border-l-4
                    border-blue-500
                    p-4
                    cursor-pointer
                    hover:bg-blue-50
                    transition
                "
            >

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


        <!-- ==============================================================
             PAGINATION
        ============================================================== -->

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

let refreshTimer = null

let searchTimer = null


/*
|--------------------------------------------------------------------------
| First load
|--------------------------------------------------------------------------
|
| Birinchi /devices yuklanganda mavjud qurilmalarni
| yangi notification deb hisoblamaymiz.
|
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
| AUDIO
|--------------------------------------------------------------------------
|
| MUHIM:
|
| Faqat BITTA Audio obyekt ishlatiladi.
|
| Hodisa kelganda:
|
|     audio.play()
|
| Ovoz:
|
|     loop = true
|
| bo'lgani uchun notification yopilmaguncha davom etadi.
|
|--------------------------------------------------------------------------
*/

const notificationAudio =
    new Audio('/notification.mp3')


notificationAudio.loop = true

notificationAudio.preload = 'auto'

notificationAudio.volume = 1


/*
|--------------------------------------------------------------------------
| Audio unlock
|--------------------------------------------------------------------------
|
| Chrome birinchi user interactionsiz audio qo'yishga ruxsat bermasligi
| mumkin.
|
| Shuning uchun foydalanuvchi birinchi marta sahifani bosganda
| audio unlock qilamiz.
|
*/

let audioUnlocked = false


const unlockAudio = async () => {

    if (audioUnlocked) {

        return

    }


    try {

        notificationAudio.muted = true

        await notificationAudio.play()

        notificationAudio.pause()

        notificationAudio.currentTime = 0

        notificationAudio.muted = false

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
| Start notification sound
|--------------------------------------------------------------------------
|
| Notification mavjud bo'lsa ovoz boshlanadi.
|
| Agar ovoz allaqachon chalayotgan bo'lsa qaytadan boshlamaymiz.
|
*/

const startNotificationSound = async () => {

    if (
        !settings.value.notification_sound
    ) {

        return

    }


    /*
    | Audio hali Chrome tomonidan unlock qilinmagan.
    */

    if (!audioUnlocked) {

        console.warn(
            '🔒 Audio is not unlocked yet'
        )

        return

    }


    /*
    | Ovoz allaqachon chalayotgan bo'lsa
    | yana play qilmaymiz.
    */

    if (
        !notificationAudio.paused
    ) {

        return

    }


    try {

        notificationAudio.muted = false

        notificationAudio.currentTime = 0

        await notificationAudio.play()


        console.log(
            '🔊 Notification sound started'
        )

    } catch (error) {

        console.error(
            '❌ Notification sound error:',
            error
        )

    }

}


/*
|--------------------------------------------------------------------------
| Stop notification sound
|--------------------------------------------------------------------------
*/

const stopNotificationSound = () => {

    notificationAudio.pause()

    notificationAudio.currentTime = 0

}


/*
|--------------------------------------------------------------------------
| Load devices
|--------------------------------------------------------------------------
*/

const loadDevices = async (
    page = 1,
    detectChanges = false
) => {

    try {

        /*
        |--------------------------------------------------------------------------
        | Eski qurilmalar
        |--------------------------------------------------------------------------
        */

        const oldDevices =
            JSON.parse(
                JSON.stringify(
                    devices.value
                )
            )


        /*
        |--------------------------------------------------------------------------
        | API
        |--------------------------------------------------------------------------
        */

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


        const newDevices =
            response.data.data || []


        /*
        |--------------------------------------------------------------------------
        | CHANGE DETECTION
        |--------------------------------------------------------------------------
        |
        | Faqat AUTO REFRESH paytida ishlaydi.
        |
        | Birinchi yuklanishda ishlamaydi.
        |
        */

        if (
            detectChanges &&
            !firstLoad.value
        ) {

            checkChanges(
                oldDevices,
                newDevices
            )

        }


        /*
        |--------------------------------------------------------------------------
        | Table
        |--------------------------------------------------------------------------
        */

        devices.value =
            newDevices


        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

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


        /*
        |--------------------------------------------------------------------------
        | First load tugadi
        |--------------------------------------------------------------------------
        */

        firstLoad.value = false


        /*
        |--------------------------------------------------------------------------
        | Refresh time
        |--------------------------------------------------------------------------
        */

        lastRefresh.value =
            new Date().toLocaleTimeString()

    } catch (error) {

        console.error(
            'Devices load error:',
            error
        )

    }

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

        const oldDevice =
            oldDevices.find(
                item =>
                    item.id === device.id
            )


        /*
        |--------------------------------------------------------------------------
        | YANGI QURILMA
        |--------------------------------------------------------------------------
        */

        if (!oldDevice) {

            addNotification(
                device,
                'Yangi qurilma',
                'NEW_DEVICE'
            )

            return

        }


        /*
        |--------------------------------------------------------------------------
        | STATUS O'ZGARDI
        |--------------------------------------------------------------------------
        */

        if (
            oldDevice.status !==
            device.status
        ) {

            if (
                device.status === 'ONLINE'
            ) {

                addNotification(
                    device,
                    'Qurilma online',
                    'DEVICE_ONLINE'
                )

            } else {

                addNotification(
                    device,
                    'Qurilma offline',
                    'DEVICE_OFFLINE'
                )

            }

        }


        /*
        |--------------------------------------------------------------------------
        | IP O'ZGARDI
        |--------------------------------------------------------------------------
        */

        if (
            oldDevice.ip_address !==
            device.ip_address
        ) {

            addNotification(
                device,
                'IP o‘zgardi',
                'IP_CHANGED'
            )

        }


        /*
        |--------------------------------------------------------------------------
        | MAC O'ZGARDI
        |--------------------------------------------------------------------------
        */

        if (
            oldDevice.mac_address !==
            device.mac_address
        ) {

            addNotification(
                device,
                'MAC o‘zgardi',
                'MAC_CHANGED'
            )

        }

    })

}


/*
|--------------------------------------------------------------------------
| Add notification
|--------------------------------------------------------------------------
*/

const addNotification = (
    device,
    title,
    eventType
) => {

    /*
    |--------------------------------------------------------------------------
    | Notification yaratamiz
    |--------------------------------------------------------------------------
    */

    const notification = {

        id:
            ++notificationId,

        deviceId:
            device.id,

        title,

        eventType,

        message:
            `${device.name || 'Noma\'lum qurilma'} (${device.ip_address})`

    }


    /*
    |--------------------------------------------------------------------------
    | Notification list
    |--------------------------------------------------------------------------
    */

    notifications.value.push(
        notification
    )


    /*
    |--------------------------------------------------------------------------
    | Device highlight
    |--------------------------------------------------------------------------
    */

    changedDevices.value = {

        ...changedDevices.value,

        [device.id]: {

            id:
                device.id,

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
    | OVOZ
    |--------------------------------------------------------------------------
    |
    | Notification paydo bo'lishi bilan ovoz boshlanadi.
    |
    | Audio loop=true.
    |
    */

    startNotificationSound()

}


/*
|--------------------------------------------------------------------------
| Remove notification
|--------------------------------------------------------------------------
|
| FAQAT BOSILGAN notification o'chadi.
|
*/

const removeNotification = (
    id
) => {

    const notification =
        notifications.value.find(
            item =>
                item.id === id
        )


    if (!notification) {

        return

    }


    /*
    |--------------------------------------------------------------------------
    | Faqat bosilgan notificationni o'chiramiz
    |--------------------------------------------------------------------------
    */

    notifications.value =
        notifications.value.filter(
            item =>
                item.id !== id
        )


    /*
    |--------------------------------------------------------------------------
    | Shu qurilmada notification qolganmi?
    |--------------------------------------------------------------------------
    */

    const deviceStillHasNotification =
        notifications.value.some(
            item =>
                item.deviceId ===
                notification.deviceId
        )


    /*
    |--------------------------------------------------------------------------
    | Agar shu device uchun notification qolmagan bo'lsa
    | sariq belgini o'chiramiz.
    |--------------------------------------------------------------------------
    */

    if (
        !deviceStillHasNotification
    ) {

        const updated = {
            ...changedDevices.value
        }


        delete updated[
            notification.deviceId
        ]


        changedDevices.value =
            updated

    }


    /*
    |--------------------------------------------------------------------------
    | ENG MUHIM QISM
    |--------------------------------------------------------------------------
    |
    | Boshqa notificationlar bo'lsa ovoz davom etadi.
    |
    | Hech qanday notification qolmasa ovoz to'xtaydi.
    |
    */

    if (
        notifications.value.length === 0
    ) {

        stopNotificationSound()

    }

}


/*
|--------------------------------------------------------------------------
| Open device
|--------------------------------------------------------------------------
|
| Device ustiga bosilganda:
|
| - shu device notificationlari o'chadi
| - boshqa device notificationlari QOLADI
| - boshqa notification bo'lsa ovoz davom etadi
| - notification umuman qolmasa ovoz to'xtaydi
|
|--------------------------------------------------------------------------
*/

const goDevice = (
    id
) => {

    /*
    |--------------------------------------------------------------------------
    | Faqat shu device notificationlarini o'chiramiz
    |--------------------------------------------------------------------------
    */

    notifications.value =
        notifications.value.filter(
            notification =>
                notification.deviceId !== id
        )


    /*
    |--------------------------------------------------------------------------
    | Faqat shu device highlightini o'chiramiz
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
    | Notification qolmagan bo'lsa ovozni to'xtatamiz
    |--------------------------------------------------------------------------
    */

    if (
        notifications.value.length === 0
    ) {

        stopNotificationSound()

    }


    /*
    |--------------------------------------------------------------------------
    | Device detail
    |--------------------------------------------------------------------------
    */

    router.push(
        '/devices/' + id
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
        page > pagination.value.last_page
    ) {

        return

    }


    /*
    | Pagination notification yaratmaydi.
    */

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

                /*
                | Search notification yaratmaydi.
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

    /*
    |--------------------------------------------------------------------------
    | Eski timer
    |--------------------------------------------------------------------------
    */

    if (refreshTimer) {

        clearInterval(
            refreshTimer
        )

        refreshTimer = null

    }


    /*
    |--------------------------------------------------------------------------
    | Auto refresh OFF
    |--------------------------------------------------------------------------
    */

    if (
        !settings.value.auto_refresh
    ) {

        return

    }


    /*
    |--------------------------------------------------------------------------
    | Interval
    |--------------------------------------------------------------------------
    */

    const seconds =
        Math.max(
            Number(
                settings.value.scan_interval || 60
            ),
            1
        )


    refreshTimer =
        setInterval(() => {

            loadDevices(
                pagination.value.current_page || 1,
                true
            )

        }, seconds * 1000)

}


/*
|--------------------------------------------------------------------------
| Settings updated
|--------------------------------------------------------------------------
*/

const handleSettingsUpdated =
    async () => {

        loadFromStorage()

        await loadSettings()

        /*
        | Agar notification sound o'chirilgan bo'lsa
        | hozirgi ovozni ham to'xtatamiz.
        */

        if (
            !settings.value.notification_sound
        ) {

            stopNotificationSound()

        }


        startAutoRefresh()

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
        |
        | Birinchi user interactionda Chrome audio'ga ruxsat beradi.
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
        | Settings listener
        |--------------------------------------------------------------------------
        */

        window.addEventListener(
            'app-settings-updated',
            handleSettingsUpdated
        )


        /*
        |--------------------------------------------------------------------------
        | Birinchi yuklanish
        |--------------------------------------------------------------------------
        |
        | Mavjud qurilmalar notification qilinmaydi.
        |--------------------------------------------------------------------------
        */

        firstLoad.value = true


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

    }
)


/*
|--------------------------------------------------------------------------
| Unmounted
|--------------------------------------------------------------------------
*/

onUnmounted(
    () => {

        /*
        |--------------------------------------------------------------------------
        | Refresh timer
        |--------------------------------------------------------------------------
        */

        if (refreshTimer) {

            clearInterval(
                refreshTimer
            )

            refreshTimer = null

        }


        /*
        |--------------------------------------------------------------------------
        | Search timer
        |--------------------------------------------------------------------------
        */

        clearTimeout(
            searchTimer
        )


        /*
        |--------------------------------------------------------------------------
        | Audio
        |--------------------------------------------------------------------------
        */

        stopNotificationSound()


        /*
        |--------------------------------------------------------------------------
        | Audio listener
        |--------------------------------------------------------------------------
        */

        document.removeEventListener(
            'pointerdown',
            unlockAudio
        )


        /*
        |--------------------------------------------------------------------------
        | Settings listener
        |--------------------------------------------------------------------------
        */

        window.removeEventListener(
            'app-settings-updated',
            handleSettingsUpdated
        )

    }
)

</script>