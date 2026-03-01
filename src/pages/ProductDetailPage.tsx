import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { fetchProductById } from '../services/products'
import { addToCart } from '../services/cart'
import type { ProductDetail } from '../types/product'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { refreshCartCount } = useCart()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    fetchProductById(id)
      .then((p) => {
        setProduct(p)
        if (p?.inventory?.length) {
          const firstWithStock = p.inventory.find((i) => i.quantity > 0)
          setSelectedSize(firstWithStock?.size ?? '')
        }
      })
      .catch(() => setError('No se pudo cargar el producto'))
      .finally(() => setLoading(false))
  }, [id])

  const availableSizes = product?.inventory?.filter((i) => i.quantity > 0) ?? []
  const maxQty = selectedSize
    ? availableSizes.find((i) => i.size === selectedSize)?.quantity ?? 0
    : 0

  useEffect(() => {
    setQuantity((q) => (maxQty > 0 ? Math.min(q, maxQty) : 1))
  }, [selectedSize, maxQty])

  const handleAddToCart = async () => {
    if (!product) return
    if (!user) {
      toast.error('Inicia sesión para agregar productos al carrito')
      navigate('/iniciar-sesion', { state: { from: `/productos/${product.id}` } })
      return
    }
    if (!selectedSize) {
      toast.error('Selecciona una talla')
      return
    }
    const qty = Math.min(Math.max(1, quantity), maxQty)
    if (qty < 1) {
      toast.error('Selecciona al menos 1 unidad')
      return
    }
    setAddingToCart(true)
    try {
      await addToCart(product.id, selectedSize, qty)
      await refreshCartCount()
      toast.success('Producto agregado al carrito')
      setQuantity(1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al agregar al carrito')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square bg-neutral-200 rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-neutral-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-neutral-200 rounded w-1/2 animate-pulse" />
            <div className="h-20 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-neutral-600 mb-4">{error ?? 'Producto no encontrado.'}</p>
        <Link to="/productos" className="text-blue-600 hover:underline">
          Ver todos los productos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square bg-neutral-100 rounded-xl overflow-hidden flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-neutral-400 text-8xl">👟</span>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold text-neutral-900 mb-6">
            {formatPrice(product.price)}
          </p>
          {product.description && (
            <p className="text-neutral-600 mb-8">{product.description}</p>
          )}

          {availableSizes.length === 0 ? (
            <p className="text-amber-700 font-medium mb-6">Sin stock disponible</p>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Talla
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((inv) => (
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => setSelectedSize(inv.size)}
                      className={`min-w-[48px] py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        selectedSize === inv.size
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      {inv.size}
                      <span className="ml-1 text-neutral-500 font-normal">
                        ({inv.quantity})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    setQuantity(Math.max(1, Math.min(maxQty, Number.isNaN(val) ? 1 : val)))
                  }}
                  className="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
                <p className="text-sm text-neutral-500 mt-1">
                  Máximo {maxQty} disponibles
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full md:w-auto px-8 py-3 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {addingToCart ? 'Agregando…' : 'Agregar al carrito'}
              </button>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-wrap items-center gap-4">
            {user?.role === 'ADMIN' && (
              <Link
                to={`/admin/productos/${product.id}/editar`}
                className="text-sm font-medium text-neutral-700 hover:text-neutral-900 underline"
              >
                Editar producto
              </Link>
            )}
            <Link to="/productos" className="text-neutral-600 hover:text-neutral-900">
              ← Volver a productos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
