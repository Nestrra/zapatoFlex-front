import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { fetchCart } from '../services/cart'
import { checkout } from '../services/orders'
import type { Cart } from '../types/cart'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { refreshCartCount } = useCart()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchCart()
      .then(setCart)
      .catch(() => toast.error('No se pudo cargar el carrito'))
      .finally(() => setLoading(false))
  }, [user])

  const handleConfirm = async () => {
    if (!user?.address?.trim()) {
      toast.error('Completa tus datos de envío')
      navigate('/datos-envio?from=/checkout')
      return
    }
    if (!cart?.items?.length) {
      toast.error('El carrito está vacío')
      navigate('/carrito')
      return
    }
    setConfirming(true)
    try {
      await checkout({
        shippingAddress: user.address.trim(),
        paymentMethod: 'CONTRA_ENTREGA',
      })
      await refreshCartCount()
      toast.success('Pedido realizado correctamente')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al confirmar el pedido')
    } finally {
      setConfirming(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-neutral-600 mb-4">Inicia sesión para continuar.</p>
        <Link to="/iniciar-sesion" className="text-blue-600 hover:underline">
          Iniciar sesión
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-8 bg-neutral-200 rounded w-1/3 animate-pulse mb-8" />
        <div className="h-40 bg-neutral-200 rounded animate-pulse" />
      </div>
    )
  }

  const items = cart?.items ?? []
  const subtotal = cart?.subtotal ?? 0

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-neutral-600 mb-4">Tu carrito está vacío.</p>
        <Link to="/productos" className="text-blue-600 hover:underline">
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Confirmar pedido</h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-semibold text-neutral-900 mb-4">Envío</h2>
          <p className="text-neutral-700 text-sm whitespace-pre-wrap">{user.address || '—'}</p>
          {!user.address?.trim() && (
            <Link to="/datos-envio?from=/checkout" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Completar datos de envío
            </Link>
          )}
          <h2 className="font-semibold text-neutral-900 mt-6 mb-4">Resumen</h2>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="text-sm text-neutral-600">
                {item.productName} · Talla {item.size} · {item.quantity} — {formatPrice(item.subtotal)}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6 h-fit">
          <p className="text-neutral-600 text-sm mb-2">
            {items.length} producto(s)
          </p>
          <p className="text-xl font-bold text-neutral-900 mb-4">{formatPrice(subtotal)}</p>
          <p className="text-neutral-600 text-sm mb-4">Entrega: Gratis</p>
          <p className="text-lg font-bold text-neutral-900 mb-6">Total: {formatPrice(subtotal)}</p>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming || !user.address?.trim()}
            className="w-full py-3 px-4 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {confirming ? 'Procesando…' : 'Confirmar pedido'}
          </button>
          <Link to="/carrito" className="block text-center text-sm text-neutral-500 mt-4 hover:underline">
            Volver al carrito
          </Link>
        </div>
      </div>
    </div>
  )
}
