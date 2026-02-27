import { API_BASE_URL } from '../config/env'
import type { LoginResponse, User } from '../types/auth'

const API_PREFIX = '/api/v1'
const AUTH_STORAGE_KEY = 'zapatoflex_token'
const USER_STORAGE_KEY = 'zapatoflex_user'

export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Inicia sesión. POST /api/v1/auth/login
 * Lanza si la respuesta no es OK (credenciales inválidas, red, etc.).
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const url = `${API_BASE_URL}${API_PREFIX}/auth/login`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email.trim(),
      password: credentials.password,
    }),
  })

  const data = await res.json().catch(() => ({ error: 'UNKNOWN_ERROR' }))

  if (!res.ok) {
    const message =
      data.error === 'EMAIL_AND_PASSWORD_REQUIRED'
        ? 'Email y contraseña son obligatorios'
        : data.error === 'INVALID_CREDENTIALS'
          ? 'Email o contraseña incorrectos'
          : 'Error al iniciar sesión. Intenta de nuevo.'
    throw new Error(message)
  }

  return data as LoginResponse
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_STORAGE_KEY)
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function setAuth(token: string, user: User): void {
  localStorage.setItem(AUTH_STORAGE_KEY, token)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}
