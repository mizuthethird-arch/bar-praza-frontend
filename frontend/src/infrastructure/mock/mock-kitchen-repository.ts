import type { KitchenRepository } from '../../application/ports'
import {
  cancelKitchenOrder,
  completeDelivery,
  markReady,
  startPreparing,
  type DeliveredOrder,
  type KitchenBoard,
  type KitchenOrder,
} from '../../domain/kitchen/kitchen'
import { addMinutes, clockOf } from '../../domain/time/clock'
import { memoryStore } from './memory-store'

type Options = { now?: () => Date }

// Pickup times are set relative to the moment the mock is built, so the board always
// looks like the evening on the design (21:14): two orders ahead of time, one late, one ready.
function seed(now: Date): KitchenBoard {
  const at = (minutes: number) => addMinutes(clockOf(now), minutes)
  const delivered = (order: Omit<DeliveredOrder, 'deliveredAt'>, minutes: number): DeliveredOrder => ({
    ...order,
    deliveredAt: at(minutes),
  })

  return {
    shiftOpenedAt: at(-132),
    orders: [
      {
        id: '#43', customer: 'Ana', pickupTime: at(16), status: 'new', phone: '600 000 000', totalCents: 1400,
        paymentNote: 'paga al recoger', note: 'sin cebolla',
        lines: [{ quantity: 1, name: 'Tortilla de patatas', variant: 'Entera' }],
      },
      {
        id: '#44', customer: 'Pablo', pickupTime: at(21), status: 'new', phone: '600 000 001', totalCents: 900,
        paymentNote: 'paga al recoger',
        lines: [
          { quantity: 1, name: 'Bocadillo de calamares', variant: '' },
          { quantity: 1, name: 'Refresco', variant: '33 cl' },
        ],
      },
      {
        id: '#42', customer: 'Marcos', pickupTime: at(-4), status: 'preparing', phone: '600 000 002', totalCents: 1600,
        lines: [
          { quantity: 1, name: 'Croquetas de jamón', variant: 'Ración', detail: '8 uds.' },
          { quantity: 1, name: 'Pimientos de Padrón', variant: 'Ración' },
        ],
      },
      {
        id: '#41', customer: 'Lucía', pickupTime: at(-9), status: 'ready', phone: '600 000 003', totalCents: 2300,
        paymentNote: 'cobrar al entregar',
        lines: [
          { quantity: 1, name: 'Pulpo á feira', variant: 'Ración' },
          { quantity: 2, name: 'Cerveza', variant: '33 cl' },
        ],
      },
    ],
    delivered: [
      delivered(
        {
          id: '#40', customer: 'Iria', pickupTime: at(-30), phone: '600 000 005', totalCents: 950,
          lines: [
            { quantity: 1, name: 'Raxo con patatas', variant: 'Media' },
            { quantity: 1, name: 'Agua', variant: '50 cl' },
          ],
        },
        -24,
      ),
      delivered(
        {
          id: '#38', customer: 'Xoán', pickupTime: at(-41), phone: '600 000 007', totalCents: 1200,
          lines: [{ quantity: 1, name: 'Tortilla de patatas', variant: 'Pincho' }, { quantity: 3, name: 'Café', variant: 'Taza' }],
        },
        -41,
      ),
    ],
  }
}

export function createMockKitchenRepository({ now = () => new Date() }: Options = {}): KitchenRepository {
  const store = memoryStore(seed(now()))
  const change = (apply: (orders: KitchenOrder[]) => KitchenOrder[]) =>
    store.change((board) => ({ ...board, orders: apply(board.orders) }))

  return {
    getBoard: store.read,
    start: (id) => change((orders) => startPreparing(orders, id)),
    markReady: (id) => change((orders) => markReady(orders, id)),
    deliver: (id) => store.change((board) => completeDelivery(board, id, clockOf(now()))),
    cancel: (id) => change((orders) => cancelKitchenOrder(orders, id)),
  }
}
