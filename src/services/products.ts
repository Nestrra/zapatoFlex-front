import { API_BASE_URL } from '../config/env'
import { getStoredToken } from './auth'
import type { Product, ProductDetail, ProductsResponse } from '../types/product'

const API_PREFIX = '/api/v1'

export interface CreateProductPayload {
  name: string
  description?: string | null
  price: number
  category: 'casual' | 'deportivo' | 'formal'
  imageUrl?: string | null
  inventory?: { size: string; quantity: number }[]
}

export interface UpdateProductPayload {
  name?: string
  description?: string | null
  price?: number
  category?: 'casual' | 'deportivo' | 'formal'
  imageUrl?: string | null
  active?: boolean
  inventory?: { size: string; quantity: number }[]
}

/**
 * Obtiene todos los productos (opcional: filtrar por categoría).
 * GET /api/v1/products?category=casual|deportivo|formal
 */
export async function fetchProducts(category?: string): Promise<Product[]> {
  const url = new URL(`${API_BASE_URL}${API_PREFIX}/products`)
  if (category) url.searchParams.set('category', category)
  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`Error al cargar productos: ${res.status}`)
  }
  const data = (await res.json()) as ProductsResponse
  return data.products
}

/**
 * Obtiene un producto por id con su inventario (tallas y stock).
 * GET /api/v1/products/:id
 */
export async function fetchProductById(id: number | string): Promise<ProductDetail | null> {
  const res = await fetch(`${API_BASE_URL}${API_PREFIX}/products/${id}`)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error('Error al cargar el producto')
  }
  return res.json() as Promise<ProductDetail>
}

/**
 * Crea un producto (solo ADMIN). POST /api/v1/products
 */
export async function createProduct(payload: CreateProductPayload): Promise<ProductDetail> {
  const token = getStoredToken()
  if (!token) throw new Error('No hay sesión iniciada')
  const res = await fetch(`${API_BASE_URL}${API_PREFIX}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      price: Number(payload.price),
      category: payload.category,
      imageUrl: payload.imageUrl?.trim() || null,
      inventory: payload.inventory?.filter((i) => i.size.trim() && i.quantity > 0) ?? [],
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 400 && data.error === 'NAME_AND_PRICE_REQUIRED') {
      throw new Error('Nombre y precio son obligatorios')
    }
    if (res.status === 400 && data.error === 'INVALID_CATEGORY') {
      throw new Error('Categoría no válida')
    }
    if (res.status === 403) throw new Error('Acceso denegado')
    if (res.status === 401) throw new Error('Sesión inválida')
    throw new Error(data.error ?? 'Error al crear el producto')
  }
  return data as ProductDetail
}

/**
 * Actualiza un producto (solo ADMIN). PUT /api/v1/products/:id
 */
export async function updateProduct(
  id: number | string,
  payload: UpdateProductPayload
): Promise<ProductDetail> {
  const token = getStoredToken()
  if (!token) throw new Error('No hay sesión iniciada')
  const body: Record<string, unknown> = {}
  if (payload.name !== undefined) body.name = payload.name.trim()
  if (payload.description !== undefined) body.description = payload.description?.trim() || null
  if (payload.price !== undefined) body.price = Number(payload.price)
  if (payload.category !== undefined) body.category = payload.category
  if (payload.imageUrl !== undefined) body.imageUrl = payload.imageUrl?.trim() || null
  if (payload.active !== undefined) body.active = payload.active
  if (payload.inventory !== undefined) {
    body.inventory = payload.inventory.filter((i) => i.size.trim() && i.quantity > 0)
  }
  const res = await fetch(`${API_BASE_URL}${API_PREFIX}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 404) throw new Error('Producto no encontrado')
    if (res.status === 403) throw new Error('Acceso denegado')
    if (res.status === 401) throw new Error('Sesión inválida')
    throw new Error(data.error ?? 'Error al actualizar el producto')
  }
  return data as ProductDetail
}
