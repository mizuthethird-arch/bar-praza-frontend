import { describe, expect, it } from 'vitest'
import type { DeliveredOrder, KitchenOrder } from './kitchen'
import { arrangeColumn, sortDelivered } from './sort'

const order = (id: string, totalCents = 500): KitchenOrder => ({
  id, customer: 'Ana', pickupTime: '21:00', status: 'new', phone: '600 000 000', totalCents,
  lines: [{ quantity: 1, name: 'Agua', variant: '' }],
})
const delivered = (id: string, deliveredAt: string, totalCents: number): DeliveredOrder => ({
  id, customer: 'Ana', pickupTime: '20:00', phone: '600 000 000', totalCents, deliveredAt, lines: [{ quantity: 1, name: 'Agua', variant: '' }],
})

describe('arrangeColumn', () => {
  it('shows new orders first in first out when nothing has been placed by hand', () => {
    expect(arrangeColumn([order('#50'), order('#32'), order('#49')], []).map((o) => o.id)).toEqual(['#32', '#49', '#50'])
  })

  it('keeps the places the person gave, and puts a new order below them', () => {
    const board = [order('#32'), order('#49'), order('#50')]
    // #49 was dragged to the top, then #32 under it.
    expect(arrangeColumn(board, ['#49', '#32', '#50']).map((o) => o.id)).toEqual(['#49', '#32', '#50'])

    const withNew = [...board, order('#51')]
    expect(arrangeColumn(withNew, ['#49', '#32', '#50']).map((o) => o.id)).toEqual(['#49', '#32', '#50', '#51'])
  })

  it('drops a placed id whose order has left the column', () => {
    expect(arrangeColumn([order('#32')], ['#49', '#32']).map((o) => o.id)).toEqual(['#32'])
  })

  it('leaves the list it was given as it was', () => {
    const board = [order('#50'), order('#32')]
    arrangeColumn(board, ['#50', '#32'])
    expect(board.map((o) => o.id)).toEqual(['#50', '#32'])
  })
})

describe('sortDelivered', () => {
  const shift = [delivered('#30', '20:10', 1000), delivered('#31', '21:05', 300), delivered('#32', '20:50', 2000)]

  it('shows the most recent delivery first', () => {
    expect(sortDelivered(shift, 'delivery', '21:10').map((o) => o.id)).toEqual(['#31', '#32', '#30'])
  })

  it('shows the largest amount first', () => {
    expect(sortDelivered(shift, 'amount', '21:10').map((o) => o.id)).toEqual(['#32', '#30', '#31'])
  })
})
