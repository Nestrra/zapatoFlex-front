import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import HomePage from './HomePage'

/**
 * En la ruta "/": si el usuario es ADMIN, redirige al dashboard; si no, muestra la home.
 */
export default function HomeOrRedirect() {
  const { user } = useAuth()
  if (user?.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }
  return <HomePage />
}
