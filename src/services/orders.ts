import { API_BASE_URL } from '../config/env'
import { getStoredToken } from './auth'
import type { Order, OrderDetail, OrdersResponse } from '../types/order'

const API_PREFIX = '/api/v1'

export interface CheckoutPayload {
  shippingAddress: string
  paymentMethod?: string
}

/**
 * Realiza el checkout: convierte el carrito en pedido. POST /api/v1/orders/checkout
 */
export async function checkout(payload: CheckoutPayload): Promise<{ order: unknown }> {
  const token = getStoredToken()
  if (!token) throw new Error('No hay sesión iniciada')

  const res = await fetch(`${API_BASE_URL}${API_PREFIX}/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      shippingAddress: payload.shippingAddress,
      paymentMethod: payload.paymentMethod ?? 'CONTRA_ENTREGA',
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (data.error === 'CART_EMPTY') throw new Error('El carrito está vacío')
    if (data.error === 'INSUFFICIENT_STOCK') throw new Error('Stock insuficiente en algún producto')
    if (data.error === 'PAYMENT_FAILED') throw new Error('Error al procesar el pago')
    throw new Error(data.error ?? 'Error al confirmar el pedido')
  }
  return data as { order: unknown }
}

/**
 * Lista los pedidos del usuario. GET /api/v1/orders
 */
export async function fetchMyOrders(): Promise<Order[]> {
  const token = getStoredToken()
  if (!token) throw new Error('No hay sesión iniciada')
  const res = await fetch(`${API_BASE_URL}${API_PREFIX}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesión inválida o expirada')
    throw new Error('Error al cargar los pedidos')
  }
  const data = (await res.json()) as OrdersResponse
  return data.orders ?? []
}

/**
 * Detalle de un pedido del usuario. GET /api/v1/orders/:id
 */
export async function fetchOrderById(id: string | number): Promise<OrderDetail | null> {
  const token = getStoredToken()
  if (!token) throw new Error('No hay sesión iniciada')
  const res = await fetch(`${API_BASE_URL}${API_PREFIX}/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error('Error al cargar el pedido')
  }
  return res.json() as Promise<OrderDetail>
}

/**
 * Lista todos los pedidos (solo ADMIN). GET /api/v1/admin/orders
 */
export async function fetchAdminOrders(): Promise<Order[]> {
  const token = getStoredToken()
  if (!token) throw new Error('No hay sesión iniciada')
  const res = await fetch(`${API_BASE_URL}${API_PREFIX}/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    if (res.status === 403) throw new Error('Acceso denegado')
    if (res.status === 401) throw new Error('Sesión inválida o expirada')
    throw new Error('Error al cargar los pedidos')
  }
  const data = (await res.json()) as OrdersResponse
  return data.orders ?? []
}

const VALID_ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const

/**
 * Actualiza el estado de un pedido (solo ADMIN). PATCH /api/v1/admin/orders/:id/status
 */
export async function updateAdminOrderStatus(
  orderId: string | number,
  status: string
): Promise<Order> {
  const token = getStoredToken()
  if (!token) throw new Error('No hay sesión iniciada')
  const normalizedStatus = status.trim().toUpperCase()
  if (!VALID_ORDER_STATUSES.includes(normalizedStatus as (typeof VALID_ORDER_STATUSES)[number])) {
    throw new Error('Estado no válido')
  }
  const res = await fetch(`${API_BASE_URL}${API_PREFIX}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: normalizedStatus }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    if (res.status === 400 && data.validStatuses) {
      throw new Error('Estado no válido')
    }
    if (res.status === 403) throw new Error('Acceso denegado')
    if (res.status === 404) throw new Error('Pedido no encontrado')
    throw new Error('Error al actualizar el estado')
  }
  return res.json() as Promise<Order>
}
