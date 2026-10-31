import { describe, expect, it } from 'vitest'
import { normalizeForSearch } from './search'

describe('normalizeForSearch', () => {
  it('drops accents and case', () => {
    expect(normalizeForSearch('Lucía ÁNXO')).toBe('lucia anxo')
  })
})
