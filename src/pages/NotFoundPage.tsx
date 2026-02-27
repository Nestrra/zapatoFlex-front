import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 className="text-4xl font-bold text-neutral-900 mb-2">404</h1>
      <p className="text-neutral-600 mb-6">Página no encontrada.</p>
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
