import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
})

// Attach admin/user token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bookriver-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong'
    error.userMessage = message
    return Promise.reject(error)
  },
)

export default api
