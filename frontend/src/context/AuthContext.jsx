import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('marketplace_user')
    const token  = localStorage.getItem('marketplace_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = useCallback((authResponse) => {
    const { token, ...userInfo } = authResponse
    localStorage.setItem('marketplace_token', token)
    localStorage.setItem('marketplace_user', JSON.stringify(userInfo))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userInfo)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('marketplace_token')
    localStorage.removeItem('marketplace_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }, [])

  const isRole = (...roles) => user && roles.includes(user.role)

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isRole }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)