import { describe, expect, it } from 'vitest'
import type { ScheduleOverview } from '../domain/schedule/schedule'
import { getScheduleOverview } from './get-schedule-overview'

const overview: ScheduleOverview = {
  status: { accepting: false, until: '00:00', queued: 0 },
  weekly: [{ day: 'Miércoles', hours: null }],
  closures: [{ date: '[Fecha]', note: 'Vacaciones' }],
  rules: { minPrepMinutes: 30, lastOrderMinutesBeforeClose: 15, maxOrdersPerSlot: 6 },
  windows: [],
}

describe('getScheduleOverview use case', () => {
  it('returns what the schedule repository holds', async () => {
    const result = await getScheduleOverview({ getOverview: async () => overview })

    expect(result).toEqual(overview)
  })
})
