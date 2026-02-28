export interface User {
  id: number | string
  email: string
  firstName: string
  lastName: string
  role: 'CUSTOMER' | 'ADMIN'
  phone?: string | null
  address?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface LoginResponse {
  success: true
  user: User
  token: string
}

export interface LoginError {
  success?: false
  error: string
}
