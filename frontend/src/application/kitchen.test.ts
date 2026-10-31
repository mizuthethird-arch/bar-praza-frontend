import { describe, expect, it, vi } from 'vitest'
import { cancelKitchenOrderIn, deliverKitchenOrderIn, getKitchenBoard, markKitchenOrderReadyIn, startKitchenOrderIn } from './kitchen'
import type { KitchenRepository } from './ports'

describe('kitchen use cases', () => {
  it('sends one command per change and returns the new board', async () => {
    const board = { shiftOpenedAt: '19:02', orders: [], delivered: [] }
    const done = vi.fn().mockResolvedValue(board)
    const repo: KitchenRepository = { getBoard: done, start: done, markReady: done, deliver: done, cancel: done }

    expect(await getKitchenBoard(repo)).toBe(board)
    await startKitchenOrderIn(repo, '#1')
    await markKitchenOrderReadyIn(repo, '#2')
    await deliverKitchenOrderIn(repo, '#3')
    await cancelKitchenOrderIn(repo, '#4')

    expect(repo.start).toHaveBeenCalledWith('#1')
    expect(repo.markReady).toHaveBeenCalledWith('#2')
    expect(repo.deliver).toHaveBeenCalledWith('#3')
    expect(repo.cancel).toHaveBeenCalledWith('#4')
  })
})
