import { describe, expect, it } from 'vitest'
import { filterCustomers, type Customer } from './customers'

const customer = (overrides: Partial<Customer>): Customer => ({
  id: 'c',
  name: 'Ana',
  phoneTail: '004',
  hasAccount: false,
  orders: 1,
  lastOrder: 'Hoy',
  usualOrder: '',
  ...overrides,
})

const customers = [
  customer({ name: 'Lucía', phoneTail: '000', hasAccount: true }),
  customer({ name: 'Marcos', phoneTail: '002' }),
]

describe('filterCustomers', () => {
  it('searches by name or last phone digits', () => {
    expect(filterCustomers(customers, { search: 'lucia', type: 'all' }).map((c) => c.name)).toEqual(['Lucía'])
    expect(filterCustomers(customers, { search: '002', type: 'all' }).map((c) => c.name)).toEqual(['Marcos'])
  })

  it('filters by account', () => {
    expect(filterCustomers(customers, { search: '', type: 'account' }).map((c) => c.name)).toEqual(['Lucía'])
    expect(filterCustomers(customers, { search: '', type: 'guest' }).map((c) => c.name)).toEqual(['Marcos'])
  })
})
