import type { ReportsRepository } from '../../application/ports'
import type { Report } from '../../domain/reports/report'

// Invented figures for the design, not the bar's.
const report: Report = {
  periodLabel: 'Últimos 7 días',
  salesCents: 81200,
  onTimePercent: 89,
  days: [
    { day: 'L', app: 2, venue: 3, closed: false },
    { day: 'M', app: 3, venue: 4, closed: false },
    { day: 'X', app: 0, venue: 0, closed: true },
    { day: 'J', app: 3, venue: 3, closed: false },
    { day: 'V', app: 6, venue: 6, closed: false },
    { day: 'S', app: 8, venue: 7, closed: false },
    { day: 'D', app: 4, venue: 5, closed: false },
  ],
  topDishes: [
    { name: 'Tortilla de patatas', count: 31 },
    { name: 'Croquetas de jamón', count: 24 },
    { name: 'Pulpo á feira', count: 18 },
    { name: 'Pimientos de Padrón', count: 15 },
    { name: 'Bocadillo de calamares', count: 11 },
  ],
  peaks: { lunch: '13:30–14:30', dinner: '21:00–22:00', delayedOrders: 6, delayedNote: 'casi todos el sábado' },
}

export function createMockReportsRepository(): ReportsRepository {
  return { getWeekly: async () => report }
}
