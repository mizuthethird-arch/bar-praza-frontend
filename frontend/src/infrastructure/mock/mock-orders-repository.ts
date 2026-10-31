import type { OrdersRepository } from '../../application/ports'
import type { Order } from '../../domain/orders/order'

const orders: Order[] = [
  { id: 44, client: 'Pablo', pickupTime: '21:35', delayed: false, itemCount: 2, totalCents: 900, status: 'new' },
  { id: 43, client: 'Ana', pickupTime: '21:30', delayed: false, itemCount: 1, totalCents: 1400, status: 'new' },
  { id: 42, client: 'Marcos', pickupTime: '21:10', delayed: true, itemCount: 2, totalCents: 1600, status: 'preparing' },
  { id: 41, client: 'Lucía', pickupTime: '21:05', delayed: false, itemCount: 3, totalCents: 2300, status: 'ready' },
  { id: 40, client: 'Iria', pickupTime: '20:50', delayed: false, itemCount: 2, totalCents: 950, status: 'collected' },
]

export function createMockOrdersRepository(): OrdersRepository {
  return { listToday: async () => orders }
}
