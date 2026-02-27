import { toast } from 'sonner'

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-4">
        Bienvenido a ZapatoFlex
      </h1>
      <p className="text-neutral-600 mb-6">
        Tu tienda de calzado en línea. Explora nuestro catálogo y encuentra el par ideal.
      </p>
      <button
        type="button"
        onClick={() => toast.success('¡Notificación de ejemplo!')}
        className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
      >
        Probar toast
      </button>
    </div>
  )
}
