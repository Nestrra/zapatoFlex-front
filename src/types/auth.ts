export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'CUSTOMER' | 'ADMIN'
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
