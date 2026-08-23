import { ref } from 'vue'
import api from '../api/axios'

const settings = ref({
    scan_interval: 60,
    offline_timeout: 120,
    notification_sound: true,
    auto_refresh: true,
    snmp_community: 'public',
    snmp_version: 'v2c',
    snmp_timeout: 5,
    snmp_retries: 1
})

const normalizeBoolean = (value) => {

    return (
        value === true ||
        value === 'true' ||
        value === 1 ||
        value === '1'
    )

}

const loadSettings = async () => {

    try {

        const res = await api.get('/settings')

        const data = res.data

        settings.value = {

            scan_interval:
                Number(data.scan_interval ?? 60),

            offline_timeout:
                Number(data.offline_timeout ?? 120),

            notification_sound:
                normalizeBoolean(
                    data.notification_sound
                ),

            auto_refresh:
                normalizeBoolean(
                    data.auto_refresh
                ),

            snmp_community:
                data.snmp_community ?? 'public',

            snmp_version:
                data.snmp_version ?? 'v2c',

            snmp_timeout:
                Number(data.snmp_timeout ?? 5),

            snmp_retries:
                Number(data.snmp_retries ?? 1)

        }

        /*
        |--------------------------------------------------------------
        | Boshqa Vue sahifalariga ham yangi settingni yetkazamiz
        |--------------------------------------------------------------
        */

        localStorage.setItem(
            'settings',
            JSON.stringify(settings.value)
        )

        return settings.value

    } catch (error) {

        console.error(
            'Settings load error:',
            error
        )

        return settings.value

    }

}


const loadFromStorage = () => {

    const saved =
        localStorage.getItem('settings')

    if (!saved) {

        return settings.value

    }

    try {

        settings.value = {

            ...settings.value,

            ...JSON.parse(saved)

        }

    } catch (error) {

        console.error(
            'Settings storage error:',
            error
        )

    }

    return settings.value

}


export function useSettings() {

    return {

        settings,

        loadSettings,

        loadFromStorage

    }

}