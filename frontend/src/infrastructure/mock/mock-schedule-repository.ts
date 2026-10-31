import type { ScheduleRepository } from '../../application/ports'
import type { ScheduleOverview } from '../../domain/schedule/schedule'
import { addClosure, pauseOrdering, removeClosure, resumeOrdering } from '../../domain/schedule/schedule-changes'
import { memoryStore } from './memory-store'

// Hours are examples, not the bar's real schedule.
const initial: ScheduleOverview = {
  status: { accepting: true, until: '23:30', queued: 2 },
  weekly: [
    { day: 'Lunes', hours: { opensAt: '12:00', closesAt: '00:00' } },
    { day: 'Martes', hours: { opensAt: '12:00', closesAt: '00:00' } },
    { day: 'Miércoles', hours: null },
    { day: 'Jueves', hours: { opensAt: '12:00', closesAt: '00:00' } },
    { day: 'Viernes', hours: { opensAt: '12:00', closesAt: '01:30' } },
    { day: 'Sábado', hours: { opensAt: '11:00', closesAt: '01:30' } },
    { day: 'Domingo', hours: { opensAt: '11:00', closesAt: '17:00' } },
  ],
  closures: [
    { date: '2026-11-16', note: 'Vacaciones' },
    { date: '2026-12-08', note: 'Fiestas del pueblo, abre a las 18:00' },
  ],
  rules: { minPrepMinutes: 20, lastOrderMinutesBeforeClose: 30, maxOrdersPerSlot: 4 },
  windows: [
    { days: 'Lun–Jue', hours: 'Por definir' },
    { days: 'Vie–Sáb', hours: 'Por definir' },
    { days: 'Domingo', hours: 'Por definir' },
  ],
}

export function createMockScheduleRepository(): ScheduleRepository {
  const store = memoryStore(initial)
  return {
    getOverview: store.read,
    pause: (minutes) => store.change((overview) => pauseOrdering(overview, minutes)),
    resume: () => store.change(resumeOrdering),
    addClosure: (closure) => store.change((overview) => addClosure(overview, closure)),
    removeClosure: (closure) => store.change((overview) => removeClosure(overview, closure)),
  }
}
