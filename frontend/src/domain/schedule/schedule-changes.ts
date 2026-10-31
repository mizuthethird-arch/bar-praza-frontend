import type { ScheduleOverview, SpecialClosure } from './schedule'

export const isPauseLength = (minutes: number) => Number.isInteger(minutes) && minutes > 0

export function pauseOrdering(overview: ScheduleOverview, minutes: number): ScheduleOverview {
  if (!isPauseLength(minutes)) throw new Error('A pause needs a positive whole number of minutes')
  return { ...overview, status: { ...overview.status, accepting: false, pausedMinutes: minutes } }
}

export function resumeOrdering(overview: ScheduleOverview): ScheduleOverview {
  const { pausedMinutes: _paused, ...status } = overview.status
  return { ...overview, status: { ...status, accepting: true } }
}

export function isIsoDate(text: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (!match) return false

  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function addClosure(overview: ScheduleOverview, closure: SpecialClosure): ScheduleOverview {
  if (!isIsoDate(closure.date)) throw new Error('A closure needs a valid date (YYYY-MM-DD)')
  if (overview.closures.some((c) => c.date === closure.date && c.note === closure.note)) {
    throw new Error('This closure already exists')
  }
  return { ...overview, closures: [...overview.closures, closure] }
}

export function removeClosure(overview: ScheduleOverview, closure: SpecialClosure): ScheduleOverview {
  return {
    ...overview,
    closures: overview.closures.filter((c) => c.date !== closure.date || c.note !== closure.note),
  }
}
