import axios from 'axios'

// ─── Why /backend and not the full URL? ──────────────────────────────────────
// Vercel serves over HTTPS. Calling http://backend.seedalotour.shop directly
// from the browser triggers a "mixed content" block + CORS errors.
//
// Instead we use Next.js rewrites (next.config.ts):
//   browser → /backend/* (same-origin, HTTPS, no CORS)
//   Next.js server → http://backend.seedalotour.shop/api/* (server-to-server, fine)
//
// This works on both Vercel (production) and local dev (next dev handles rewrites too).
// ─────────────────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: '/backend',
  headers: { 'Content-Type': 'application/json' },
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