import type { LiveEventsRepository } from './ports'

export const listLiveEvents = (events: LiveEventsRepository) => events.snapshot()

export const pollLiveEvents = (events: LiveEventsRepository, afterId: number) => events.poll(afterId)
