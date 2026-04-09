import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authApi, tokenStore } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)  // true while validating stored token

  // Validate stored token on first mount
  useEffect(() => {
    const token = tokenStore.get()
    if (!token) { setLoading(false); return }

    authApi.me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const { access_token } = await authApi.login(email, password)
    tokenStore.set(access_token)
    const me = await authApi.me()
    setUser(me)
    return me
  }, [])

  const register = useCallback(async (data) => {
    const newUser = await authApi.register(data)
    // Auto-login after registration
    return login(data.email, data.password).catch(() => newUser)
  }, [login])

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
