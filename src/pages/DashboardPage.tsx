import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      navigate('/iniciar-sesion', { replace: true })
      return
    }
    if (user.role !== 'ADMIN') {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Panel de administración</h1>
      <p className="text-neutral-600 mb-8">
        Bienvenido, {user.firstName || user.email}. Gestiona pedidos y catálogo desde aquí.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin/pedidos"
          className="flex flex-col p-6 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-md transition-all"
        >
          <span className="text-3xl mb-2" aria-hidden>📦</span>
          <h2 className="font-semibold text-neutral-900">Pedidos</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Ver y gestionar todos los pedidos
          </p>
        </Link>
        <Link
          to="/productos"
          className="flex flex-col p-6 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 hover:shadow-md transition-all"
        >
          <span className="text-3xl mb-2" aria-hidden>👟</span>
          <h2 className="font-semibold text-neutral-900">Productos</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Ver y editar catálogo de productos
          </p>
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-neutral-200">
        <Link to="/" className="text-neutral-600 hover:text-neutral-900 text-sm">
          ← Volver a la tienda
        </Link>
      </div>
    </div>
  )
}
