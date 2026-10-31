import { describe, expect, it } from 'vitest'
import { lastEventId, summarizeConsole, type LiveEvent } from './live-console'

const event = (overrides: Partial<LiveEvent>): LiveEvent => ({
  id: 1,
  time: '21:00',
  kind: 'received',
  orderId: '#40',
  detail: 'Iria · para llevar',
  ...overrides,
})

describe('summarizeConsole', () => {
  it('counts received, delayed and cancelled events', () => {
    const events = [
      event({ id: 1 }),
      event({ id: 2, kind: 'delayed' }),
      event({ id: 3, kind: 'cancelled' }),
      event({ id: 4, kind: 'preparing' }),
      event({ id: 5 }),
    ]

    expect(summarizeConsole(events)).toEqual({ received: 2, delayed: 1, cancelled: 1 })
  })
})

describe('lastEventId', () => {
  it('is 0 when there are no events', () => {
    expect(lastEventId([])).toBe(0)
  })

  it('is the highest id, whatever the order', () => {
    expect(lastEventId([event({ id: 7 }), event({ id: 3 })])).toBe(7)
  })
})
