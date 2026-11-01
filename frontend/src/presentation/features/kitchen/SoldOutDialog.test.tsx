import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

// No fake timers here: the pop-up's exit animation runs on the real frame clock.
describe('Agotados pop-up', () => {
  it('lists the sold-out products from the catalog', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')

    await user.click(await screen.findByRole('button', { name: 'Agotados (1)' }))

    const dialog = await screen.findByRole('dialog', { name: 'Agotados' })
    expect(within(dialog).getByText('Empanada de bonito')).toBeInTheDocument()
  })

  it('says so when nothing is sold out', async () => {
    const user = userEvent.setup()
    renderApp('/cocina', { getCatalog: async () => [] })

    await user.click(await screen.findByRole('button', { name: 'Agotados (0)' }))

    expect(await screen.findByText('Nada agotado.')).toBeInTheDocument()
  })

  it('closes with its close button and gives focus back to the Agotados button', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')
    const button = await screen.findByRole('button', { name: 'Agotados (1)' })

    await user.click(button)
    await user.click(within(await screen.findByRole('dialog', { name: 'Agotados' })).getByRole('button', { name: 'Cerrar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(button).toHaveFocus()
  })
})
