export type LiveEventKind = 'received' | 'preparing' | 'ready' | 'delayed' | 'cancelled'

export type LiveEvent = {
  id: number
  time: string
  kind: LiveEventKind
  orderId: string
  detail: string
}

export type ConsoleSummary = {
  received: number
  delayed: number
  cancelled: number
}

export function summarizeConsole(events: LiveEvent[]): ConsoleSummary {
  const count = (kind: LiveEventKind) => events.filter((event) => event.kind === kind).length
  return { received: count('received'), delayed: count('delayed'), cancelled: count('cancelled') }
}

export const lastEventId = (events: LiveEvent[]) => events.reduce((max, event) => Math.max(max, event.id), 0)
