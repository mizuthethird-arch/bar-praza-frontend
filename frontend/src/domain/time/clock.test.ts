import { describe, expect, it } from 'vitest'
import { addMinutes, clockOf, minutesBetween, minutesOf } from './clock'

describe('clock', () => {
  it('formats a date as HH:mm with leading zeros', () => {
    expect(clockOf(new Date(2026, 9, 31, 7, 5))).toBe('07:05')
    expect(clockOf(new Date(2026, 9, 31, 21, 14))).toBe('21:14')
  })

  it('reads HH:mm as minutes since midnight', () => {
    expect(minutesOf('00:00')).toBe(0)
    expect(minutesOf('21:14')).toBe(1274)
  })

  it('adds minutes and wraps around midnight both ways', () => {
    expect(addMinutes('21:14', 16)).toBe('21:30')
    expect(addMinutes('23:50', 20)).toBe('00:10')
    expect(addMinutes('00:10', -20)).toBe('23:50')
  })

  it('measures the shortest signed distance, across midnight too', () => {
    expect(minutesBetween('21:14', '21:30')).toBe(16)
    expect(minutesBetween('21:14', '21:10')).toBe(-4)
    expect(minutesBetween('23:50', '00:10')).toBe(20)
    expect(minutesBetween('00:10', '23:50')).toBe(-20)
  })
})
