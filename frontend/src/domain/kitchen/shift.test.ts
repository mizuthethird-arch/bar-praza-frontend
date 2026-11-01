import { describe, expect, it } from 'vitest'
import { closeShift, type KitchenBoard } from './kitchen'

const board: KitchenBoard = { shiftOpenedAt: '19:02', orders: [], delivered: [] }

describe('closeShift', () => {
  it('records when the shift was closed and keeps the rest of the board', () => {
    const closed = closeShift(board, '23:40')

    expect(closed.shiftClosedAt).toBe('23:40')
    expect(closed.shiftOpenedAt).toBe('19:02')
  })

  it('keeps the first closing time when the shift is closed again', () => {
    const once = closeShift(board, '23:40')

    expect(closeShift(once, '23:55').shiftClosedAt).toBe('23:40')
  })
})
