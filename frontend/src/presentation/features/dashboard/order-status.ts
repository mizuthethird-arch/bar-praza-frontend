import type { OrderStatus } from '../../../domain/orders/order'

export const orderStatusLabel: Record<OrderStatus, string> = {
  new: 'Nuevo',
  preparing: 'Preparando',
  ready: 'Listo',
  collected: 'Recogido',
}

export const orderStatusBadge: Record<Exclude<OrderStatus, 'collected'>, string> = {
  new: 'bg-white text-black',
  preparing: 'bg-neutral-700 text-neutral-100',
  ready: 'bg-emerald-950 text-emerald-300',
}
