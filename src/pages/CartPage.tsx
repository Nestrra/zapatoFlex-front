import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { fetchCart, updateCartItem, removeCartItem } from '../services/cart'
import type { Cart, CartItem } from '../types/cart'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export default function CartPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { refreshCartCount } = useCart()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyItemId, setBusyItemId] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError(null)
    fetchCart()
      .then(setCart)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar el carrito')
        toast.error('No se pudo cargar tu carrito')
      })
      .finally(() => setLoading(false))
  }, [user])

  const handleGoToPay = () => {
    if (!user?.address?.trim()) {
      toast.error('Completa tus datos de envío para continuar')
      navigate('/datos-envio?from=/carrito')
      return
    }
    navigate('/checkout')
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">Carrito</h1>
          <p className="text-neutral-700 mb-6">
            Para ver y gestionar tu carrito necesitas iniciar sesión. Si ya tienes cuenta, inicia sesión; si no, regístrate para guardar tus productos y completar tu compra.
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse mb-8" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-neutral-200 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-neutral-200 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Tu carrito</h1>
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3">
          {error}
        </div>
      </div>
    )
  }

  const items = cart?.items ?? []
  const subtotal = cart?.subtotal ?? 0
  const total = subtotal // Entrega gratis

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return
    setBusyItemId(item.id)
    try {
      const updated = await updateCartItem(item.id, newQuantity)
      setCart(updated)
      await refreshCartCount()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setBusyItemId(null)
    }
  }

  const handleRemove = async (item: CartItem) => {
    setBusyItemId(item.id)
    try {
      const updated = await removeCartItem(item.id)
      setCart(updated)
      await refreshCartCount()
      toast.success('Producto eliminado del carrito')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setBusyItemId(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Tu carrito</h1>
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-12 text-center">
          <p className="text-neutral-600 mb-6">Tu carrito está vacío.</p>
          <Link
            to="/productos"
            className="inline-flex items-center px-5 py-2.5 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Ver productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Columna izquierda: TU CARRITO */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">
            Tu carrito <span className="font-normal text-neutral-500">({items.length} {items.length === 1 ? 'producto' : 'productos'})</span>
          </h1>
          <p className="text-sm text-neutral-500 mb-6">
            Los artículos en tu carrito no están reservados. Termina el proceso de compra ahora para hacerte con ellos.
          </p>

          <ul className="space-y-4">
            {items.map((item) => {
              const isBusy = busyItemId === item.id
              return (
                <li
                  key={item.id}
                  className="flex gap-4 bg-white border border-neutral-200 rounded-xl p-4 relative"
                >
                  <div className="w-24 h-24 shrink-0 bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {item.productImageUrl ? (
                      <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-neutral-400 text-3xl">👟</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/productos/${item.productId}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      Talla {item.size}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-neutral-300 rounded-lg">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                          disabled={isBusy || item.quantity <= 1}
                          className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md"
                          aria-label="Reducir cantidad"
                        >
                          −
                        </button>
                        <span className="w-10 h-9 flex items-center justify-center text-sm font-medium border-x border-neutral-300">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                          disabled={isBusy}
                          className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        disabled={isBusy}
                        className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        aria-label="Eliminar del carrito"
                        title="Eliminar del carrito"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <p className="text-neutral-900 font-semibold">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Columna derecha: RESUMEN DEL PEDIDO */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 sticky top-4">
            <h2 className="text-lg font-bold text-neutral-900 mb-6">Resumen del pedido</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">{items.length} {items.length === 1 ? 'producto' : 'productos'}</span>
                <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Entrega</span>
                <span className="text-neutral-900">Gratis</span>
              </div>
            </div>
            <div className="border-t border-neutral-200 mt-4 pt-4 flex justify-between items-center">
              <span className="font-bold text-neutral-900">Total</span>
              <span className="text-xl font-bold text-neutral-900">{formatPrice(total)}</span>
            </div>
            <button
              type="button"
              onClick={handleGoToPay}
              className="mt-6 w-full py-3.5 px-4 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              Ir a pagar
              <ArrowRightIcon />
            </button>
            {!user?.address?.trim() && (
              <p className="mt-3 text-xs text-amber-700">
                Debes completar tu dirección de envío para poder pagar.
              </p>
            )}
            <Link
              to="/productos"
              className="block text-center text-sm text-neutral-500 mt-4 hover:underline"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
