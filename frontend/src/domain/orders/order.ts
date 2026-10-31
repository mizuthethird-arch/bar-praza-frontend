export type OrderStatus = 'new' | 'preparing' | 'ready' | 'collected'

export type Order = {
  id: number
  client: string
  pickupTime: string
  delayed: boolean
  itemCount: number
  totalCents: number
  status: OrderStatus
}
