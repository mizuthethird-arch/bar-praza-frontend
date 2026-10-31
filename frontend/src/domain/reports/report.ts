export type DayOrders = {
  day: string
  app: number
  venue: number
  closed: boolean
}

export type TopDish = {
  name: string
  count: number
}

export type Report = {
  periodLabel: string
  salesCents: number
  onTimePercent: number
  days: DayOrders[]
  topDishes: TopDish[]
  peaks: { lunch: string; dinner: string; delayedOrders: number; delayedNote: string }
}

export const dayTotal = (day: DayOrders) => day.app + day.venue

export const totalOrders = (report: Report) => report.days.reduce((sum, day) => sum + dayTotal(day), 0)
