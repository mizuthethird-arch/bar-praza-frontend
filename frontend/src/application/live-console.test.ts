import { describe, expect, it } from 'vitest'
import type { LiveEvent } from '../domain/live/live-console'
import { listLiveEvents, pollLiveEvents } from './live-console'
import type { LiveEventsRepository } from './ports'

const sample: LiveEvent = { id: 1, time: '20:40', kind: 'received', orderId: '#40', detail: 'Iria' }

const repository: LiveEventsRepository = {
  snapshot: async () => [sample],
  poll: async (afterId) => [{ ...sample, id: afterId + 1 }],
}

describe('live console use cases', () => {
  it('lists the events so far', async () => {
    expect(await listLiveEvents(repository)).toEqual([sample])
  })

  it('polls for events after the given id', async () => {
    expect(await pollLiveEvents(repository, 4)).toEqual([{ ...sample, id: 5 }])
  })
})
