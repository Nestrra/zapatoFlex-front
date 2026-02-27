import { API_BASE_URL } from '../config/env'
import type { Product, ProductsResponse } from '../types/product'

const API_PREFIX = '/api/v1'

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
