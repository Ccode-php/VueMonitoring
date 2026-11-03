import { onMounted, onUnmounted, watch } from 'vue'
import { useSettings } from './useSettings'
import { useEventsStore } from '../stores/events'

/**
 * Sahifa ma'lumotini davriy yangilaydi (Dashboard, Devices, DeviceDetail, Topology
 * sahifalarida 4 marta takrorlanayotgan kod o'rniga).
 *
 *  - sahifa ochilganda bir marta chaqiradi
 *  - settings'dagi `ui_refresh_interval` bo'yicha takrorlaydi (auto_refresh o'chiq bo'lsa takrorlamaydi)
 *  - yangi hodisa kelganda (events.version) darhal chaqiradi
 */
export function useAutoRefresh(load, { onEvents = true } = {}) {
    const { settings, loadSettings, loadFromStorage } = useSettings()
    const events = useEventsStore()

    let timer = null

    const stop = () => {
        clearInterval(timer)
        timer = null
    }

    const start = () => {
        stop()

        if (!settings.value.auto_refresh) return

        const seconds = Math.max(Number(settings.value.ui_refresh_interval) || 10, 2)

        timer = setInterval(() => load(), seconds * 1000)
    }

    const onSettingsUpdated = async () => {
        await loadSettings()
        start()
    }

    onMounted(async () => {
        loadFromStorage()
        await loadSettings()
        await load()

        start()

        window.addEventListener('app-settings-updated', onSettingsUpdated)
    })

    onUnmounted(() => {
        stop()

        window.removeEventListener('app-settings-updated', onSettingsUpdated)
    })

    if (onEvents) {
        watch(() => events.version, () => load())
    }

    return { settings }
}
