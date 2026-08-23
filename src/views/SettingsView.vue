<template>

    <div>

        <h1 class="text-3xl
    font-bold
    mb-8">

            Settings

        </h1>

        <div class="grid
    lg:grid-cols-2
    gap-6">

            <SettingsCard title="General">

                <div class="space-y-5">

                    <div>

                        <label class="font-medium">

                            Scan interval (sec)

                        </label>

                        <input type="number" v-model="form.scan_interval" class="border
                        rounded-lg
                        w-full
                        mt-2
                        p-2">

                    </div>

                    <div>

                        <label class="font-medium">

                            Offline timeout (sec)

                        </label>

                        <input type="number" v-model="form.offline_timeout" class="border
                        rounded-lg
                        w-full
                        mt-2
                        p-2">

                    </div>

                    <div class="flex
                justify-between">

                        Notification sound

                        <ToggleSwitch v-model="form.notification_sound" />

                    </div>

                    <div class="flex
                justify-between">

                        Auto refresh

                        <ToggleSwitch v-model="form.auto_refresh" />

                    </div>

                </div>

            </SettingsCard>

            <SettingsCard title="SNMP">

                <div class="space-y-5">

                    <div>

                        <label>

                            Community

                        </label>

                        <input v-model="form.snmp_community" class="border
                        rounded-lg
                        w-full
                        mt-2
                        p-2">

                    </div>

                    <div>

                        <label>

                            Version

                        </label>

                        <select v-model="form.snmp_version" class="border
                        rounded-lg
                        w-full
                        mt-2
                        p-2">

                            <option>

                                v1

                            </option>

                            <option>

                                v2c

                            </option>

                            <option>

                                v3

                            </option>

                        </select>

                    </div>

                    <div>

                        <label>

                            Timeout

                        </label>

                        <input type="number" v-model="form.snmp_timeout" class="border
                        rounded-lg
                        w-full
                        mt-2
                        p-2">

                    </div>

                    <div>

                        <label>

                            Retries

                        </label>

                        <input type="number" v-model="form.snmp_retries" class="border
                        rounded-lg
                        w-full
                        mt-2
                        p-2">

                    </div>

                </div>

            </SettingsCard>

        </div>

        <div class="mt-8 flex items-center gap-4">

            <button class="bg-blue-600
    hover:bg-blue-700
    disabled:bg-gray-400
    text-white
    px-6
    py-3
    rounded-xl
    transition" :disabled="saving" @click="save">

                {{ saving ? 'Saving...' : 'Save Settings' }}

            </button>

            <span v-if="success" class="text-green-600 font-medium">

                ✓ Settings saved

            </span>

        </div>

    </div>

</template>

<script setup>

import {
    ref,
    onMounted
} from 'vue'

import api from '../api/axios'

import SettingsCard
    from '../components/settings/SettingsCard.vue'

import ToggleSwitch
    from '../components/settings/ToggleSwitch.vue'


const form = ref({

    scan_interval: 60,

    offline_timeout: 120,

    notification_sound: true,

    auto_refresh: true,

    snmp_community: 'public',

    snmp_version: 'v2c',

    snmp_timeout: 5,

    snmp_retries: 1

})


const loading = ref(false)

const saving = ref(false)

const success = ref(false)

const load = async () => {

    loading.value = true

    try {

        const res =
            await api.get('/settings')

        const data = res.data

        form.value = {

            scan_interval:
                Number(data.scan_interval ?? 60),

            offline_timeout:
                Number(data.offline_timeout ?? 120),

            notification_sound:
                data.notification_sound === true ||
                data.notification_sound === 'true' ||
                data.notification_sound === 1 ||
                data.notification_sound === '1',

            auto_refresh:
                data.auto_refresh === true ||
                data.auto_refresh === 'true' ||
                data.auto_refresh === 1 ||
                data.auto_refresh === '1',

            snmp_community:
                data.snmp_community ?? 'public',

            snmp_version:
                data.snmp_version ?? 'v2c',

            snmp_timeout:
                Number(data.snmp_timeout ?? 5),

            snmp_retries:
                Number(data.snmp_retries ?? 1)

        }

    } catch (error) {

        console.error(
            'Settings load error:',
            error
        )

    } finally {

        loading.value = false

    }

}


const save = async () => {

saving.value = true

success.value = false

try {

    await api.post(
        '/settings',
        form.value
    )

    /*
    |----------------------------------------------------------
    | Vue sahifalariga yangi settingni yetkazamiz
    |----------------------------------------------------------
    */

    localStorage.setItem(
        'app_settings',
        JSON.stringify(form.value)
    )

    /*
    |----------------------------------------------------------
    | Boshqa tab/window bo‘lsa ham xabar beramiz
    |----------------------------------------------------------
    */

    window.dispatchEvent(
        new Event('app-settings-updated')
    )

    success.value = true

    setTimeout(() => {

        success.value = false

    }, 3000)

} catch (error) {

    console.error(
        'Settings save error:',
        error
    )

} finally {

    saving.value = false

}

}


onMounted(() => {

    load()

})

</script>