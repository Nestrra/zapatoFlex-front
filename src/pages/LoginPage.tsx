import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { login as loginApi } from '../services/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormErrors {
  email?: string
  password?: string
}

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {}
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    errors.email = 'El correo electrónico es obligatorio'
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Introduce un correo electrónico válido'
  }

  if (!password) {
    errors.password = 'La contraseña es obligatoria'
  }

  return errors
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login: setAuthState } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const nextErrors = validate(email, password)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      const result = await loginApi({ email, password })
      setAuthState(result.token, result.user)
      toast.success(`Bienvenido, ${result.user.firstName || result.user.email}`)
      navigate(result.user.role === 'ADMIN' ? '/dashboard' : '/', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setErrors({ password: message })
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Iniciar sesión</h1>
        <p className="text-neutral-600 text-sm mb-8">
          Ingresa tu correo y contraseña para acceder a tu cuenta.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              className={`w-full px-4 py-2.5 rounded-lg border bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-neutral-300'
              }`}
              placeholder="ejemplo@correo.com"
              disabled={submitting}
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              className={`w-full px-4 py-2.5 rounded-lg border bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-neutral-300'
              }`}
              placeholder="••••••••"
              disabled={submitting}
            />
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-neutral-900 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
