// context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setStoredToken, getStoredToken } from '../lib/api/client'
import { login as apiLogin, getMe as apiGetMe, registerUser as apiRegister } from '../lib/api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken())
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      if (!token) {
        setLoading(false)
        return
      }
      
      try {
        const me = await apiGetMe() // No need to pass api parameter
        setUser(me)
      } catch (e) {
        console.error('getMe failed', e)
        if (e?.response?.status === 401) {
          setStoredToken(null)
          setToken(null)
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [token])

  async function login(ehrmsCode, password) {
    try {
      const t = await apiLogin(ehrmsCode, password) // No need to pass api parameter
      setStoredToken(t)
      setToken(t)
      const me = await apiGetMe() // No need to pass api parameter
      setUser(me)
      return me
    } catch (error) {
      throw error
    }
  }

  async function register(payload) {
    try {
      const t = await apiRegister(payload) // No need to pass api parameter
      setStoredToken(t)
      setToken(t)
      const me = await apiGetMe() // No need to pass api parameter
      setUser(me)
      return me
    } catch (error) {
      throw error
    }
  }

  function logout() {
    setStoredToken(null)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ 
    token, 
    user, 
    loading, 
    login, 
    register, 
    logout 
  }), [token, user, loading])
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}