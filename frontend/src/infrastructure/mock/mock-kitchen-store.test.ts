import { describe, expect, it, vi } from 'vitest'
import { kitchenStore } from './mock-kitchen-store'

// A storage that two tabs could share: the same map is passed to both stores.
function sharedStorage() {
  const map = new Map<string, string>()
  return { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => void map.set(key, value) }
}

const seed = () => ({ count: 1 })

describe('kitchen store kept in browser storage', () => {
  it('seeds the board once, and every tab that shares the storage reads the same board', async () => {
    const storage = sharedStorage()
    const tabA = kitchenStore(storage, seed)
    const tabB = kitchenStore(storage, () => ({ count: 99 }))

    await tabA.change((board) => ({ count: board.count + 1 }))

    expect(await tabB.read()).toEqual({ count: 2 })
  })

  it('keeps working in memory when the storage refuses writes', async () => {
    const broken = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
    const store = kitchenStore(broken, seed)

    await store.change((board) => ({ count: board.count + 1 }))

    expect(await store.read()).toEqual({ count: 2 })
  })

  it('replaces unreadable saved data with a fresh seed', async () => {
    const storage = { getItem: () => '{not json', setItem: vi.fn() }
    const store = kitchenStore(storage, seed)

    expect(await store.read()).toEqual({ count: 1 })
    expect(storage.setItem).toHaveBeenCalled()
  })

  it('works without any storage, in memory only', async () => {
    const store = kitchenStore(undefined, seed)

    await store.change((board) => ({ count: board.count + 5 }))

    expect(await store.read()).toEqual({ count: 6 })
  })
})
