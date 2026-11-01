import type { LiveEventsRepository } from './ports'

export const listLiveEvents = (events: LiveEventsRepository) => events.snapshot()

export const watchLiveEvents = (events: LiveEventsRepository, onEvent: Parameters<LiveEventsRepository['watch']>[0]) =>
  events.watch(onEvent)
