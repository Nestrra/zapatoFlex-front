import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { fetchProducts } from '../services/products'
import type { Product } from '../types/product'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/productos/${product.id}`}
      className="group block bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-md transition-all"
    >
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
  )
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error al cargar productos')
        toast.error('No se pudieron cargar los productos')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Bienvenido a ZapatoFlex
        </h1>
        <p className="text-neutral-600">
          Tu tienda de calzado en línea. Explora nuestro catálogo y encuentra el par ideal.
        </p>
      </div>

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
        <p className="text-neutral-500">No hay productos disponibles.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">
            Productos destacados
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
