import { describe, expect, it } from 'vitest'
import { createMockLiveEventsRepository } from './mock-live-events-repository'

describe('mock live events', () => {
  it('starts with four events', async () => {
    expect(await createMockLiveEventsRepository().snapshot()).toHaveLength(4)
  })

  it('reveals one more event per poll, then stops', async () => {
    const repo = createMockLiveEventsRepository()

    expect((await repo.poll(4)).map((e) => e.id)).toEqual([5])
    expect((await repo.poll(5)).map((e) => e.id)).toEqual([6])
    for (let i = 0; i < 5; i++) await repo.poll(8)
    expect(await repo.poll(8)).toEqual([])
  })
})
