import type { LiveEventsRepository } from '../../application/ports'
import type { LiveEvent } from '../../domain/live/live-console'

// Scripted day: the first four events are there at load, then one more arrives every few seconds.
const script: LiveEvent[] = [
  { id: 1, time: '20:40', kind: 'received', orderId: '#40', detail: 'Iria · para llevar' },
  { id: 2, time: '20:44', kind: 'received', orderId: '#41', detail: 'Lucía · para llevar' },
  { id: 3, time: '20:48', kind: 'received', orderId: '#42', detail: 'Marcos · para llevar' },
  { id: 4, time: '20:50', kind: 'preparing', orderId: '#40', detail: 'Preparando · [Uxía], consola' },
  { id: 5, time: '21:00', kind: 'ready', orderId: '#41', detail: 'Listo para recoger' },
  { id: 6, time: '21:05', kind: 'delayed', orderId: '#42', detail: 'Hora de recogida superada' },
  { id: 7, time: '21:10', kind: 'cancelled', orderId: '#39', detail: 'Cancelado por el cliente' },
  { id: 8, time: '21:12', kind: 'received', orderId: '#44', detail: 'Pablo · para llevar' },
]

// The demo stands in for the server's push: the next scripted event arrives every five seconds.
const EVENT_EVERY_MS = 5000

export function createMockLiveEventsRepository(): LiveEventsRepository {
  let revealed = 4

  return {
    snapshot: async () => script.slice(0, revealed),
    watch: (onEvent) => {
      const timer = window.setInterval(() => {
        if (revealed >= script.length) return
        onEvent(script[revealed])
        revealed += 1
      }, EVENT_EVERY_MS)
      return () => window.clearInterval(timer)
    },
  }
}
