import { describe, expect, it } from 'vitest'
import {
  boardColumns,
  shiftTotal,
  cancelKitchenOrder,
  delayedMinutes,
  completeDelivery,
  markReady,
  startPreparing,
  type KitchenBoard,
  type KitchenOrder,
} from './kitchen'

const order = (overrides: Partial<KitchenOrder>): KitchenOrder => ({
  id: '#1',
  customer: 'Ana',
  pickupTime: '21:30',
  status: 'new',
  lines: [{ quantity: 1, name: 'Tortilla de patatas', variant: 'Entera' }],
  phone: '600 000 000',
  totalCents: 1400,
  ...overrides,
})

describe('delayedMinutes', () => {
  it('is how long past the pickup time an unfinished order is', () => {
    expect(delayedMinutes(order({ status: 'preparing', pickupTime: '21:10' }), '21:14')).toBe(4)
    expect(delayedMinutes(order({ status: 'new', pickupTime: '21:10' }), '21:14')).toBe(4)
  })

  it('is 0 before the pickup time, at it, and for a ready order', () => {
    expect(delayedMinutes(order({ pickupTime: '21:30' }), '21:14')).toBe(0)
    expect(delayedMinutes(order({ pickupTime: '21:14' }), '21:14')).toBe(0)
    expect(delayedMinutes(order({ status: 'ready', pickupTime: '21:05' }), '21:14')).toBe(0)
  })

  it('works across midnight', () => {
    expect(delayedMinutes(order({ pickupTime: '23:55' }), '00:05')).toBe(10)
  })
})

describe('boardColumns', () => {
  it('splits the board into new, in preparation and ready, each first in first out', () => {
    const { fresh, preparing, ready } = boardColumns(
      [
        order({ id: '#44', pickupTime: '21:35' }),
        order({ id: '#41', status: 'ready', pickupTime: '21:05' }),
        order({ id: '#43', pickupTime: '21:30' }),
        order({ id: '#42', status: 'preparing', pickupTime: '21:10' }),
        order({ id: '#39', status: 'ready', pickupTime: '21:20' }),
      ],
    )

    expect(fresh.map((o) => o.id)).toEqual(['#43', '#44'])
    expect(preparing.map((o) => o.id)).toEqual(['#42'])
    expect(ready.map((o) => o.id)).toEqual(['#39', '#41'])
  })

  it('keeps the arrival order even when a later order is due sooner', () => {
    const { fresh } = boardColumns(
      [order({ id: '#50', pickupTime: '21:50' }), order({ id: '#51', pickupTime: '21:20' })],
    )

    expect(fresh.map((o) => o.id)).toEqual(['#50', '#51'])
  })

  it('keeps the board order for ids without a number', () => {
    const { fresh } = boardColumns([order({ id: 'b', pickupTime: '21:20' }), order({ id: 'a', pickupTime: '21:10' })])

    expect(fresh.map((o) => o.id)).toEqual(['b', 'a'])
  })
})

describe('shiftTotal', () => {
  it('adds what was charged in the shift, in cents', () => {
    const delivered = [
      { ...order({ id: '#40', totalCents: 950 }), deliveredAt: '20:50' },
      { ...order({ id: '#38', totalCents: 1200 }), deliveredAt: '20:33' },
    ]

    expect(shiftTotal(delivered)).toBe(2150)
    expect(shiftTotal([])).toBe(0)
  })
})

describe('order flow', () => {
  const orders = [order({ id: '#1' }), order({ id: '#2', status: 'preparing' }), order({ id: '#3', status: 'ready' })]

  it('starts a new order', () => {
    expect(startPreparing(orders, '#1').find((o) => o.id === '#1')?.status).toBe('preparing')
  })

  it('marks a preparing order ready', () => {
    expect(markReady(orders, '#2').find((o) => o.id === '#2')?.status).toBe('ready')
  })

  it('removes a new order when it is cancelled', () => {
    expect(cancelKitchenOrder(orders, '#1').map((o) => o.id)).toEqual(['#2', '#3'])
  })

  it('refuses steps out of order', () => {
    expect(() => startPreparing(orders, '#2')).toThrow()
    expect(() => markReady(orders, '#1')).toThrow()
    expect(() => markReady(orders, '#3')).toThrow()
    expect(() => cancelKitchenOrder(orders, '#2')).toThrow()
    expect(() => cancelKitchenOrder(orders, '#3')).toThrow()
  })

  it('refuses an unknown order', () => {
    expect(() => startPreparing(orders, 'nope')).toThrow()
  })

  it('does not change the list it was given', () => {
    startPreparing(orders, '#1')
    expect(orders[0].status).toBe('new')
  })
})

describe('completeDelivery', () => {
  const board: KitchenBoard = {
    shiftOpenedAt: '19:02',
    orders: [order({ id: '#1' }), order({ id: '#3', status: 'ready', customer: 'Lucía', totalCents: 2300 })],
    delivered: [{ ...order({ id: '#0' }), deliveredAt: '20:00' }],
  }

  it('moves a ready order into the shift history with the time it was handed over, newest first', () => {
    const next = completeDelivery(board, '#3', '21:14')

    expect(next.orders.map((o) => o.id)).toEqual(['#1'])
    expect(next.delivered.map((d) => d.id)).toEqual(['#3', '#0'])
    expect(next.delivered[0]).toMatchObject({ customer: 'Lucía', totalCents: 2300, deliveredAt: '21:14' })
    expect(next.delivered[0]).not.toHaveProperty('status')
  })

  it('refuses an order that is not ready, or unknown', () => {
    expect(() => completeDelivery(board, '#1', '21:14')).toThrow()
    expect(() => completeDelivery(board, 'nope', '21:14')).toThrow()
  })

  it('does not change the board it was given', () => {
    completeDelivery(board, '#3', '21:14')
    expect(board.orders).toHaveLength(2)
    expect(board.delivered).toHaveLength(1)
  })
})
