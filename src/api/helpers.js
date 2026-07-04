import api from './axios'

// Helper for handling API errors consistently
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        return data?.error || 'Bad request. Please check your input.'
      case 401:
        return 'Session expired. Please login again.'
      case 403:
        // 🔥 PASTE THIS SECTION - Handle verification error
        if (data?.needsVerification) {
          return data?.error || 'Please verify your email before logging in.'
        }
        return 'Access denied. Insufficient permissions.'
      case 404:
        return 'Resource not found.'
      case 409:
        return data?.error || 'Conflict. This resource already exists.'
      case 422:
        return data?.error || 'Validation failed. Please check your input.'
      case 429:
        return 'Too many requests. Please try again later.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return data?.error || 'An unexpected error occurred.'
    }
  } else if (error.request) {
    return 'Network error. Please check your connection.'
  } else {
    return error.message || 'An unexpected error occurred.'
  }
}

// Auth helpers
export const auth = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
  
  getToken: () => {
    return localStorage.getItem('token')
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  }
}

// Rates helpers
export const rates = {
  getAll: async () => {
    const response = await api.get('/rates')
    return response.data
  },
  
  getMarketSummary: async () => {
    const response = await api.get('/rates/market-summary')
    return response.data
  },
  
  update: async (id, data) => {
    const response = await api.patch(`/rates/${id}`, data)
    return response.data
  }
}

// Transactions helpers
export const transactions = {
  getAll: async () => {
    const response = await api.get('/transactions')
    return response.data
  },
  
  create: async (data) => {
    const response = await api.post('/transactions', data)
    return response.data
  },
  
  getStats: async () => {
    const response = await api.get('/transactions/stats')
    return response.data
  }
}

// Bank details helpers
export const bank = {
  get: async () => {
    const response = await api.get('/auth/bank-details')
    return response.data
  },
  
  update: async (data) => {
    const response = await api.put('/auth/bank-details', data)
    return response.data
  }
}

// Password helpers
export const password = {
  change: async (data) => {
    const response = await api.put('/auth/change-password', data)
    return response.data
  }
}

// Referral helpers
export const referral = {
  generate: async () => {
    const response = await api.get('/referrals/generate')
    return response.data
  },
  
  validate: async (code) => {
    const response = await api.post('/referrals/validate', { referral_code: code })
    return response.data
  },
  
  track: async (code) => {
    const response = await api.post('/referrals/track', { referral_code: code })
    return response.data
  },
  
  getStats: async () => {
    const response = await api.get('/referrals/stats')
    return response.data
  }
}