import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor - Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || '')
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.status} ${response.config.url}`, response.data)
    }
    return response
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      // Log error in development
      if (import.meta.env.DEV) {
        console.error(`❌ ${status} ${error.config?.url}`, data)
      }
      
      // Handle 401 Unauthorized - Token expired or invalid
      if (status === 401) {
        const token = localStorage.getItem('token')
        if (token) {
          // Clear invalid token
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          // Redirect to login if not already there
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login'
          }
        }
      }
      
      // Handle 403 Forbidden
      if (status === 403) {
        console.error('Access denied. Insufficient permissions.')
      }
      
      // Handle 404 Not Found
      if (status === 404) {
        console.error('Endpoint not found:', error.config?.url)
      }
      
      // Handle 500 Server Error
      if (status >= 500) {
        console.error('Server error. Please try again later.')
      }
      
    } else if (error.request) {
      // Request was made but no response received
      if (import.meta.env.DEV) {
        console.error('🌐 No response received:', error.request)
      }
      
      // Network error - show user-friendly message
      error.message = 'Network error. Please check your connection.'
      
    } else {
      // Something else happened
      if (import.meta.env.DEV) {
        console.error('⚠️ Request error:', error.message)
      }
    }
    
    return Promise.reject(error)
  }
)

export default api