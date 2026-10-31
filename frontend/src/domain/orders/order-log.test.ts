import { describe, expect, it } from 'vitest'
import { canCancel, cancelOrder, entryToFocus, filterOrders, type OrderEntry } from './order-log'

const entry = (overrides: Partial<OrderEntry>): OrderEntry => ({
  id: '#1',
  time: '20:00',
  customer: 'Ana',
  channel: 'app',
  totalCents: 100,
  status: 'new',
  lines: [],
  timeline: [],
  ...overrides,
})

const entries = [
  entry({ id: '#44', customer: 'Pablo', phone: '600 000 004' }),
  entry({ id: 'B-12', customer: 'Mesa 4', channel: 'table', status: 'open' }),
  entry({ id: '#42', customer: 'Marcos', status: 'preparing', delayedMinutes: 4, phone: '600 000 002' }),
]
const all = { search: '', channel: 'all', status: 'all' } as const

describe('filterOrders', () => {
  it('returns everything without filters', () => {
    expect(filterOrders(entries, all)).toHaveLength(3)
  })

  it('searches by number, name or phone, ignoring case and accents', () => {
    expect(filterOrders(entries, { ...all, search: 'b-12' }).map((e) => e.id)).toEqual(['B-12'])
    expect(filterOrders(entries, { ...all, search: 'MARCOS' }).map((e) => e.id)).toEqual(['#42'])
    expect(filterOrders(entries, { ...all, search: '000 004' }).map((e) => e.id)).toEqual(['#44'])
  })

  it('filters by channel and status', () => {
    expect(filterOrders(entries, { ...all, channel: 'table' }).map((e) => e.id)).toEqual(['B-12'])
    expect(filterOrders(entries, { ...all, status: 'preparing' }).map((e) => e.id)).toEqual(['#42'])
  })
})

describe('order actions', () => {
  it('cancels only the chosen order', () => {
    const result = cancelOrder(entries, '#44')

    expect(result.find((e) => e.id === '#44')?.status).toBe('cancelled')
    expect(result.find((e) => e.id === '#42')?.status).toBe('preparing')
  })

  it('does not allow cancelling finished orders', () => {
    expect(canCancel(entry({ status: 'preparing' }))).toBe(true)
    for (const status of ['paid', 'collected', 'cancelled'] as const) {
      expect(canCancel(entry({ status }))).toBe(false)
    }
  })

  it('focuses the first delayed order, or the first one', () => {
    expect(entryToFocus(entries)?.id).toBe('#42')
    expect(entryToFocus([entries[0]])?.id).toBe('#44')
    expect(entryToFocus([])).toBeUndefined()
  })
})
