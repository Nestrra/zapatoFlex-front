import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { fetchAdminOrders, updateAdminOrderStatus } from '../services/orders'
import type { Order } from '../types/order'

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'PREPARING', label: 'En preparación' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
] as const

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

export default function AdminOrdersPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | number | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/iniciar-sesion', { replace: true })
      return
    }
    if (user.role !== 'ADMIN') {
      navigate('/', { replace: true })
      return
    }
    setLoading(true)
    setError(null)
    fetchAdminOrders()
      .then(setOrders)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar los pedidos')
        toast.error('No se pudieron cargar los pedidos')
      })
      .finally(() => setLoading(false))
  }, [user, navigate])

  const handleStatusChange = async (order: Order, newStatus: string) => {
    if (newStatus === order.status) return
    setUpdatingOrderId(order.id)
    try {
      const updated = await updateAdminOrderStatus(order.id, newStatus)
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: updated.status } : o))
      )
      toast.success('Estado actualizado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-neutral-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Pedidos (admin)</h1>
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3">
          {error}
        </div>
        <Link to="/dashboard" className="inline-block mt-4 text-neutral-600 hover:underline">
          Volver al dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/dashboard" className="text-neutral-600 hover:text-neutral-900 text-sm mb-6 inline-block">
        ← Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Todos los pedidos</h1>
      <p className="text-neutral-500 text-sm mb-8">
        Solo administradores. Puedes cambiar el estado de cada pedido con el selector.
      </p>

      {orders.length === 0 ? (
        <p className="text-neutral-500">No hay pedidos.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const isUpdating = updatingOrderId === order.id
            return (
              <li
                key={order.id}
                className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    Pedido #{String(order.id).slice(0, 8)}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600 whitespace-nowrap">Estado:</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      disabled={isUpdating}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm bg-white text-neutral-900 disabled:opacity-60"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    {isUpdating && (
                      <span className="text-xs text-neutral-500">Guardando…</span>
                    )}
                  </label>
                  <span className="font-semibold text-neutral-900">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
