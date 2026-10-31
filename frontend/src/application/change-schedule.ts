import type { SpecialClosure } from '../domain/schedule/schedule'
import { isIsoDate, isPauseLength } from '../domain/schedule/schedule-changes'
import type { ScheduleRepository } from './ports'

export async function pauseOrdersIn(schedule: ScheduleRepository, minutes: number) {
  if (!isPauseLength(minutes)) throw new Error('A pause needs a positive whole number of minutes')
  return schedule.pause(minutes)
}

export const resumeOrdersIn = (schedule: ScheduleRepository) => schedule.resume()

export async function addClosureTo(schedule: ScheduleRepository, closure: SpecialClosure) {
  if (closure.note.trim() === '') throw new Error('A closure needs a reason')
  if (!isIsoDate(closure.date)) throw new Error('A closure needs a valid date (YYYY-MM-DD)')
  return schedule.addClosure({ ...closure, note: closure.note.trim() })
}

export const removeClosureFrom = (schedule: ScheduleRepository, closure: SpecialClosure) =>
  schedule.removeClosure(closure)
