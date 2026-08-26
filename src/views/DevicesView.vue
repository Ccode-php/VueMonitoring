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

/*
|--------------------------------------------------------------------------
| Notification Audio
|--------------------------------------------------------------------------
*/

const audio = new Audio('/notification.mp3')

audio.preload = 'auto'
audio.volume = 1

let audioUnlocked = false


/*
|--------------------------------------------------------------------------
| Chrome audio unlock
|--------------------------------------------------------------------------
*/

const unlockAudio = () => {

    if (audioUnlocked) {
        return
    }

    /*
    | Browser user interaction bo'lganini bilishi kerak.
    */

    audio.muted = true

    const promise = audio.play()

    if (promise !== undefined) {

        promise
            .then(() => {

                audio.pause()

                audio.currentTime = 0

                audio.muted = false

                audioUnlocked = true

                console.log(
                    '🔊 Notification audio unlocked'
                )

            })
            .catch(error => {

                console.warn(
                    'Audio unlock failed:',
                    error
                )

            })

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

        console.log(
            '🔇 Notification sound OFF'
        )

        return

    }


    /*
    | Agar Chrome hali audio'ni unlock qilmagan bo'lsa
    */

    if (!audioUnlocked) {

        console.warn(
            '🔒 Audio is not unlocked'
        )

        return

    }


    audio.pause()

    audio.currentTime = 0

    audio.muted = false

    audio.volume = 1


    const promise = audio.play()

    if (promise !== undefined) {

        promise
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

}


/*
|--------------------------------------------------------------------------
| Stop sound
|--------------------------------------------------------------------------
*/

const stopNotificationSound = () => {

    audio.pause()

    audio.currentTime = 0

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

    const notification = {

        id: ++notificationId,

        deviceId: device.id,

        title,

        eventType,

        message:
            `${device.name || 'Noma\'lum qurilma'} (${device.ip_address})`

    }


    /*
    |--------------------------------------------------------------------------
    | Notification ro'yxatiga qo'shamiz
    |--------------------------------------------------------------------------
    */

    notifications.value.push(
        notification
    )


    /*
    |--------------------------------------------------------------------------
    | Shu qurilmani tableda belgilaymiz
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

const removeNotification = (
    notificationId
) => {

    const item =
        notifications.value.find(
            notification =>
                notification.id === notificationId
        )

    if (!item) {

        return

    }


    /*
    |--------------------------------------------------------------------------
    | Faqat bosilgan notificationni o'chiramiz
    |--------------------------------------------------------------------------
    */

    notifications.value =
        notifications.value.filter(
            notification =>
                notification.id !== notificationId
        )


    /*
    |--------------------------------------------------------------------------
    | Agar shu qurilmaning boshqa notificationi qolmagan bo'lsa,
    | tabledagi sariq belgi ham o'chadi
    |--------------------------------------------------------------------------
    */

    const hasAnother =
        notifications.value.some(
            notification =>
                notification.deviceId ===
                item.deviceId
        )


    if (!hasAnother) {

        const updated = {
            ...changedDevices.value
        }

        delete updated[item.deviceId]

        changedDevices.value =
            updated

    }


    /*
    |--------------------------------------------------------------------------
    | Agar notification qolmagan bo'lsa ovozni to'xtatamiz
    |--------------------------------------------------------------------------
    */

    if (
        notifications.value.length === 0
    ) {

        stopNotificationSound()

    }

}

const goDevice = (
    id
) => {

    /*
    |--------------------------------------------------------------------------
    | Faqat shu qurilmaga tegishli notificationlarni o'chiramiz
    |--------------------------------------------------------------------------
    */

    notifications.value =
        notifications.value.filter(
            notification =>
                notification.deviceId !== id
        )


    /*
    |--------------------------------------------------------------------------
    | Tabledagi shu qurilmaning sariq belgisi o'chadi
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
    | Agar boshqa notification qolmagan bo'lsa,
    | ovozni to'xtatamiz
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

    loadFromStorage()

    await loadSettings()


    /*
    |--------------------------------------------------------------------------
    | Chrome audio permission
    |--------------------------------------------------------------------------
    */

    document.addEventListener(
        'pointerdown',
        unlockAudio
    )


    /*
    |--------------------------------------------------------------------------
    | Settings update
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

stopNotificationSound()


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