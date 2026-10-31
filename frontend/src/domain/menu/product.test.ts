import { describe, expect, it } from 'vitest'
import { categoryCounts, removeProduct, replaceProduct, type Product } from './product'

const product = (overrides: Partial<Product>): Product => ({
  id: 'p',
  name: 'Producto',
  category: 'Raciones',
  description: '',
  dishOfDay: false,
  variants: [],
  stockLabel: null,
  lowStock: false,
  visibleInApp: true,
  barOnly: false,
  available: true,
  soldOut: false,
  allergens: [],
  deductsStock: false,
  ...overrides,
})

const products = [
  product({ id: 'a', category: 'Raciones' }),
  product({ id: 'b', category: 'Postres' }),
  product({ id: 'c', category: 'Raciones' }),
]

describe('catalog helpers', () => {
  it('counts products per category keeping first-seen order', () => {
    expect(categoryCounts(products)).toEqual([
      { category: 'Raciones', count: 2 },
      { category: 'Postres', count: 1 },
    ])
  })

  it('replaces a product by id', () => {
    const result = replaceProduct(products, product({ id: 'b', name: 'Nuevo' }))

    expect(result.map((p) => p.name)).toEqual(['Producto', 'Nuevo', 'Producto'])
  })

  it('removes a product by id', () => {
    expect(removeProduct(products, 'a').map((p) => p.id)).toEqual(['b', 'c'])
  })
})
