export interface OrderItem {
  id: number
  orderId: number
  productId: number
  size: string
  quantity: number
  unitPrice: number
  createdAt: string
}

export interface Order {
  id: number | string
  userId: number | string
  status: string
  subtotal: number
  shippingCost: number
  total: number
  shippingAddress: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderDetail extends Order {
  items: OrderItem[]
  payment?: {
    id: number | string
    orderId: number | string
    amount: number
    paymentMethod: string
    status: string
  } | null
}

export interface OrdersResponse {
  orders: Order[]
}
