import { Outlet, Link } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="font-semibold text-lg text-neutral-900">
              ZapatoFlex
            </Link>
            <nav className="flex gap-6">
              <Link
                to="/"
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Inicio
              </Link>
              <Link
                to="/productos"
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Productos
              </Link>
              <Link
                to="/carrito"
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Carrito
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-neutral-500 text-sm">
          ZapatoFlex S.A.S. — Calzado en línea
        </div>
      </footer>
    </div>
  )
}
