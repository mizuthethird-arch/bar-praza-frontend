import type { Channel, EntryStatus } from '../../../domain/orders/order-log'

export const channelLabel: Record<Channel, string> = { app: 'App', table: 'Mesa', bar: 'Barra' }

export const entryStatusLabel: Record<EntryStatus, string> = {
  new: 'Nuevo',
  open: 'Abierto',
  preparing: 'Preparando',
  ready: 'Listo',
  paid: 'Cobrado',
  collected: 'Recogido',
  cancelled: 'Cancelado',
}

export const entryStatusBadge: Partial<Record<EntryStatus, string>> = {
  new: 'bg-white text-black',
  open: 'bg-neutral-700 text-neutral-100',
  preparing: 'bg-neutral-700 text-neutral-100',
  ready: 'bg-emerald-950 text-emerald-300',
}
