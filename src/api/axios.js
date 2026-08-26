import axios from 'axios'
import router from '../router'

const api = axios.create({

    baseURL: 'http://127.0.0.1:8000/api',
    //baseURL: '/api',

    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },

})


// ========================================
// REQUEST INTERCEPTOR
// ========================================

api.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem('token')

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`

        }

        return config

    },

    (error) => {

        return Promise.reject(error)

    }

)


// ========================================
// RESPONSE INTERCEPTOR
// ========================================

api.interceptors.response.use(

    (response) => {

        return response

    },

    async (error) => {

        if (
            error.response &&
            error.response.status === 401
        ) {

            localStorage.removeItem('token')

            localStorage.removeItem('user')

            if (
                router.currentRoute.value.path !== '/login'
            ) {

                await router.push('/login')

            }

        }

        return Promise.reject(error)

    }

)


export default api