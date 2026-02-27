import { useParams, Link } from 'react-router-dom'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <p className="text-neutral-600 mb-4">Detalle del producto {id} (próximamente).</p>
      <Link to="/productos" className="text-blue-600 hover:underline">
        Ver todos los productos
      </Link>
    </div>
  )
}
