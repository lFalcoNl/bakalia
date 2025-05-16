import axios from 'axios'
import { notify } from '../utils/notificationService'

const api = axios.create({
  // baseURL: 'http://localhost:5000/api'
  baseURL: 'https://bakalia-production.up.railway.app/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('→ API Request:', config.method.toUpperCase(), config.url, config.headers.Authorization)
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    const msg = error.response?.data?.msg || error.message
    notify(msg)
    return Promise.reject(error)
  }
)

export default api
