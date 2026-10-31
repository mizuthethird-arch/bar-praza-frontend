import { describe, expect, it } from 'vitest'
import { createMockKitchenRepository } from './mock-kitchen-repository'

// 21:14 on the day of the demo.
const at = new Date(2026, 9, 31, 21, 14)
const repo = () => createMockKitchenRepository({ now: () => at })

describe('mock kitchen repository', () => {
  it('seeds the evening on the design, with times relative to now', async () => {
    const { shiftOpenedAt, orders } = await repo().getBoard()

    expect(shiftOpenedAt).toBe('19:02')
    const byId = Object.fromEntries(orders.map((o) => [o.id, o]))
    expect(Object.keys(byId).sort()).toEqual(['#41', '#42', '#43', '#44'])
    expect(byId['#43']).toMatchObject({ customer: 'Ana', status: 'new', pickupTime: '21:30', note: 'sin cebolla', totalCents: 1400 })
    expect(byId['#44']).toMatchObject({ customer: 'Pablo', status: 'new', pickupTime: '21:35' })
    expect(byId['#42']).toMatchObject({ customer: 'Marcos', status: 'preparing', pickupTime: '21:10' })
    expect(byId['#41']).toMatchObject({ customer: 'Lucía', status: 'ready', pickupTime: '21:05', totalCents: 2300 })
  })

  it('starts the shift history with what was already handed over, newest first', async () => {
    const { delivered } = await repo().getBoard()

    expect(delivered.map((d) => [d.id, d.deliveredAt])).toEqual([['#40', '20:50'], ['#38', '20:33']])
  })

  it('runs an order through the flow', async () => {
    const kitchen = repo()

    expect((await kitchen.start('#43')).orders.find((o) => o.id === '#43')?.status).toBe('preparing')
    expect((await kitchen.markReady('#43')).orders.find((o) => o.id === '#43')?.status).toBe('ready')
    const delivered = await kitchen.deliver('#43')
    expect(delivered.orders.some((o) => o.id === '#43')).toBe(false)
    expect(delivered.delivered[0]).toMatchObject({ id: '#43', customer: 'Ana', deliveredAt: '21:14', totalCents: 1400 })
    expect((await kitchen.cancel('#44')).orders.some((o) => o.id === '#44')).toBe(false)
  })

  it('enforces the rules on its side', async () => {
    const kitchen = repo()

    await expect(kitchen.start('#42')).rejects.toThrow()
    await expect(kitchen.deliver('#43')).rejects.toThrow()
    await expect(kitchen.deliver('#41').then(() => kitchen.deliver('#41'))).rejects.toThrow()
    await expect(kitchen.cancel('#41')).rejects.toThrow()
    await expect(kitchen.start('nope')).rejects.toThrow()
  })

  it('keeps both changes when two devices write at once', async () => {
    const kitchen = repo()

    await Promise.all([kitchen.start('#43'), kitchen.start('#44')])

    const { orders } = await kitchen.getBoard()
    expect(orders.filter((o) => o.status === 'preparing').map((o) => o.id).sort()).toEqual(['#42', '#43', '#44'])
  })
})
