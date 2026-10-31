import type { CustomersRepository } from '../../application/ports'
import type { Customer } from '../../domain/customers/customers'

const customers: Customer[] = [
  { id: 'c1', name: 'Lucía', phoneTail: '000', hasAccount: true, orders: 2, lastOrder: 'Hoy', usualOrder: 'Pulpo, tortilla' },
  { id: 'c2', name: 'Marcos', phoneTail: '002', hasAccount: false, orders: 1, lastOrder: 'Hoy', usualOrder: 'Croquetas' },
  { id: 'c3', name: 'Ana', phoneTail: '004', hasAccount: false, orders: 1, lastOrder: 'Hoy', usualOrder: 'Tortilla entera' },
  { id: 'c4', name: 'Iria', phoneTail: '005', hasAccount: true, orders: 1, lastOrder: 'Hoy', usualOrder: 'Raxo' },
]

export function createMockCustomersRepository(): CustomersRepository {
  return { list: async () => customers }
}
