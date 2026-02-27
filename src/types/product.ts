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

export interface ProductsResponse {
  products: Product[]
}
