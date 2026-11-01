import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

describe('OrdersPage keyboard', () => {
  it('selects a row with Space, and ignores any other key', async () => {
    const user = userEvent.setup()
    renderApp('/pedidos')
    const row = (await screen.findAllByRole('row')).at(-1)!
    const id = within(row).getAllByRole('cell')[0].textContent!
    const panel = () => screen.getByRole('complementary', { name: 'Detalle del pedido' })
    expect(panel()).not.toHaveTextContent(id)

    row.focus()
    await user.keyboard('a')
    expect(panel()).not.toHaveTextContent(id)

    await user.keyboard(' ')
    expect(panel()).toHaveTextContent(id)
  })
})
