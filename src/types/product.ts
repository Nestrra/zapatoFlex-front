export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  currency: string
  category: string
  imageUrl: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductInventoryItem {
  id: number
  productId: number
  size: string
  quantity: number
  updatedAt: string
}

export interface ProductDetail extends Product {
  inventory: ProductInventoryItem[]
}

export interface ProductsResponse {
  products: Product[]
}
