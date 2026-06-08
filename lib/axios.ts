import axios from 'axios'

// All API calls go to /backend/* (same-origin, HTTPS safe).
// Next.js rewrites /backend/* → http://backend.seedalotour.shop/api/* server-side.

const api = axios.create({
  baseURL: '/backend',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // ─── Fix for Laravel backend bug ─────────────────────────────────────────
  // The backend prepends a PHP comment to every response, e.g.:
  //   // routes/api.php
  //   {"token":"...","user":{...}}
  //
  // This makes the body invalid JSON. We strip the comment before parsing.
  // ─────────────────────────────────────────────────────────────────────────
  transformResponse: [(data) => {
    if (typeof data !== 'string') return data
    // Remove any leading // comment lines (handles single or multiple lines)
    const cleaned = data.replace(/^(\/\/[^\n]*\n?)+/, '').trim()
    if (!cleaned) return data
    try {
      return JSON.parse(cleaned)
    } catch {
      // Not JSON — return as-is (HTML error pages, etc.)
      return cleaned
    }
  }],
})

// Attach Bearer token on every request (client-side only)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401 → clear session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api