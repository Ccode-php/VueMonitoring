import { ref } from 'vue'
import api from '../api/axios'

const STORAGE_KEY = 'settings'

const defaults = () => ({
    scan_interval: 60,
    ui_refresh_interval: 10,
    offline_timeout: 120,
    notification_sound: true,
    auto_refresh: true,
    snmp_community: 'public',
    snmp_version: 'v2c',
    snmp_timeout: 5,
    snmp_retries: 1,
})

const settings = ref(defaults())

const toBool = (value) =>
    value === true || value === 'true' || value === 1 || value === '1'

// Serverdan kelgan (string) qiymatlarni to'g'ri turga o'tkazadi
export const normalizeSettings = (data = {}) => {
    const d = defaults()

    return {
        scan_interval: Number(data.scan_interval ?? d.scan_interval),
        ui_refresh_interval: Number(data.ui_refresh_interval ?? d.ui_refresh_interval),
        offline_timeout: Number(data.offline_timeout ?? d.offline_timeout),
        notification_sound: data.notification_sound === undefined ? d.notification_sound : toBool(data.notification_sound),
        auto_refresh: data.auto_refresh === undefined ? d.auto_refresh : toBool(data.auto_refresh),
        snmp_community: data.snmp_community ?? d.snmp_community,
        snmp_version: data.snmp_version ?? d.snmp_version,
        snmp_timeout: Number(data.snmp_timeout ?? d.snmp_timeout),
        snmp_retries: Number(data.snmp_retries ?? d.snmp_retries),
    }
}

const loadSettings = async () => {
    try {
        const res = await api.get('/settings')

        settings.value = normalizeSettings(res.data)

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
        } catch { /* localStorage yo'q bo'lishi mumkin */ }
    } catch (error) {
        console.error('Settings load error:', error)
    }

    return settings.value
}

const loadFromStorage = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)

        if (saved) {
            settings.value = { ...settings.value, ...JSON.parse(saved) }
        }
    } catch (error) {
        console.error('Settings storage error:', error)
    }

    return settings.value
}

export function useSettings() {
    return { settings, loadSettings, loadFromStorage }
}
