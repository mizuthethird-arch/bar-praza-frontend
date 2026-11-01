import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

// No fake timers here: the pop-up's exit animation and the toast run on the real clock.
describe('Cerrar turno', () => {
  it('is available while the shift is open', async () => {
    renderApp('/cocina')

    expect(await screen.findByRole('button', { name: 'Cerrar turno' })).toBeEnabled()
    expect(screen.getByText(/turno abierto/i)).toBeInTheDocument()
  })

  it('asks first and keeps the shift open on No', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')

    await user.click(await screen.findByRole('button', { name: 'Cerrar turno' }))
    const dialog = await screen.findByRole('dialog', { name: '¿Cerrar el turno?' })
    await user.click(within(dialog).getByRole('button', { name: 'No' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByText(/turno abierto/i)).toBeInTheDocument()
    expect(screen.queryByText('Turno finalizado')).not.toBeInTheDocument()
  })

  it('closes the shift on Sí: notice from the top, closed label, and no second close', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')

    await user.click(await screen.findByRole('button', { name: 'Cerrar turno' }))
    const dialog = await screen.findByRole('dialog', { name: '¿Cerrar el turno?' })
    await user.click(within(dialog).getByRole('button', { name: 'Sí' }))

    expect(await screen.findByText('Turno finalizado')).toBeInTheDocument()
    expect(screen.getByText(/turno cerrado/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar turno' })).toBeDisabled()
  })

  it('shows an error and keeps the shift open when it cannot be closed', async () => {
    const user = userEvent.setup()
    renderApp('/cocina', { closeKitchenShift: () => Promise.reject(new Error('down')) })

    await user.click(await screen.findByRole('button', { name: 'Cerrar turno' }))
    await user.click(within(await screen.findByRole('dialog', { name: '¿Cerrar el turno?' })).getByRole('button', { name: 'Sí' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cerrar el turno')
    expect(screen.getByText(/turno abierto/i)).toBeInTheDocument()
  })
})
