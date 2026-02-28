import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { fetchCart } from '../services/cart'

interface CartContextValue {
  cartCount: number
  refreshCartCount: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  const refreshCartCount = useCallback(async () => {
    if (!user) {
      setCartCount(0)
      return
    }
    try {
      const cart = await fetchCart()
      setCartCount(cart.items?.length ?? 0)
    } catch {
      setCartCount(0)
    }
  }, [user])

  useEffect(() => {
    refreshCartCount()
  }, [refreshCartCount])

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
