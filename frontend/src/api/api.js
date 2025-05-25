import axios from 'axios'
import { notify } from '../utils/notificationService'

const api = axios.create({
  baseURL: __BACKEND_URL__,
  withCredentials: true,                  // include cookies / credentials
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // console.log(
  //   '→ API Request:',
  //   config.method.toUpperCase(),
  //   config.url,
  //   config.headers.Authorization
  // )
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    const msg = error.response?.data?.message || error.response?.data?.msg || error.message
    notify(msg)
    return Promise.reject(error)
  }
)

export default api
