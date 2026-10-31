import type { Order, OrderStatus } from './order'

export type OrdersSummary = {
  ordersToday: number
  newOrders: number
  inProgressOrders: number
  salesCents: number
  averageTicketCents: number
}

const inProgressStatuses: OrderStatus[] = ['preparing', 'ready']

export function summarizeOrders(orders: Order[]): OrdersSummary {
  const salesCents = orders.reduce((sum, order) => sum + order.totalCents, 0)

  return {
    ordersToday: orders.length,
    newOrders: orders.filter((order) => order.status === 'new').length,
    inProgressOrders: orders.filter((order) => inProgressStatuses.includes(order.status)).length,
    salesCents,
    averageTicketCents: orders.length === 0 ? 0 : Math.round(salesCents / orders.length),
  }
}
