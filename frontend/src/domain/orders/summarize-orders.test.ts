import { describe, expect, it } from 'vitest'
import type { Order } from './order'
import { summarizeOrders } from './summarize-orders'

const order = (overrides: Partial<Order> = {}): Order => ({
  id: 1,
  client: 'Ana',
  pickupTime: '21:00',
  delayed: false,
  itemCount: 1,
  totalCents: 1000,
  status: 'new',
  ...overrides,
})

describe('summarizeOrders', () => {
  it('returns zeros when there are no orders', () => {
    expect(summarizeOrders([])).toEqual({
      ordersToday: 0,
      newOrders: 0,
      inProgressOrders: 0,
      salesCents: 0,
      averageTicketCents: 0,
    })
  })

  it('counts new orders apart from orders in progress (preparing or ready)', () => {
    const summary = summarizeOrders([
      order({ status: 'new' }),
      order({ status: 'preparing' }),
      order({ status: 'ready' }),
      order({ status: 'collected' }),
    ])

    expect(summary.ordersToday).toBe(4)
    expect(summary.newOrders).toBe(1)
    expect(summary.inProgressOrders).toBe(2)
  })

  it('sums sales over every order, collected ones included', () => {
    const summary = summarizeOrders([
      order({ totalCents: 900 }),
      order({ totalCents: 1400, status: 'collected' }),
    ])

    expect(summary.salesCents).toBe(2300)
  })

  it('rounds the average ticket to the nearest cent', () => {
    const summary = summarizeOrders([
      order({ totalCents: 1000 }),
      order({ totalCents: 1000 }),
      order({ totalCents: 1001 }),
    ])

    expect(summary.averageTicketCents).toBe(1000)
  })
})
