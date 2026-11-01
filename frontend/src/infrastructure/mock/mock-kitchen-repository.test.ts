import { describe, expect, it } from 'vitest'
import { createMockKitchenRepository } from './mock-kitchen-repository'

function sharedStorage() {
  const map = new Map<string, string>()
  return { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => void map.set(key, value) }
}

describe('mock kitchen board', () => {
  it('adds a test order as a new order with the next number, which another tab sees', async () => {
    const storage = sharedStorage()
    const tabA = createMockKitchenRepository({ storage })
    const tabB = createMockKitchenRepository({ storage })

    const created = await tabA.createTestOrder()
    const added = created.orders.find((order) => order.id === '#45')

    expect(added).toMatchObject({ customer: 'Prueba', status: 'new', totalCents: 1000 })
    expect((await tabB.getBoard()).orders.map((order) => order.id)).toContain('#45')
  })

  it('numbers each test order after the one before', async () => {
    const repo = createMockKitchenRepository()

    await repo.createTestOrder()
    const board = await repo.createTestOrder()

    expect(board.orders.map((order) => order.id)).toEqual(expect.arrayContaining(['#45', '#46']))
  })

  it('goes back to the first board when the test orders are cleared', async () => {
    const storage = sharedStorage()
    const repo = createMockKitchenRepository({ storage })
    const first = (await repo.getBoard()).orders.map((order) => order.id)

    await repo.createTestOrder()
    const cleared = await repo.reset()

    expect(cleared.orders.map((order) => order.id)).toEqual(first)
  })
})
