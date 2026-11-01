import { describe, expect, it, vi } from 'vitest'
import type { LiveEvent } from '../domain/live/live-console'
import { listLiveEvents, watchLiveEvents } from './live-console'
import type { LiveEventsRepository } from './ports'

const sample: LiveEvent = { id: 1, time: '20:40', kind: 'received', orderId: '#40', detail: 'Iria' }

describe('live console use cases', () => {
  it('lists the events so far', async () => {
    const repository: LiveEventsRepository = { snapshot: async () => [sample], watch: vi.fn() }

    expect(await listLiveEvents(repository)).toEqual([sample])
  })

  it('passes each event on to the watcher, and returns the stop function', () => {
    const stop = vi.fn()
    const repository: LiveEventsRepository = { snapshot: async () => [], watch: vi.fn(() => stop) }
    const onEvent = vi.fn()

    const done = watchLiveEvents(repository, onEvent)

    expect(repository.watch).toHaveBeenCalledWith(onEvent)
    done()
    expect(stop).toHaveBeenCalledTimes(1)
  })
})
