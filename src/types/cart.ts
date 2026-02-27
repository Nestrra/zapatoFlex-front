export interface CartItem {
  id: number
  cartId: number
  productId: number
  productName: string
  productPrice: number
  productImageUrl: string | null
  size: string
  quantity: number
  unitPrice: number
  subtotal: number
  createdAt: string
  updatedAt: string
}

export interface Cart {
  id: number
  userId: number
  items: CartItem[]
  subtotal: number
  createdAt: string
  updatedAt: string
}
