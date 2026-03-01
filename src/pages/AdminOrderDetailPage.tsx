import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { fetchAdminOrderById, updateAdminOrderStatus } from '../services/orders'
import type { OrderDetail } from '../types/order'

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
    month: 'long',
    year: 'numeric',
  })
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/iniciar-sesion', { replace: true })
      return
    }
    if (user.role !== 'ADMIN') {
      navigate('/', { replace: true })
      return
    }
  }, [user, navigate])

  useEffect(() => {
    if (!id || !user || user.role !== 'ADMIN') return
    setLoading(true)
    setError(null)
    fetchAdminOrderById(id)
      .then(setOrder)
      .catch(() => {
        setError('No se pudo cargar el pedido')
        toast.error('Error al cargar el pedido')
      })
      .finally(() => setLoading(false))
  }, [id, user])

  const handleStatusChange = async (newStatus: string) => {
    if (!order || newStatus === order.status) return
    setUpdatingStatus(true)
    try {
      const updated = await updateAdminOrderStatus(order.id, newStatus)
      setOrder((prev) => (prev ? { ...prev, status: updated.status } : null))
      toast.success('Estado actualizado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-6 bg-neutral-200 rounded w-48 animate-pulse mb-8" />
        <div className="space-y-4">
          <div className="h-24 bg-neutral-200 rounded animate-pulse" />
          <div className="h-32 bg-neutral-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/admin/pedidos" className="text-neutral-600 hover:text-neutral-900 text-sm mb-6 inline-block">
          ← Pedidos
        </Link>
        <p className="text-neutral-600">{error ?? 'Pedido no encontrado.'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/admin/pedidos" className="text-neutral-600 hover:text-neutral-900 text-sm mb-6 inline-block">
        ← Volver a pedidos
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          Pedido #{String(order.id).slice(0, 8)}
        </h1>
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">Estado:</span>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white text-neutral-900 disabled:opacity-60"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {updatingStatus && (
            <span className="text-xs text-neutral-500">Guardando…</span>
          )}
        </label>
      </div>

      <p className="text-sm text-neutral-500 mb-6">
        Realizado el {formatDate(order.createdAt)}
      </p>

      {order.shippingAddress && (
        <div className="mb-8">
          <h2 className="font-semibold text-neutral-900 mb-2">Dirección de envío</h2>
          <p className="text-neutral-600 text-sm whitespace-pre-wrap">{order.shippingAddress}</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-semibold text-neutral-900 mb-4">Productos</h2>
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left py-2 px-4 text-sm font-medium text-neutral-600">
                  Cantidad
                </th>
                <th className="text-left py-2 px-4 text-sm font-medium text-neutral-600">
                  Talla
                </th>
                <th className="text-right py-2 px-4 text-sm font-medium text-neutral-600">
                  P. unit.
                </th>
                <th className="text-right py-2 px-4 text-sm font-medium text-neutral-600">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {(order.items ?? []).map((item) => (
                <tr key={item.id} className="border-b border-neutral-100 last:border-0">
                  <td className="py-2 px-4 text-neutral-900">{item.quantity}</td>
                  <td className="py-2 px-4 text-neutral-700">{item.size}</td>
                  <td className="py-2 px-4 text-right text-neutral-700">
                    {formatPrice(item.unitPrice)}
                  </td>
                  <td className="py-2 px-4 text-right font-medium text-neutral-900">
                    {formatPrice(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Envío</span>
          <span>{order.shippingCost === 0 ? 'Gratis' : formatPrice(order.shippingCost)}</span>
        </div>
        <div className="flex justify-between font-semibold text-neutral-900 pt-2">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {order.payment && (
        <div className="mt-8 p-4 bg-neutral-50 rounded-xl">
          <h2 className="font-semibold text-neutral-900 mb-2">Pago</h2>
          <p className="text-sm text-neutral-600">
            {order.payment.paymentMethod} · {order.payment.status}
          </p>
        </div>
      )}
    </div>
  )
}
