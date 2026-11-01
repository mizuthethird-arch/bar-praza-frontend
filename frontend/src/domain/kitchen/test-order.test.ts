import { describe, expect, it } from 'vitest'
import { addOrder, nextOrderId, type KitchenBoard, type KitchenOrder } from './kitchen'

const order = (id: string): KitchenOrder => ({
  id, customer: 'Ana', pickupTime: '21:00', status: 'new', phone: '600 000 000', totalCents: 500,
  lines: [{ quantity: 1, name: 'Agua', variant: '' }],
})
const board = (ids: string[], delivered: string[] = []): KitchenBoard => ({
  shiftOpenedAt: '19:02',
  orders: ids.map(order),
  delivered: delivered.map((id) => ({ ...order(id), deliveredAt: '20:00' })),
})

describe('nextOrderId', () => {
  it('starts at #1 on an empty board', () => {
    expect(nextOrderId(board([]))).toBe('#1')
  })

  it('takes the number after the highest one in use, counting delivered orders too', () => {
    expect(nextOrderId(board(['#41', '#44', '#42'], ['#40', '#50']))).toBe('#51')
  })

  it('ignores ids that are not a plain number', () => {
    expect(nextOrderId(board(['B-12', '#7']))).toBe('#8')
  })
})

describe('addOrder', () => {
  it('appends the order and leaves the rest of the board as it was', () => {
    const before = board(['#1'])

    const after = addOrder(before, order('#2'))

    expect(after.orders.map((o) => o.id)).toEqual(['#1', '#2'])
    expect(after.shiftOpenedAt).toBe('19:02')
    expect(before.orders).toHaveLength(1)
  })
})
