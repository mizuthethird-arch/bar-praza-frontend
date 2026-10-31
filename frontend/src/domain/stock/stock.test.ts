import { describe, expect, it } from 'vitest'
import {
  applyMovement,
  filterStock,
  shoppingList,
  stockLevel,
  suggestedItem,
  summarizeStock,
  type StockItem,
  type StockState,
} from './stock'

const item = (overrides: Partial<StockItem>): StockItem => ({
  id: 'i',
  name: 'Item',
  quantity: 10,
  unit: 'kg',
  minimum: 5,
  category: 'kitchen',
  usedIn: '',
  restockLabel: '5 kg',
  ...overrides,
})

const state: StockState = {
  countedAt: '19 oct, 12:05',
  wasteThisWeek: 2,
  items: [
    item({ id: 'empty', quantity: 0, minimum: 4 }),
    item({ id: 'low', quantity: 0.6, minimum: 1 }),
    item({ id: 'ok', quantity: 8, minimum: 5 }),
    item({ id: 'beer', quantity: 3, minimum: 6, category: 'drinks' }),
  ],
}

describe('summarizeStock', () => {
  it('counts controlled, below-minimum, sold-out and waste', () => {
    expect(summarizeStock(state)).toEqual({ controlled: 4, belowMinimum: 2, soldOut: 1, waste: 2 })
  })
})

describe('applyMovement', () => {
  it('adds on entry', () => {
    const next = applyMovement(state, { itemId: 'low', kind: 'in', amount: 3 })

    expect(next.items.find((i) => i.id === 'low')?.quantity).toBeCloseTo(3.6)
  })

  it('subtracts on waste, never below zero, and counts the waste record', () => {
    const next = applyMovement(state, { itemId: 'low', kind: 'waste', amount: 5 })

    expect(next.items.find((i) => i.id === 'low')?.quantity).toBe(0)
    expect(next.wasteThisWeek).toBe(3)
  })

  it('replaces the quantity on a count', () => {
    const next = applyMovement(state, { itemId: 'ok', kind: 'count', amount: 2 })

    expect(next.items.find((i) => i.id === 'ok')?.quantity).toBe(2)
  })

  it('does not mutate the original state', () => {
    applyMovement(state, { itemId: 'ok', kind: 'in', amount: 1 })

    expect(state.items.find((i) => i.id === 'ok')?.quantity).toBe(8)
  })
})

describe('stock views', () => {
  it('filters by category and by below minimum', () => {
    expect(filterStock(state.items, 'drinks').map((i) => i.id)).toEqual(['beer'])
    expect(filterStock(state.items, 'low').map((i) => i.id)).toEqual(['empty', 'low', 'beer'])
    expect(filterStock(state.items, 'all')).toHaveLength(4)
  })

  it('builds the shopping list from items below minimum', () => {
    expect(shoppingList(state.items).map((i) => i.id)).toEqual(['empty', 'low', 'beer'])
  })

  it('suggests the first low item that is not sold out', () => {
    expect(suggestedItem(state.items)?.id).toBe('low')
    expect(suggestedItem([])).toBeUndefined()
  })
})

describe('stockLevel', () => {
  it('is the quantity over twice the minimum, kept between 0 and 1', () => {
    expect(stockLevel(item({ quantity: 0.6, minimum: 1 }))).toBeCloseTo(0.3)
    expect(stockLevel(item({ quantity: 50, minimum: 5 }))).toBe(1)
    expect(stockLevel(item({ quantity: 0, minimum: 5 }))).toBe(0)
  })

  it('does not divide by zero when there is no minimum', () => {
    expect(stockLevel(item({ quantity: 3, minimum: 0 }))).toBe(1)
    expect(stockLevel(item({ quantity: 0, minimum: 0 }))).toBe(0)
  })
})

describe('applyMovement on an unknown item', () => {
  it('throws instead of doing nothing', () => {
    expect(() => applyMovement(state, { itemId: 'nope', kind: 'in', amount: 1 })).toThrow()
  })
})
