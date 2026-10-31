import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

// No fake timers here: the pop-up's exit animation runs on the real frame clock.
describe('DeliveryDetailDialog', () => {
  it('closes with its close button and gives focus back to the card that opened it', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')
    const compact = await screen.findByRole('button', { name: /#40.*Iria/ })

    await user.click(compact)
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(compact).toHaveFocus()
  })

  it('closes with Escape', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')

    await user.click(await screen.findByRole('button', { name: /#40.*Iria/ }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
