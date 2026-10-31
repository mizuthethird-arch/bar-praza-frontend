import { describe, expect, it } from 'vitest'
import type { ScheduleOverview } from './schedule'
import { addClosure, pauseOrdering, removeClosure, resumeOrdering } from './schedule-changes'

const overview: ScheduleOverview = {
  status: { accepting: true, until: '23:30', queued: 2 },
  weekly: [],
  closures: [{ date: '2026-12-25', note: 'Navidad' }],
  rules: { minPrepMinutes: 20, lastOrderMinutesBeforeClose: 30, maxOrdersPerSlot: 4 },
  windows: [],
}

describe('schedule changes', () => {
  it('pauses ordering for the chosen minutes', () => {
    const result = pauseOrdering(overview, 30)

    expect(result.status).toEqual({ accepting: false, until: '23:30', queued: 2, pausedMinutes: 30 })
  })

  it('resumes ordering and forgets the pause', () => {
    const result = resumeOrdering(pauseOrdering(overview, 30))

    expect(result.status).toEqual({ accepting: true, until: '23:30', queued: 2 })
  })

  it('adds a closure without mutating the original', () => {
    const result = addClosure(overview, { date: '2027-01-01', note: 'Año nuevo' })

    expect(result.closures).toHaveLength(2)
    expect(overview.closures).toHaveLength(1)
  })

  it('removes a closure by date and note', () => {
    const result = removeClosure(overview, { date: '2026-12-25', note: 'Navidad' })

    expect(result.closures).toEqual([])
  })
})

describe('closure rules', () => {
  it('rejects dates that do not exist', () => {
    for (const date of ['', 'nope', '2027-02-30', '2027-13-01', '01-01-2027']) {
      expect(() => addClosure(overview, { date, note: 'x' }), date).toThrow()
    }
  })

  it('accepts a real date, including leap days', () => {
    expect(addClosure(overview, { date: '2028-02-29', note: 'Bisiesto' }).closures).toHaveLength(2)
  })

  it('rejects a closure that already exists', () => {
    expect(() => addClosure(overview, { date: '2026-12-25', note: 'Navidad' })).toThrow()
  })
})

describe('pause length', () => {
  it('must be a positive whole number of minutes', () => {
    for (const minutes of [0, -5, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => pauseOrdering(overview, minutes), String(minutes)).toThrow()
    }
  })
})
