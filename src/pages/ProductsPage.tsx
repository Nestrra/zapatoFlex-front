import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { fetchProducts } from '../services/products'
import type { Product } from '../types/product'

const CATEGORY_LABELS: Record<string, string> = {
  deportivo: 'Deportivos',
  casual: 'Casuales',
  formal: 'Formales',
}

const VALID_CATEGORIES = ['deportivo', 'casual', 'formal']

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function ProductCard({ product, isAdmin }: { product: Product; isAdmin?: boolean }) {
  return (
    <div className="group relative bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-md transition-all">
      <Link to={`/productos/${product.id}`} className="block">
        <div className="aspect-square bg-neutral-100 flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <span className="text-neutral-400 text-4xl">👟</span>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h2 className="font-semibold text-neutral-900 mb-1 line-clamp-2 group-hover:text-neutral-600">
            {product.name}
          </h2>
          <p className="text-lg font-semibold text-neutral-900">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
      {isAdmin && (
        <Link
          to={`/admin/productos/${product.id}/editar`}
          className="absolute top-2 right-2 px-2 py-1 bg-white/90 hover:bg-white border border-neutral-200 rounded text-xs font-medium text-neutral-700 shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          Editar
        </Link>
      )}
    </div>
  )
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const categoryParam = searchParams.get('category')?.toLowerCase() ?? ''
  const category = VALID_CATEGORIES.includes(categoryParam) ? categoryParam : undefined

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchProducts(category)
      .then(setProducts)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar productos')
        toast.error('No se pudieron cargar los productos')
      })
      .finally(() => setLoading(false))
  }, [category])

  const pageTitle = category ? CATEGORY_LABELS[category] : 'Todos los productos'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">{pageTitle}</h1>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square bg-neutral-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-neutral-500">No hay productos en esta categoría.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isAdmin={user?.role === 'ADMIN'} />
          ))}
        </div>
      )}
    </div>
  )
}
