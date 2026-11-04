import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bookriver-admin-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong'
    error.userMessage = message
    if (error.response?.status === 401) {
      localStorage.removeItem('bookriver-admin-token')
    }
    return Promise.reject(error)
  },
)

export default api
