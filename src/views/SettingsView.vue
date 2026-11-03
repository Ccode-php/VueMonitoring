<template>

    <div>

        <h1 class="text-3xl font-bold mb-8">Settings</h1>

        <div class="grid lg:grid-cols-2 gap-6">

            <SettingsCard title="General">

                <div class="space-y-5">

                    <div>
                        <label class="font-medium">Scan interval (sec) — scanner qancha vaqtda tarmoqni tekshiradi</label>
                        <input type="number" min="5" v-model.number="form.scan_interval" class="border rounded-lg w-full mt-2 p-2">
                    </div>

                    <div>
                        <label class="font-medium">Sahifa yangilanish intervali (sec)</label>
                        <input type="number" min="2" v-model.number="form.ui_refresh_interval" class="border rounded-lg w-full mt-2 p-2">
                    </div>

                    <div>
                        <label class="font-medium">Offline timeout (sec) — scan intervalidan kamida 2 baravar katta</label>
                        <input type="number" min="10" v-model.number="form.offline_timeout" class="border rounded-lg w-full mt-2 p-2">
                    </div>

                    <div class="flex justify-between">
                        Notification sound
                        <ToggleSwitch v-model="form.notification_sound" />
                    </div>

                    <div class="flex justify-between">
                        Auto refresh
                        <ToggleSwitch v-model="form.auto_refresh" />
                    </div>

                </div>

            </SettingsCard>

            <SettingsCard title="SNMP">

                <div class="space-y-5">

                    <div>
                        <label>Community</label>
                        <input v-model="form.snmp_community" class="border rounded-lg w-full mt-2 p-2">
                    </div>

                    <div>
                        <label>Version</label>
                        <select v-model="form.snmp_version" class="border rounded-lg w-full mt-2 p-2">
                            <option>v1</option>
                            <option>v2c</option>
                        </select>
                    </div>

                    <div>
                        <label>Timeout (sec)</label>
                        <input type="number" min="1" v-model.number="form.snmp_timeout" class="border rounded-lg w-full mt-2 p-2">
                    </div>

                    <div>
                        <label>Retries</label>
                        <input type="number" min="0" v-model.number="form.snmp_retries" class="border rounded-lg w-full mt-2 p-2">
                    </div>

                </div>

            </SettingsCard>

        </div>

        <div v-if="error" class="mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {{ error }}
        </div>

        <div class="mt-8 flex items-center gap-4">

            <button
                class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl transition"
                :disabled="saving"
                @click="save"
            >
                {{ saving ? 'Saving...' : 'Save Settings' }}
            </button>

            <span v-if="success" class="text-green-600 font-medium">✓ Settings saved</span>

        </div>

    </div>

</template>

<script setup>

import { ref, onMounted } from 'vue'

import api from '../api/axios'
import { useSettings } from '../composables/useSettings'

import SettingsCard from '../components/settings/SettingsCard.vue'
import ToggleSwitch from '../components/settings/ToggleSwitch.vue'

const { settings, loadSettings } = useSettings()

const form = ref({ ...settings.value })

const saving = ref(false)
const success = ref(false)
const error = ref('')

onMounted(async () => {
    // Normalizatsiya useSettings ichida (oldin bu yerda nusxa kod bor edi)
    form.value = { ...(await loadSettings()) }
})

const save = async () => {
    saving.value = true
    success.value = false
    error.value = ''

    try {
        await api.post('/settings', form.value)

        // Umumiy sozlamalarni yangilab, boshqa sahifalarga xabar beramiz
        await loadSettings()

        window.dispatchEvent(new Event('app-settings-updated'))

        success.value = true

        setTimeout(() => { success.value = false }, 3000)
    } catch (err) {
        console.error('Settings save error:', err)

        const errors = err.response?.data?.errors

        error.value = errors
            ? Object.values(errors).flat().join(' ')
            : (err.response?.data?.message || 'Saqlashda xatolik')
    } finally {
        saving.value = false
    }
}

</script>
