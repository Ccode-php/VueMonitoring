<template>

    <!-- LOGIN PAGE -->

    <RouterView v-if="route.path === '/login'" />


    <!-- MAIN APPLICATION -->

    <div
        v-else
        class="min-h-screen bg-slate-100"
    >

        <!-- SIDEBAR -->

        <aside
            class="fixed
                   left-0
                   top-0
                   bottom-0
                   w-64
                   bg-slate-900
                   text-white
                   flex
                   flex-col
                   shadow-xl
                   z-50"
        >

            <!-- LOGO -->

            <div
                class="p-6
                       border-b
                       border-slate-800"
            >

                <h1 class="text-2xl font-bold">

                    Monitoring

                </h1>

            </div>


            <!-- MENU -->

            <nav
                class="flex-1
                       p-4
                       space-y-2"
            >

                <RouterLink
                    to="/"
                    class="menu"
                    active-class="menu-active"
                >
                    📊 Dashboard
                </RouterLink>


                <RouterLink
                    to="/devices"
                    class="menu"
                    active-class="menu-active"
                >
                    💻 Qurilmalar
                </RouterLink>


                <RouterLink
                    to="/scan"
                    class="menu"
                    active-class="menu-active"
                >
                    🌐 Scan
                </RouterLink>


                <RouterLink
                    to="/topology"
                    class="menu"
                    active-class="menu-active"
                >
                    🔀 Topology
                </RouterLink>


                <RouterLink
                    to="/settings"
                    class="menu"
                    active-class="menu-active"
                >
                    ⚙️ Settings
                </RouterLink>

            </nav>

        </aside>


        <!-- RIGHT SIDE -->

        <div class="ml-64 min-h-screen flex flex-col">


            <!-- HEADER -->

            <header
                class="bg-white
                       h-16
                       shadow
                       flex
                       items-center
                       justify-between
                       px-8
                       sticky
                       top-0
                       z-40"
            >

                <h2
                    class="text-2xl
                           font-bold
                           text-slate-800"
                >

                    {{ pageTitle }}

                </h2>


                <div
                    class="flex
                           items-center
                           gap-5"
                >

                    <!-- CLOCK -->

                    <div
                        class="text-sm
                               text-slate-500"
                    >

                        {{ now }}

                    </div>


                    <!-- USER -->

                    <div
                        v-if="user"
                        class="flex
                               items-center
                               gap-3
                               border-l
                               pl-5"
                    >

                        <div
                            class="w-9
                                   h-9
                                   rounded-full
                                   bg-blue-600
                                   text-white
                                   flex
                                   items-center
                                   justify-center
                                   font-bold"
                        >

                            {{ user.name?.charAt(0).toUpperCase() }}

                        </div>


                        <div class="hidden md:block">

                            <div
                                class="font-semibold
                                       text-slate-800"
                            >

                                {{ user.name }}

                            </div>

                            <div
                                class="text-xs
                                       text-slate-500"
                            >

                                {{ user.email }}

                            </div>

                        </div>


                        <button
                            @click="logout"
                            class="ml-2
                                   px-3
                                   py-2
                                   text-sm
                                   rounded-lg
                                   text-red-600
                                   hover:bg-red-50"
                        >

                            Logout

                        </button>

                    </div>

                </div>

            </header>


            <!-- PAGE -->

            <main
                class="flex-1
                       p-8"
            >

                <RouterView />

            </main>

        </div>

    </div>

</template>


<script setup>

import {
    computed,
    ref,
    onMounted,
    onUnmounted
} from 'vue'

import {
    useRoute,
    useRouter
} from 'vue-router'

import api from './api/axios'


const route = useRoute()

const router = useRouter()


// ========================================
// USER
// ========================================

const user = ref(null)


const loadUser = () => {

    const savedUser =
        localStorage.getItem('user')

    if (savedUser) {

        try {

            user.value =
                JSON.parse(savedUser)

        } catch {

            user.value = null

        }

    }

}


// ========================================
// LOGOUT
// ========================================

const logout = async () => {

    try {

        await api.post('/logout')

    } catch (error) {

        console.error(
            'Logout error:',
            error
        )

    } finally {

        localStorage.removeItem('token')

        localStorage.removeItem('user')

        user.value = null

        router.push('/login')

    }

}


// ========================================
// PAGE TITLE
// ========================================

const pageTitle = computed(() => {

    switch (route.path) {

        case '/':

            return 'Dashboard'

        case '/devices':

            return 'Qurilmalar'

        case '/scan':

            return 'Tarmoqlarni scanner qilish'

        case '/topology':

            return 'Topology'

        case '/settings':

            return 'Settings'

        default:

            return 'GoMonitoring'

    }

})


// ========================================
// CLOCK
// ========================================

const now = ref('')

let timer = null


const updateClock = () => {

    now.value =
        new Date().toLocaleString()

}


onMounted(() => {

    loadUser()

    updateClock()

    timer = setInterval(
        updateClock,
        1000
    )

})


onUnmounted(() => {

    clearInterval(timer)

})

</script>


<style scoped>

.menu {

    display: block;

    padding: 12px 15px;

    border-radius: 10px;

    transition: .2s;

}

.menu:hover {

    background: rgb(51 65 85);

}

.menu-active {

    background: rgb(59 130 246);

    color: white;

}

</style>