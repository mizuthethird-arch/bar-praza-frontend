import { describe, expect, it } from 'vitest'
import { formatEuros, formatPrices, parseEuros } from './money'

describe('money formatting', () => {
  it('formats cents as euros with a decimal comma', () => {
    expect(formatEuros(7150)).toBe('71,50 €')
    expect(formatEuros(900)).toBe('9,00 €')
    expect(formatEuros(0)).toBe('0,00 €')
  })

  it('formats several prices with one euro sign', () => {
    expect(formatPrices([1100, 1900])).toBe('11,00 / 19,00 €')
  })

  it('formats a single price', () => {
    expect(formatPrices([450])).toBe('4,50 €')
  })
})

describe('parseEuros', () => {
  it('parses a price typed with a comma, with or without the euro sign', () => {
    expect(parseEuros('11,00 €')).toBe(1100)
    expect(parseEuros('9.5')).toBe(950)
    expect(parseEuros('x')).toBeNull()
  })
})

describe('parseEuros edge cases', () => {
  it('accepts whole numbers and up to two decimals', () => {
    expect(parseEuros('0')).toBe(0)
    expect(parseEuros(' 12 ')).toBe(1200)
    expect(parseEuros('9,5')).toBe(950)
  })

  it('rejects anything that is not a plain non-negative price', () => {
    for (const text of ['', ' ', '€', 'Infinity', '1e3', '0x10', '-5', '9,999', '1,2,3', '.5']) {
      expect(parseEuros(text), text).toBeNull()
    }
  })
})
