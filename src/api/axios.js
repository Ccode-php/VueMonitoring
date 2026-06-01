import axios from 'axios'

const api = axios.create({
    baseURL: 'http://Laravel13Monitoring:8000/api',
})

export default api