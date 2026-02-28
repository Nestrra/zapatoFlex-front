import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User } from '../types/auth'
import { getStoredUser, getStoredToken, setAuth, clearAuth } from '../services/auth'

interface AuthContextValue {
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser())

  const login = useCallback((token: string, userData: User) => {
    setAuth(token, userData)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setUser(null)
  }, [])

  const setUserFromContext = useCallback((next: User | null) => {
    setUser(next)
    if (next) {
      const token = getStoredToken()
      if (token) setAuth(token, next)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser: setUserFromContext }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
