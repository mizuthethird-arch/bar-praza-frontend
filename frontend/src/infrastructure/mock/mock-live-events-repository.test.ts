import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockLiveEventsRepository } from './mock-live-events-repository'

describe('mock live events', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts with four events', async () => {
    expect(await createMockLiveEventsRepository().snapshot()).toHaveLength(4)
  })

  it('delivers the next scripted event every five seconds, then stops', () => {
    const repo = createMockLiveEventsRepository()
    const onEvent = vi.fn()
    const stop = repo.watch(onEvent)

    vi.advanceTimersByTime(5000)
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ id: 5 }))
    vi.advanceTimersByTime(15000)
    expect(onEvent).toHaveBeenCalledTimes(4)
    expect(onEvent).toHaveBeenLastCalledWith(expect.objectContaining({ id: 8 }))

    vi.advanceTimersByTime(20000)
    expect(onEvent).toHaveBeenCalledTimes(4)
    stop()
  })

  it('stops delivering when the watch is stopped', () => {
    const repo = createMockLiveEventsRepository()
    const onEvent = vi.fn()

    repo.watch(onEvent)()
    vi.advanceTimersByTime(10000)

    expect(onEvent).not.toHaveBeenCalled()
  })
})
