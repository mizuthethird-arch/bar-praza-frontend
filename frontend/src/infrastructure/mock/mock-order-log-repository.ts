import type { OrderLogRepository } from '../../application/ports'
import { canCancel, cancelOrder, type OrderEntry, type OrderLine } from '../../domain/orders/order-log'
import { memoryStore } from './memory-store'

const line = (quantity: number, name: string, variant: string, totalCents: number): OrderLine => ({
  quantity,
  name,
  variant,
  totalCents,
})

const initial: OrderEntry[] = [
  {
    id: '#44', time: '21:35', customer: 'Pablo', channel: 'app', totalCents: 900, status: 'new',
    phone: '600 000 004', fulfilment: 'Para llevar · recoge 21:35 · paga al recoger',
    lines: [line(1, 'Croquetas de jamón', 'Ración', 900)],
    timeline: [{ time: '21:35', text: 'Recibido por la app' }],
  },
  {
    id: 'B-12', time: '21:16', customer: 'Mesa 4', channel: 'table', totalCents: 2100, status: 'open',
    fulfilment: 'En mesa',
    lines: [
      line(1, 'Pulpo á feira', 'Media ración', 1100),
      line(1, 'Pimientos de Padrón', 'Ración', 700),
      line(1, 'Tortilla de patatas', 'Pincho', 300),
    ],
    timeline: [{ time: '21:16', text: 'Mesa abierta' }],
  },
  {
    id: '#42', time: '21:10', customer: 'Marcos', channel: 'app', totalCents: 1600, status: 'preparing',
    phone: '600 000 002', fulfilment: 'Para llevar · recoge 21:10 · paga al recoger', delayedMinutes: 4,
    lines: [line(1, 'Croquetas de jamón', 'Ración', 900), line(1, 'Pimientos de Padrón', 'Ración', 700)],
    timeline: [
      { time: '20:48', text: 'Recibido por la app' },
      { time: '20:50', text: 'Preparando · [Uxía], consola' },
      { time: '21:10', text: 'Hora de recogida superada', alert: true },
    ],
  },
  {
    id: '#41', time: '21:05', customer: 'Lucía', channel: 'app', totalCents: 2300, status: 'ready',
    phone: '600 000 000', fulfilment: 'Para llevar · recoge 21:05 · paga al recoger',
    lines: [
      line(1, 'Pulpo á feira', 'Media ración', 1100),
      line(1, 'Croquetas de jamón', 'Ración', 900),
      line(1, 'Tortilla de patatas', 'Pincho', 300),
    ],
    timeline: [
      { time: '20:40', text: 'Recibido por la app' },
      { time: '21:00', text: 'Listo para recoger' },
    ],
  },
  {
    id: 'B-11', time: '20:58', customer: 'Barra · Xosé', channel: 'bar', totalCents: 1300, status: 'paid',
    fulfilment: 'En barra',
    lines: [line(1, 'Raxo con patatas', 'Ración', 1300)],
    timeline: [{ time: '20:58', text: 'Cobrado en barra' }],
  },
  {
    id: '#40', time: '20:50', customer: 'Iria', channel: 'app', totalCents: 950, status: 'collected',
    phone: '600 000 005', fulfilment: 'Para llevar · recoge 20:50 · pagado',
    lines: [line(1, 'Raxo con patatas', 'Media', 800), line(1, 'Agua', '50 cl', 150)],
    timeline: [
      { time: '20:20', text: 'Recibido por la app' },
      { time: '20:50', text: 'Recogido' },
    ],
  },
  {
    id: '#39', time: '20:31', customer: 'Brais', channel: 'app', totalCents: 700, status: 'cancelled',
    phone: '600 000 006', fulfilment: 'Para llevar · recoge 20:31',
    lines: [line(1, 'Pimientos de Padrón', 'Ración', 700)],
    timeline: [
      { time: '20:10', text: 'Recibido por la app' },
      { time: '20:15', text: 'Cancelado' },
    ],
  },
]

export function createMockOrderLogRepository(): OrderLogRepository {
  const store = memoryStore(initial)
  return {
    list: store.read,
    cancel: (id) =>
      store.change((entries) => {
        const target = entries.find((entry) => entry.id === id)
        if (!target || !canCancel(target)) throw new Error('This order cannot be cancelled')
        return cancelOrder(entries, id)
      }),
  }
}
