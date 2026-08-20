<template>

    <div class="min-h-screen w-full flex items-center justify-center bg-slate-100 p-6">

        <div class="bg-white
                   w-full
                   max-w-md
                   rounded-2xl
                   shadow-xl
                   p-8">

            <h1 class="text-3xl
                       font-bold
                       text-center
                       text-slate-800
                       mb-2">
                GoMonitoring
            </h1>

            <p class="text-center
                       text-slate-500
                       mb-8">
                Network Monitoring System
            </p>


            <!-- Error -->

            <div v-if="errorMessage" class="mb-5
                       bg-red-50
                       border
                       border-red-200
                       text-red-600
                       px-4
                       py-3
                       rounded-lg">

                {{ errorMessage }}

            </div>


            <form @submit.prevent="login">

                <!-- Email -->

                <div class="mb-5">

                    <label class="block
                               font-medium
                               text-slate-700
                               mb-2">
                        Email
                    </label>

                    <input v-model="form.email" type="email" autocomplete="email" placeholder="admin@com" class="w-full
                               border
                               border-slate-300
                               rounded-lg
                               px-4
                               py-3
                               outline-none
                               focus:ring-2
                               focus:ring-blue-500">

                </div>


                <!-- Password -->

                <div class="mb-6">

                    <label class="block
                               font-medium
                               text-slate-700
                               mb-2">
                        Password
                    </label>

                    <input v-model="form.password" type="password" autocomplete="current-password"
                        placeholder="••••••••" class="w-full
                               border
                               border-slate-300
                               rounded-lg
                               px-4
                               py-3
                               outline-none
                               focus:ring-2
                               focus:ring-blue-500">

                </div>


                <!-- Button -->

                <button type="submit" :disabled="loading" class="w-full
                           bg-blue-600
                           hover:bg-blue-700
                           disabled:bg-blue-400
                           text-white
                           font-semibold
                           py-3
                           rounded-lg
                           transition">

                    {{ loading ? 'Kirilmoqda...' : 'Login' }}

                </button>

            </form>

        </div>

    </div>

</template>


<script setup>

import { ref } from 'vue'

import { useRouter } from 'vue-router'

import api from '../api/axios'


const router = useRouter()


const form = ref({

    email: '',

    password: ''

})


const loading = ref(false)

const errorMessage = ref('')


const login = async () => {

    errorMessage.value = ''

    loading.value = true

    try {

        console.log(
            'LOGIN DATA:',
            form.value
        )

        const res = await api.post(
            '/login',
            {
                email: form.value.email,
                password: form.value.password
            }
        )


        console.log(
            'LOGIN RESPONSE:',
            res.data
        )


        localStorage.setItem(
            'token',
            res.data.token
        )


        localStorage.setItem(
            'user',
            JSON.stringify(res.data.user)
        )


        router.push('/')

    } catch (error) {

        console.error(
            'LOGIN ERROR:',
            error
        )


        errorMessage.value =
            error.response?.data?.message ||
            'Email yoki parol noto‘g‘ri.'

    } finally {

        loading.value = false

    }

}

</script>