import { describe, expect, it, vi } from 'vitest'
import { addClosureTo, pauseOrdersIn, removeClosureFrom, resumeOrdersIn } from './change-schedule'
import type { ScheduleRepository } from './ports'

function repo(): ScheduleRepository {
  const done = vi.fn().mockResolvedValue({})
  return { getOverview: vi.fn(), pause: done, resume: done, addClosure: done, removeClosure: done }
}

describe('change-schedule use cases', () => {
  it('sends a pause and a resume', async () => {
    const schedule = repo()

    await pauseOrdersIn(schedule, 15)
    await resumeOrdersIn(schedule)

    expect(schedule.pause).toHaveBeenCalledWith(15)
    expect(schedule.resume).toHaveBeenCalled()
  })

  it('refuses a pause that is not a positive whole number of minutes', async () => {
    const schedule = repo()

    for (const minutes of [0, -5, 1.5, Number.NaN]) {
      await expect(pauseOrdersIn(schedule, minutes), String(minutes)).rejects.toThrow()
    }
    expect(schedule.pause).not.toHaveBeenCalled()
  })

  it('sends a trimmed closure and removes by value', async () => {
    const schedule = repo()

    await addClosureTo(schedule, { date: '2027-01-01', note: ' Año nuevo ' })
    await removeClosureFrom(schedule, { date: '2026-12-25', note: 'Navidad' })

    expect(schedule.addClosure).toHaveBeenCalledWith({ date: '2027-01-01', note: 'Año nuevo' })
    expect(schedule.removeClosure).toHaveBeenCalledWith({ date: '2026-12-25', note: 'Navidad' })
  })

  it('refuses a closure without a note or with an invalid date', async () => {
    const schedule = repo()

    await expect(addClosureTo(schedule, { date: '2027-01-01', note: '  ' })).rejects.toThrow()
    await expect(addClosureTo(schedule, { date: '2027-02-30', note: 'X' })).rejects.toThrow()
    expect(schedule.addClosure).not.toHaveBeenCalled()
  })
})
