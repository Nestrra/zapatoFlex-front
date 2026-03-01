import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { fetchAdminOrders } from '../services/orders'
import type { Order } from '../types/order'

const PAGE_SIZE = 10

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparación',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
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

export default function AdminOrdersPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)

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
    fetchAdminOrders({ limit: PAGE_SIZE, offset: page * PAGE_SIZE })
      .then(setOrders)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar los pedidos')
        toast.error('No se pudieron cargar los pedidos')
      })
      .finally(() => setLoading(false))
  }, [user, navigate, page])

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  if (loading && orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse mb-8" />
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <div className="h-12 bg-neutral-100" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 border-t border-neutral-200 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error && orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/dashboard" className="text-neutral-600 hover:text-neutral-900 text-sm mb-6 inline-block">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Pedidos (admin)</h1>
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3">
          {error}
        </div>
      </div>
    )
  }

  const hasNext = orders.length === PAGE_SIZE
  const hasPrev = page > 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/dashboard" className="text-neutral-600 hover:text-neutral-900 text-sm mb-6 inline-block">
        ← Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Todos los pedidos</h1>
      <p className="text-neutral-500 text-sm mb-6">
        Solo administradores. Haz clic en &quot;Ver&quot; para ver el detalle y cambiar el estado.
      </p>

      {orders.length === 0 ? (
        <p className="text-neutral-500">No hay pedidos.</p>
      ) : (
        <>
          <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">
                      Pedido
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-900">
                      Estado
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-900">
                      Total
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50"
                    >
                      <td className="py-3 px-4 text-neutral-900 font-medium">
                        #{String(order.id).slice(0, 8)}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            order.status === 'DELIVERED'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'CANCELLED'
                                ? 'bg-neutral-200 text-neutral-600'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-neutral-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/admin/pedidos/${order.id}`}
                          className="text-sm font-medium text-neutral-700 hover:text-neutral-900 underline"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-neutral-500">
              Página {page + 1}
              {orders.length > 0 && ` · Mostrando ${orders.length} pedidos`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={!hasPrev}
                className="px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                className="px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
