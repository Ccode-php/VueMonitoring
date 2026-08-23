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

        <Notification :show="notification.show" :title="notification.title" :message="notification.message"
            @click="stopNotification" />


        <!-- Pagination -->

        <Pagination :pagination="pagination" @change="changePage" />

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
    useSettings
} from '../composables/useSettings'

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

const notification = ref({

    show: false,

    title: '',

    message: ''

})

const changedDevices = ref(new Set())

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
                item =>
                    item.id === device.id
            )


        /*
        |----------------------------------------------------------
        | Yangi qurilma
        |----------------------------------------------------------
        */

        if (!previous) {

            notify(

                device,

                'Yangi qurilma',

                `${device.name || 'Noma\'lum'} (${device.ip_address})`

            )

            return
        }


        /*
        |----------------------------------------------------------
        | Status o'zgardi
        |----------------------------------------------------------
        */

        if (
            previous.status !==
            device.status
        ) {

            if (
                device.status === 'ONLINE'
            ) {

                notify(

                    device,

                    'Qurilma online',

                    `${device.name || 'Noma\'lum'} (${device.ip_address})`

                )

            } else {

                notify(

                    device,

                    'Qurilma offline',

                    `${device.name || 'Noma\'lum'} (${device.ip_address})`

                )

            }

        }


        /*
        |----------------------------------------------------------
        | IP o'zgardi
        |----------------------------------------------------------
        */

        if (
            previous.ip_address !==
            device.ip_address
        ) {

            notify(

                device,

                'IP o‘zgardi',

                `${device.name || 'Noma\'lum'}: ${previous.ip_address} → ${device.ip_address}`

            )

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
    device,
    title,
    message
) => {

    /*
    |--------------------------------------------------------------
    | Qurilmani o'zgargan qurilmalar ro'yxatiga qo'shamiz
    |--------------------------------------------------------------
    */

    changedDevices.value = new Set(
        changedDevices.value
    )

    changedDevices.value.add(
        device.id
    )


    /*
    |--------------------------------------------------------------
    | Notification
    |--------------------------------------------------------------
    */

    notification.value = {

        show: true,

        title,

        message

    }


    notificationDeviceId.value =
        device.id


    /*
    |--------------------------------------------------------------
    | Sound faqat setting true bo'lsa
    |--------------------------------------------------------------
    */

    if (
        settings.value.notification_sound
    ) {

        audio.currentTime = 0

        audio
            .play()
            .catch(() => {

                /*
                Browser autoplay bloklashi mumkin.
                Birinchi user interactiondan keyin ishlaydi.
                */

            })

    }

}

const stopNotificationSound = () => {

    audio.pause()

    audio.currentTime = 0

    audio.loop = false

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


/*
|--------------------------------------------------------------
| auto_refresh OFF
|--------------------------------------------------------------
*/

if (
    !settings.value.auto_refresh
) {

    return

}


/*
|--------------------------------------------------------------
| scan_interval sekundda
|--------------------------------------------------------------
*/

const interval =
    Math.max(
        Number(settings.value.scan_interval || 60),
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

await loadDevices(
    1,
    false
)

startAutoRefresh()

window.addEventListener(
    'app-settings-updated',
    handleSettingsUpdated
)

})


/*
|--------------------------------------------------------------------------
| Cleanup
|--------------------------------------------------------------------------
*/

onUnmounted(() => {

clearInterval(timer)

clearTimeout(searchTimer)

audio.pause()

audio.currentTime = 0

window.removeEventListener(
    'app-settings-updated',
    handleSettingsUpdated
)

})

</script>