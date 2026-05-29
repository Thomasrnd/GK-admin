import { createContext, useContext, useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('gk_admin_token')
    if (!token) { setLoading(false); return }

    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => setAdmin(d.admin))
      .catch(() => localStorage.removeItem('gk_admin_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Gagal login')
    localStorage.setItem('gk_admin_token', data.token)
    setAdmin(data.admin)
  }

  const logout = () => {
    localStorage.removeItem('gk_admin_token')
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

// Helper: fetch dengan token otomatis
export function authFetch(url, options = {}) {
  const token = localStorage.getItem('gk_admin_token')
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}