import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'
import { useSettings } from '../composables/useSettings'
import { eventName } from '../utils/events'

/*
 * Hodisalar (yangi qurilma, offline, IP/MAC o'zgarishi) markazi.
 *
 *  - Laravel'dagi device_logs jadvalidan GET /events orqali yangi yozuvlarni oladi
 *  - Bildirishnoma va ovoz HAR QAYSI sahifada ishlaydi (oldin faqat Qurilmalar sahifasida edi)
 *  - Qurilmalar ro'yxatini solishtirmaydi, shuning uchun "soxta yangi qurilma" chiqmaydi
 */
export const useEventsStore = defineStore('events', () => {
    const { settings } = useSettings()

    const notifications = ref([])
    const changedDevices = ref({})

    // Har yangi hodisada oshadi; sahifalar shuni kuzatib ma'lumotini yangilaydi
    const version = ref(0)

    let lastId = null
    let timer = null
    let notificationId = 0
    let audio = null
    let audioUnlocked = false

    // ------------------------------------------------------------------ audio

    const getAudio = () => {
        if (!audio) {
            audio = new Audio('/notification.mp3')
            audio.loop = true
            audio.preload = 'auto'
        }

        return audio
    }

    // Chrome birinchi bosishgacha ovozga ruxsat bermaydi
    const unlockAudio = async () => {
        if (audioUnlocked) return

        try {
            const a = getAudio()

            a.muted = true
            await a.play()
            a.pause()
            a.currentTime = 0
            a.muted = false

            audioUnlocked = true
        } catch (error) {
            console.warn('Audio unlock failed:', error)
        }
    }

    const startSound = async () => {
        if (!settings.value.notification_sound || !audioUnlocked) return

        const a = getAudio()

        if (!a.paused) return

        try {
            a.currentTime = 0
            await a.play()
        } catch (error) {
            console.error('Notification sound error:', error)
        }
    }

    const stopSound = () => {
        if (!audio) return

        audio.pause()
        audio.currentTime = 0
    }

    // ---------------------------------------------------------- notifications

    const push = (event) => {
        const device = event.device

        if (!device) return

        const title = eventName(event.event_type)

        notifications.value.push({
            id: ++notificationId,
            deviceId: device.id,
            eventType: event.event_type,
            title,
            message: `${device.name || 'Noma\'lum qurilma'} (${device.ip_address})`,
        })

        // Xotira to'lib ketmasligi uchun oxirgi 50 ta
        if (notifications.value.length > 50) notifications.value.shift()

        changedDevices.value = {
            ...changedDevices.value,
            [device.id]: { id: device.id, title, eventType: event.event_type },
        }

        startSound()
    }

    const dismiss = (id) => {
        const item = notifications.value.find((n) => n.id === id)

        if (!item) return

        notifications.value = notifications.value.filter((n) => n.id !== id)

        // Shu qurilma uchun boshqa bildirishnoma qolmagan bo'lsa sariq belgi o'chadi
        if (!notifications.value.some((n) => n.deviceId === item.deviceId)) {
            const updated = { ...changedDevices.value }
            delete updated[item.deviceId]
            changedDevices.value = updated
        }

        if (notifications.value.length === 0) stopSound()
    }

    const dismissDevice = (deviceId) => {
        notifications.value = notifications.value.filter((n) => n.deviceId !== deviceId)

        const updated = { ...changedDevices.value }
        delete updated[deviceId]
        changedDevices.value = updated

        if (notifications.value.length === 0) stopSound()
    }

    // ---------------------------------------------------------------- polling

    const poll = async () => {
        try {
            const { data } = await api.get('/events', {
                params: lastId === null ? {} : { after_id: lastId },
            })

            const firstCall = lastId === null

            lastId = data.last_id

            // Birinchi chaqiruvda eski hodisalar bildirishnoma qilinmaydi
            if (firstCall || !data.events.length) return

            data.events.forEach(push)

            version.value++
        } catch (error) {
            console.error('Events poll error:', error)
        }
    }

    const intervalMs = () =>
        Math.max(Number(settings.value.ui_refresh_interval) || 10, 2) * 1000

    const restart = () => {
        clearInterval(timer)
        timer = setInterval(poll, intervalMs())
    }

    const start = () => {
        if (timer) return

        document.addEventListener('pointerdown', unlockAudio, { once: true })
        window.addEventListener('app-settings-updated', onSettingsUpdated)

        poll()
        restart()
    }

    const onSettingsUpdated = () => {
        if (!settings.value.notification_sound) stopSound()

        restart()
    }

    // Logout paytida
    const stop = () => {
        clearInterval(timer)
        timer = null

        document.removeEventListener('pointerdown', unlockAudio)
        window.removeEventListener('app-settings-updated', onSettingsUpdated)

        stopSound()

        lastId = null
        notifications.value = []
        changedDevices.value = {}
    }

    return {
        notifications,
        changedDevices,
        version,
        start,
        stop,
        dismiss,
        dismissDevice,
    }
})
