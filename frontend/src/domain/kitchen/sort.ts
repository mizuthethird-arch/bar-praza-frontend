import { minutesBetween } from '../time/clock'
import type { DeliveredOrder, KitchenOrder } from './kitchen'

// How the delivered list can be ordered: by the most recent delivery, or by the largest amount.
export type DeliverySort = 'delivery' | 'amount'

// The order number is given when an order comes in, so a lower number arrived first. An id without
// a number has no arrival to compare, so it keeps its place.
export const arrivalOf = (order: { id: string }) => Number(/^#?(\d+)$/.exec(order.id)?.[1] ?? Number.MAX_SAFE_INTEGER)

// The order a live column shows. Cards the person has placed by hand keep the places they were given,
// in that order. Any other order joins below them, first in first out.
export function arrangeColumn(orders: KitchenOrder[], placed: string[]): KitchenOrder[] {
  const byId = new Map(orders.map((order) => [order.id, order]))
  const first = placed.flatMap((id) => byId.get(id) ?? [])
  const placedIds = new Set(placed)
  const rest = orders.filter((order) => !placedIds.has(order.id)).sort((a, b) => arrivalOf(a) - arrivalOf(b))
  return [...first, ...rest]
}

// Delivered orders in the order chosen: the most recent delivery first, or the largest amount first.
export function sortDelivered(orders: DeliveredOrder[], by: DeliverySort, now: string): DeliveredOrder[] {
  if (by === 'amount') return [...orders].sort((a, b) => b.totalCents - a.totalCents)
  return [...orders].sort((a, b) => minutesBetween(a.deliveredAt, now) - minutesBetween(b.deliveredAt, now))
}
