import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User } from '../types/auth'
import { getStoredUser, setAuth, clearAuth } from '../services/auth'

interface AuthContextValue {
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
