import { normalizeForSearch } from '../text/search'

export type Customer = {
  id: string
  name: string
  phoneTail: string
  hasAccount: boolean
  orders: number
  lastOrder: string
  usualOrder: string
}

export type CustomerFilter = {
  search: string
  type: 'all' | 'account' | 'guest'
}

export function filterCustomers(customers: Customer[], { search, type }: CustomerFilter): Customer[] {
  const query = normalizeForSearch(search.trim())
  return customers.filter(
    (customer) =>
      (type === 'all' || (type === 'account') === customer.hasAccount) &&
      (query === '' || normalizeForSearch(`${customer.name} ${customer.phoneTail}`).includes(query)),
  )
}
