import { describe, expect, it, vi } from 'vitest'
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

describe('mock kitchen board watch', () => {
  it('tells the watcher about each change made in this tab, until it stops', async () => {
    const repo = createMockKitchenRepository()
    const onBoard = vi.fn()
    const stop = repo.watch(onBoard)

    await repo.createTestOrder()
    expect(onBoard).toHaveBeenCalledTimes(1)
    expect(onBoard.mock.calls[0][0].orders.map((order: { id: string }) => order.id)).toContain('#45')

    stop()
    await repo.createTestOrder()
    expect(onBoard).toHaveBeenCalledTimes(1)
  })

  it('tells the watcher when another tab of the browser saves the board, and stops listening after', () => {
    const repo = createMockKitchenRepository({ storage: sharedStorage() })
    const onBoard = vi.fn()
    const stop = repo.watch(onBoard)
    const saved = { shiftOpenedAt: '19:02', orders: [], delivered: [] }
    const fromOtherTab = () =>
      window.dispatchEvent(new StorageEvent('storage', { key: 'barpraza.kitchenBoard', newValue: JSON.stringify(saved) }))

    fromOtherTab()
    expect(onBoard).toHaveBeenCalledWith(saved)

    stop()
    fromOtherTab()
    expect(onBoard).toHaveBeenCalledTimes(1)
  })

  it('ignores storage events for other keys', () => {
    const repo = createMockKitchenRepository({ storage: sharedStorage() })
    const onBoard = vi.fn()
    repo.watch(onBoard)

    window.dispatchEvent(new StorageEvent('storage', { key: 'something-else', newValue: '{}' }))

    expect(onBoard).not.toHaveBeenCalled()
  })
})

