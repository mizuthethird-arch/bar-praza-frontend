import { describe, expect, it } from 'vitest'
import { formatQuantity, parseDecimal } from './quantity'

describe('quantity format', () => {
  it('formats with a decimal comma and one decimal at most', () => {
    expect(formatQuantity(3.5999999, 'kg')).toBe('3,6 kg')
    expect(formatQuantity(46, 'uds.')).toBe('46 uds.')
  })

  it('parses comma or dot decimals and rejects garbage', () => {
    expect(parseDecimal('3,5')).toBe(3.5)
    expect(parseDecimal(' 3.5 ')).toBe(3.5)
    expect(parseDecimal('abc')).toBeNull()
    expect(parseDecimal('')).toBeNull()
  })
})

describe('parseDecimal edge cases', () => {
  it('accepts plain non-negative numbers', () => {
    for (const [text, value] of [['0', 0], ['3', 3], ['0,25', 0.25], [' 3.5 ', 3.5]] as const) {
      expect(parseDecimal(text), text).toBe(value)
    }
  })

  it('rejects infinity, exponents, hex, negatives and malformed numbers', () => {
    for (const text of ['Infinity', '1e3', '0x1', '-1', '1,2,3', '3,', ' ']) {
      expect(parseDecimal(text), text).toBeNull()
    }
  })
})
