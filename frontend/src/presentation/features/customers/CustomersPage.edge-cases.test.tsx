import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Customer } from '../../../domain/customers/customers'
import { renderApp } from '../../../test/render-app'

const ana = (id: string, phoneTail: string): Customer => ({
  id, name: 'Ana', phoneTail, hasAccount: false, orders: 1, lastOrder: 'Hoy', usualOrder: 'Café',
})

describe('CustomersPage edge cases', () => {
  it('lists two customers with the same name without clashing', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    renderApp('/clientes', { listCustomers: async () => [ana('c1', '111'), ana('c2', '222')] })

    expect(await screen.findAllByText('Ana')).toHaveLength(2)
    expect(errors.mock.calls.flat().join(' ')).not.toMatch(/same key/)
    errors.mockRestore()
  })
})
