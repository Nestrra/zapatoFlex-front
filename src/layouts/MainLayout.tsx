import { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchCart } from '../services/cart'

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-neutral-900"
      aria-hidden
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-neutral-900"
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    if (!user) {
      setCartCount(0)
      return
    }
    fetchCart()
      .then((cart) => setCartCount(cart.items?.length ?? 0))
      .catch(() => setCartCount(0))
  }, [user, location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : ''

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra principal */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              to="/"
              className="font-semibold text-lg text-neutral-900 shrink-0"
            >
              ZapatoFlex
            </Link>
            <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
              <Link
                to="/productos?category=deportivo"
                className="text-neutral-900 hover:text-neutral-600 transition-colors text-[15px]"
              >
                Deportivos
              </Link>
              <Link
                to="/productos?category=casual"
                className="text-neutral-900 hover:text-neutral-600 transition-colors text-[15px]"
              >
                Casuales
              </Link>
              <Link
                to="/productos?category=formal"
                className="text-neutral-900 hover:text-neutral-600 transition-colors text-[15px]"
              >
                Formales
              </Link>
            </nav>
            <div className="flex items-center gap-4 shrink-0">
              {user ? (
                <span className="text-neutral-700 text-[15px]">
                  Bienvenido, <span className="font-medium text-neutral-900">{displayName}</span>
                </span>
              ) : (
                <Link
                  to="/iniciar-sesion"
                  className="text-neutral-900 hover:text-neutral-600 transition-colors text-[15px]"
                >
                  Iniciar sesión
                </Link>
              )}
              <Link
                to="/carrito"
                className="relative p-1 -m-1 rounded hover:bg-neutral-100 transition-colors"
                aria-label={cartCount > 0 ? `Ir al carrito (${cartCount} productos)` : 'Ir al carrito'}
              >
                <CartIcon />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[11px] font-bold text-white bg-neutral-900 rounded-full"
                    aria-hidden
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              {user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 -m-1.5 rounded hover:bg-neutral-100 transition-colors"
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  <LogoutIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Barra inferior del nav: promoción */}
      <div className="bg-neutral-200/90 border-b border-neutral-300 py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-neutral-900 text-sm font-medium">
            Envíos gratis por compras superiores a $299.900
          </p>
          <Link
            to="/terminos"
            className="text-sm text-blue-600 underline hover:text-blue-700"
          >
            Términos y Condiciones
          </Link>
        </div>
      </div>

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
