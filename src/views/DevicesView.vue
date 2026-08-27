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


        <!-- DEVICES TABLE -->

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

                @click.stop="removeNotification(item.id)"

                class="bg-white rounded-xl shadow-2xl border-l-4 border-blue-500 p-4 cursor-pointer hover:bg-blue-50 transition"
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

let refreshTimer = null

let searchTimer = null


/*
|--------------------------------------------------------------------------
| First load
|--------------------------------------------------------------------------
|
| Bu juda muhim.
|
| Birinchi /devices yuklanishida mavjud qurilmalarni
| notification sifatida hisoblamaymiz.
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
| Chrome bilan muammo bo'lmasligi uchun bitta Audio obyektni
| qayta-qayta ishlatmaymiz.
|
| Har bir notification uchun yangi Audio yaratiladi.
|
*/

let audioUnlocked = false


/*
|--------------------------------------------------------------------------
| Unlock audio
|--------------------------------------------------------------------------
*/

const unlockAudio = async () => {

    if (audioUnlocked) {

        return

    }


    try {

        const testAudio =
            new Audio('/notification.mp3')


        testAudio.muted = true

        testAudio.volume = 0

        await testAudio.play()

        testAudio.pause()

        testAudio.currentTime = 0

        testAudio.removeAttribute('src')

        testAudio.load()


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
| Play notification sound
|--------------------------------------------------------------------------
*/

const playNotificationSound = () => {

    if (
        !settings.value.notification_sound
    ) {

        return

    }


    if (!audioUnlocked) {

        console.warn(
            '🔒 Audio is not unlocked yet'
        )

        return

    }


    try {

        /*
        | Har bir hodisa uchun yangi Audio.
        */

        const sound =
            new Audio('/notification.mp3')


        sound.volume = 1

        sound.currentTime = 0


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

    } catch (error) {

        console.error(
            '❌ Audio creation error:',
            error
        )

    }

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
        | Old devices.
        */

        const oldDevices =
            JSON.parse(
                JSON.stringify(
                    devices.value
                )
            )


        /*
        | API.
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


        /*
        | New devices.
        */

        const newDevices =
            response.data.data || []


        /*
        | Birinchi yuklanishda notification YO'Q.
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
        | Table update.
        */

        devices.value =
            newDevices


        /*
        | Pagination.
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
        | First load tugadi.
        */

        firstLoad.value = false


        /*
        | Refresh time.
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

    /*
    | Faqat mavjud eski device bilan solishtiramiz.
    */

    newDevices.forEach(device => {

        const oldDevice =
            oldDevices.find(
                item =>
                    item.id === device.id
            )


        /*
        |--------------------------------------------------------------------------
        | Yangi qurilma
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
        | Status o'zgardi
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
        | IP o'zgardi
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
        | MAC o'zgardi
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
    | Notification.
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
    |
    | Bir device uchun bir nechta notification bo'lishi mumkin.
    |
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
    | Sound
    |--------------------------------------------------------------------------
    */

    playNotificationSound()

}


/*
|--------------------------------------------------------------------------
| Remove notification
|--------------------------------------------------------------------------
|
| Faqat BOSILGAN notification o'chadi.
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
    | Faqat shu notification.
    |--------------------------------------------------------------------------
    */

    notifications.value =
        notifications.value.filter(
            item =>
                item.id !== id
        )


    /*
    |--------------------------------------------------------------------------
    | Shu device uchun boshqa notification bormi?
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
    | Agar qolmagan bo'lsa table highlightni o'chiramiz.
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
    | Muhim:
    |
    | Qurilmaga kirganda FAQAT shu qurilmaning
    | notificationlarini o'chiramiz.
    */

    notifications.value =
        notifications.value.filter(
            notification =>
                notification.deviceId !== id
        )


    /*
    | Table highlight ham faqat shu device uchun.
    */

    const updated = {
        ...changedDevices.value
    }


    delete updated[id]


    changedDevices.value =
        updated


    /*
    | Device detail.
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
    | Eski timer.
    */

    if (refreshTimer) {

        clearInterval(
            refreshTimer
        )

        refreshTimer = null

    }


    /*
    | Auto refresh OFF.
    */

    if (
        !settings.value.auto_refresh
    ) {

        return

    }


    /*
    | Interval.
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
        | Chrome audio permission
        |--------------------------------------------------------------------------
        |
        | Birinchi foydalanuvchi interactionida audio unlock qilinadi.
        |
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
        | First load
        |--------------------------------------------------------------------------
        |
        | Bu yuklanish notification chiqarmaydi.
        |
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
        | Timer.
        */

        if (refreshTimer) {

            clearInterval(
                refreshTimer
            )

            refreshTimer = null

        }


        /*
        | Search timer.
        */

        clearTimeout(
            searchTimer
        )


        /*
        | Audio listener.
        */

        document.removeEventListener(
            'pointerdown',
            unlockAudio
        )


        /*
        | Settings listener.
        */

        window.removeEventListener(
            'app-settings-updated',
            handleSettingsUpdated
        )

    }
)

</script>