import axios from 'axios'
import { clearSession } from './authService'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fit_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    // 401 from /delete is intentional (wrong password) — don't logout
    if (error.response?.status === 401 && !String(error.config?.url ?? '').includes('/delete')) {
      clearSession()
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api
