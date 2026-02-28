import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { fetchOrderById } from '../services/orders'
import type { OrderDetail } from '../types/order'

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
    month: 'long',
    year: 'numeric',
  })
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !id) return
    setLoading(true)
    setError(null)
    fetchOrderById(id)
      .then(setOrder)
      .catch(() => {
        setError('No se pudo cargar el pedido')
        toast.error('Error al cargar el pedido')
      })
      .finally(() => setLoading(false))
  }, [user, id])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-neutral-600 mb-4">Inicia sesión para ver el detalle del pedido.</p>
        <Link to="/iniciar-sesion" className="text-blue-600 hover:underline">
          Iniciar sesión
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="h-8 bg-neutral-200 rounded w-1/3 animate-pulse mb-8" />
        <div className="h-40 bg-neutral-200 rounded animate-pulse" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-neutral-600 mb-4">{error ?? 'Pedido no encontrado.'}</p>
        <Link to="/pedidos" className="text-blue-600 hover:underline">
          Volver a mis pedidos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/pedidos" className="text-neutral-600 hover:text-neutral-900 text-sm mb-6 inline-block">
        ← Volver a mis pedidos
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          Pedido #{String(order.id).slice(0, 8)}
        </h1>
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
            order.status === 'DELIVERED'
              ? 'bg-green-100 text-green-800'
              : order.status === 'CANCELLED'
                ? 'bg-neutral-200 text-neutral-600'
                : 'bg-blue-100 text-blue-800'
          }`}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
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
        <ul className="space-y-3">
          {(order.items ?? []).map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-0"
            >
              <span className="text-neutral-700">
                {item.quantity} × Talla {item.size} — {formatPrice(item.unitPrice)}
              </span>
              <span className="font-medium text-neutral-900">
                {formatPrice(item.quantity * item.unitPrice)}
              </span>
            </li>
          ))}
        </ul>
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
