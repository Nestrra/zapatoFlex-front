import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-4">Registro</h1>
      <p className="text-neutral-600 mb-6">Formulario de registro (próximamente).</p>
      <Link to="/iniciar-sesion" className="text-blue-600 hover:underline">
        Ya tengo cuenta — Iniciar sesión
      </Link>
    </div>
  )
}
