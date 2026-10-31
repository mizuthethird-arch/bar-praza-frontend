import { describe, expect, it } from 'vitest'
import { dayTotal, totalOrders, type Report } from './report'

const report: Report = {
  periodLabel: 'Últimos 7 días',
  salesCents: 81200,
  onTimePercent: 89,
  days: [
    { day: 'L', app: 2, venue: 3, closed: false },
    { day: 'X', app: 0, venue: 0, closed: true },
  ],
  topDishes: [],
  peaks: { lunch: '13:30–14:30', dinner: '21:00–22:00', delayedOrders: 6, delayedNote: 'casi todos el sábado' },
}

describe('report', () => {
  it('adds app and venue orders per day', () => {
    expect(dayTotal(report.days[0])).toBe(5)
  })

  it('totals the orders of the period', () => {
    expect(totalOrders(report)).toBe(5)
  })
})
