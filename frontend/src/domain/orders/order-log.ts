import { normalizeForSearch } from '../text/search'

export type Channel = 'app' | 'table' | 'bar'
export type EntryStatus = 'new' | 'open' | 'preparing' | 'ready' | 'paid' | 'collected' | 'cancelled'

export type OrderLine = {
  quantity: number
  name: string
  variant: string
  totalCents: number
}

export type TimelineEvent = {
  time: string
  text: string
  alert?: boolean
}

export type OrderEntry = {
  id: string
  time: string
  customer: string
  channel: Channel
  totalCents: number
  status: EntryStatus
  phone?: string
  fulfilment?: string
  delayedMinutes?: number
  lines: OrderLine[]
  timeline: TimelineEvent[]
}

export type OrderFilter = {
  search: string
  channel: Channel | 'all'
  status: EntryStatus | 'all'
}

export function filterOrders(entries: OrderEntry[], { search, channel, status }: OrderFilter): OrderEntry[] {
  const query = normalizeForSearch(search.trim())
  return entries.filter(
    (entry) =>
      (channel === 'all' || entry.channel === channel) &&
      (status === 'all' || entry.status === status) &&
      (query === '' || normalizeForSearch(`${entry.id} ${entry.customer} ${entry.phone ?? ''}`).includes(query)),
  )
}

export const canCancel = (entry: OrderEntry) => !['paid', 'collected', 'cancelled'].includes(entry.status)

export function cancelOrder(entries: OrderEntry[], id: string): OrderEntry[] {
  return entries.map((entry) => (entry.id === id ? { ...entry, status: 'cancelled' } : entry))
}

export const entryToFocus = (entries: OrderEntry[]): OrderEntry | undefined =>
  entries.find((entry) => entry.delayedMinutes) ?? entries[0]
