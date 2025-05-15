import axios from 'axios'
import { notify } from '../utils/notificationService'

const api = axios.create({ baseURL: 'http://localhost:5000/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) {
    cfg.headers.Authorization = `Bearer \${token}`
  }
  console.log('→ API Request:', cfg.method.toUpperCase(), cfg.url, cfg.headers.Authorization)
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.msg || err.message
    notify(msg)
    return Promise.reject(err)
  }
)

export default api
