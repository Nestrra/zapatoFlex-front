import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { register as registerApi, login as loginApi } from '../services/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  firstName?: string
  lastName?: string
}

function validate(
  email: string,
  password: string,
  confirmPassword: string,
  _firstName: string,
  _lastName: string
): FormErrors {
  const errors: FormErrors = {}
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    errors.email = 'El correo electrónico es obligatorio'
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Introduce un correo electrónico válido'
  }

  if (!password) {
    errors.password = 'La contraseña es obligatoria'
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
  }

  return errors
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login: setAuthState } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const nextErrors = validate(email, password, confirmPassword, firstName, lastName)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await registerApi({
        email,
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      })
      toast.success('Cuenta creada. Iniciando sesión…')
      const loginResult = await loginApi({ email: email.trim(), password })
      setAuthState(loginResult.token, loginResult.user)
      toast.success(`Bienvenido, ${loginResult.user.firstName || loginResult.user.email}`)
      navigate(loginResult.user.role === 'ADMIN' ? '/dashboard' : '/', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrarse'
      setErrors({ email: message })
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (fieldError?: string) =>
    `w-full px-4 py-2.5 rounded-lg border bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent ${
      fieldError ? 'border-red-500' : 'border-neutral-300'
    }`

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Crear cuenta</h1>
        <p className="text-neutral-600 text-sm mb-8">
          Completa el formulario para registrarte y poder comprar en ZapatoFlex.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              className={inputClass(errors.email)}
              placeholder="ejemplo@correo.com"
              disabled={submitting}
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="register-firstName" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Nombre
              </label>
              <input
                id="register-firstName"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass(errors.firstName)}
                placeholder="Juan"
                disabled={submitting}
              />
              {errors.firstName && (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="register-lastName" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Apellidos
              </label>
              <input
                id="register-lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass(errors.lastName)}
                placeholder="Pérez"
                disabled={submitting}
              />
              {errors.lastName && (
                <p className="mt-1.5 text-red-600 text-sm" role="alert">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
              }}
              className={inputClass(errors.password)}
              placeholder="Mínimo 6 caracteres"
              disabled={submitting}
            />
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="register-confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Confirmar contraseña <span className="text-red-500">*</span>
            </label>
            <input
              id="register-confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
              }}
              className={inputClass(errors.confirmPassword)}
              placeholder="Repite la contraseña"
              disabled={submitting}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Creando cuenta…' : 'Registrarme'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/iniciar-sesion" className="font-medium text-neutral-900 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
