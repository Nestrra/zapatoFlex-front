import { API_BASE_URL } from '../config/env'
import { getStoredToken } from './auth'
import type { Cart } from '../types/cart'

const API_PREFIX = '/api/v1'

/**
 * Obtiene el carrito del usuario. Requiere token (usuario autenticado).
 * GET /api/v1/cart
 */
export async function fetchCart(): Promise<Cart> {
  const token = getStoredToken()
  if (!token) {
    throw new Error('No hay sesión iniciada')
  }

  const res = await fetch(`${API_BASE_URL}${API_PREFIX}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesión inválida o expirada')
    throw new Error('Error al cargar el carrito')
  }

  return res.json() as Promise<Cart>
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken()
  if (!token) throw new Error('No hay sesión iniciada')
  return { Authorization: `Bearer ${token}` }
}

/**
 * Actualiza la cantidad de un ítem. PUT /api/v1/cart/items/:itemId
 * Body: { quantity }. Devuelve el carrito actualizado.
 */
export async function updateCartItem(itemId: number, quantity: number): Promise<Cart> {
  const res = await fetch(`${API_BASE_URL}${API_PREFIX}/cart/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ quantity }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    if (data.error === 'INSUFFICIENT_STOCK') {
      throw new Error(`Stock insuficiente. Máximo disponible: ${data.available ?? '?'}`)
    }
    if (res.status === 404) throw new Error('Ítem no encontrado')
    throw new Error('Error al actualizar la cantidad')
  }

  return res.json() as Promise<Cart>
}

/**
 * Elimina un ítem del carrito. DELETE /api/v1/cart/items/:itemId
 * Devuelve el carrito actualizado.
 */
export async function removeCartItem(itemId: number): Promise<Cart> {
  const res = await fetch(`${API_BASE_URL}${API_PREFIX}/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error('Ítem no encontrado')
    throw new Error('Error al eliminar el ítem')
  }

  return res.json() as Promise<Cart>
}
