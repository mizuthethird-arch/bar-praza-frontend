import type { ScheduleOverview } from '../domain/schedule/schedule'
import type { ScheduleRepository } from './ports'

export function getScheduleOverview(schedule: Pick<ScheduleRepository, 'getOverview'>): Promise<ScheduleOverview> {
  return schedule.getOverview()
}
