import axios from 'axios'
import { AUTH_STORAGE_KEY } from '../constants/storage'
import { ROUTE_LOGIN } from '../constants/routes'

export const api = axios.create({
  baseURL: window.__API_BASE_URL__ ?? import.meta.env.VITE_API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (raw) {
    const { token } = JSON.parse(raw) as { token?: string }
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      if (window.location.pathname !== ROUTE_LOGIN) {
        window.location.href = ROUTE_LOGIN
      }
    }
    return Promise.reject(error)
  },
)
