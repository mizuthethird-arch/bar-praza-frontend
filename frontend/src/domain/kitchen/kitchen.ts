import { minutesBetween } from '../time/clock'

export type KitchenStatus = 'new' | 'preparing' | 'ready'

export type KitchenLine = {
  quantity: number
  name: string
  variant: string
  detail?: string
}

export type KitchenOrder = {
  id: string
  customer: string
  pickupTime: string
  status: KitchenStatus
  lines: KitchenLine[]
  note?: string
  phone: string
  totalCents: number
  paymentNote?: string
}

// An order handed over and paid during the shift; the history keeps it with the time.
export type DeliveredOrder = Omit<KitchenOrder, 'status'> & { deliveredAt: string }

export type KitchenBoard = {
  shiftOpenedAt: string
  orders: KitchenOrder[]
  // Everything delivered and paid in the current shift, newest first.
  delivered: DeliveredOrder[]
  // Set once "Cerrar turno" has been confirmed.
  shiftClosedAt?: string
}

// Records when the shift was closed. Closing it again keeps the first time.
export function closeShift(board: KitchenBoard, at: string): KitchenBoard {
  return board.shiftClosedAt ? board : { ...board, shiftClosedAt: at }
}

// Minutes past the pickup time of an order that is still not ready; 0 otherwise.
export function delayedMinutes(order: KitchenOrder, now: string): number {
  if (order.status === 'ready') return 0
  return Math.max(0, minutesBetween(order.pickupTime, now))
}

// The board's three live columns, each in pickup order. Delivered orders are not here.
export function boardColumns(orders: KitchenOrder[], now: string) {
  const byPickup = (a: KitchenOrder, b: KitchenOrder) =>
    minutesBetween(now, a.pickupTime) - minutesBetween(now, b.pickupTime)
  const withStatus = (status: KitchenStatus) => orders.filter((order) => order.status === status).sort(byPickup)

  return { fresh: withStatus('new'), preparing: withStatus('preparing'), ready: withStatus('ready') }
}

// What was charged in the shift, in cents.
export const shiftTotal = (delivered: DeliveredOrder[]) => delivered.reduce((sum, order) => sum + order.totalCents, 0)

function step(orders: KitchenOrder[], id: string, from: KitchenStatus, action: string) {
  const target = orders.find((order) => order.id === id)
  if (!target) throw new Error(`Unknown order ${id}`)
  if (target.status !== from) throw new Error(`Cannot ${action} an order that is ${target.status}`)
  return target
}

const withStatus = (orders: KitchenOrder[], id: string, status: KitchenStatus) =>
  orders.map((order) => (order.id === id ? { ...order, status } : order))

const without = (orders: KitchenOrder[], id: string) => orders.filter((order) => order.id !== id)

export function startPreparing(orders: KitchenOrder[], id: string): KitchenOrder[] {
  step(orders, id, 'new', 'start')
  return withStatus(orders, id, 'preparing')
}

export function markReady(orders: KitchenOrder[], id: string): KitchenOrder[] {
  step(orders, id, 'preparing', 'mark ready')
  return withStatus(orders, id, 'ready')
}

// Handing over a ready order takes it off the board and into the shift history.
export function completeDelivery(board: KitchenBoard, id: string, at: string): KitchenBoard {
  const { status: _status, ...order } = step(board.orders, id, 'ready', 'deliver')
  return {
    ...board,
    orders: without(board.orders, id),
    delivered: [{ ...order, deliveredAt: at }, ...board.delivered],
  }
}

// A cancelled order just leaves the board.
export function cancelKitchenOrder(orders: KitchenOrder[], id: string): KitchenOrder[] {
  step(orders, id, 'new', 'cancel')
  return without(orders, id)
}
