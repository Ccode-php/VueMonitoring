<template>

    <!-- LOGIN PAGE -->

    <RouterView v-if="route.path === '/login'" />


    <!-- MAIN APPLICATION -->

    <div v-else class="min-h-screen bg-slate-100">

        <!-- SIDEBAR -->

        <aside class="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col shadow-xl z-50">

            <div class="p-6 border-b border-slate-800">
                <h1 class="text-2xl font-bold">Monitoring</h1>
            </div>

            <nav class="flex-1 p-4 space-y-2">

                <RouterLink to="/" class="menu" active-class="menu-active">📊 Dashboard</RouterLink>

                <RouterLink to="/devices" class="menu" active-class="menu-active">💻 Qurilmalar</RouterLink>

                <RouterLink to="/scan" class="menu" active-class="menu-active">🌐 Scan</RouterLink>

                <RouterLink to="/topology" class="menu" active-class="menu-active">🔀 Topology</RouterLink>

                <RouterLink to="/settings" class="menu" active-class="menu-active">⚙️ Settings</RouterLink>

            </nav>

        </aside>


        <!-- RIGHT SIDE -->

        <div class="ml-64 min-h-screen flex flex-col min-w-0">

            <header class="bg-white h-16 shadow flex items-center justify-between px-8 sticky top-0 z-40">

                <h2 class="text-2xl font-bold text-slate-800">
                    {{ route.meta.title || 'GoMonitoring' }}
                </h2>

                <div class="flex items-center gap-5">

                    <div class="text-sm text-slate-500">{{ now }}</div>

                    <div v-if="user" class="flex items-center gap-3 border-l pl-5">

                        <div class="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            {{ user.name?.charAt(0).toUpperCase() }}
                        </div>

                        <div class="hidden md:block">
                            <div class="font-semibold text-slate-800">{{ user.name }}</div>
                            <div class="text-xs text-slate-500">{{ user.email }}</div>
                        </div>

                        <button
                            @click="logout"
                            class="ml-2 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50"
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </header>

            <main class="flex-1 min-w-0 w-full p-8">
                <RouterView />
            </main>

        </div>

        <!-- Bildirishnomalar har qaysi sahifada ko'rinadi -->
        <NotificationStack />

    </div>

</template>


<script setup>

import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import api from './api/axios'
import { useEventsStore } from './stores/events'
import NotificationStack from './components/common/NotificationStack.vue'

const route = useRoute()
const router = useRouter()
const events = useEventsStore()


// ========================================
// USER (login'dan keyin ham yangilanadi)
// ========================================

const user = ref(null)

const loadUser = () => {
    try {
        const saved = localStorage.getItem('user')

        user.value = saved ? JSON.parse(saved) : null
    } catch {
        user.value = null
    }
}

// Sahifa almashganda (login -> dashboard ham) user va hodisalar yangilanadi.
// Oldin loadUser faqat onMounted'da bir marta chaqirilgani uchun login'dan keyin user ko'rinmasdi.
watch(
    () => route.path,
    (path) => {
        if (path === '/login') {
            user.value = null
            events.stop()

            return
        }

        loadUser()

        if (localStorage.getItem('token')) {
            events.start()
        }
    },
    { immediate: true }
)


// ========================================
// LOGOUT
// ========================================

const logout = async () => {
    try {
        await api.post('/logout')
    } catch (error) {
        console.error('Logout error:', error)
    } finally {
        events.stop()

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        user.value = null

        router.push('/login')
    }
}


// ========================================
// CLOCK
// ========================================

const now = ref(new Date().toLocaleString())

let clock = null

onMounted(() => {
    clock = setInterval(() => {
        now.value = new Date().toLocaleString()
    }, 1000)
})

onUnmounted(() => clearInterval(clock))

</script>
