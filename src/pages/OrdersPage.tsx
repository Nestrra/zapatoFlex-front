import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { fetchMyOrders } from '../services/orders'
import type { Order } from '../types/order'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparación',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-sky-100 text-sky-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-neutral-200 text-neutral-600',
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError(null)
    fetchMyOrders()
      .then(setOrders)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar los pedidos')
        toast.error('No se pudieron cargar tus pedidos')
      })
      .finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">Mis pedidos</h1>
          <p className="text-neutral-700 mb-6">
            Inicia sesión para ver el estado de tus pedidos y el historial de compras.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/iniciar-sesion"
              className="inline-flex items-center px-5 py-2.5 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              className="inline-flex items-center px-5 py-2.5 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-neutral-900 mb-8">Mis pedidos</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-neutral-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Mis pedidos</h1>
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-12 text-center">
          <p className="text-neutral-600 mb-6">Aún no tienes pedidos.</p>
          <Link
            to="/productos"
            className="inline-flex items-center px-5 py-2.5 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-neutral-300 transition-colors"
            >
              <Link to={`/pedidos/${order.id}`} className="block">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-neutral-900">
                      Pedido #{String(order.id).slice(0, 8)}
                    </p>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        STATUS_STYLES[order.status] ?? 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    <span className="font-semibold text-neutral-900">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
