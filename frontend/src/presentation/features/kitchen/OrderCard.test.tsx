import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

const card = (id: string) => screen.findByRole('article', { name: `Pedido ${id}` })

// No fake timers here: the pop-ups' exit animations run on the real frame clock.
describe('order card pop-ups', () => {
  it('opens the full order when the card is pressed', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')

    await user.click(await screen.findByRole('button', { name: /#44.*Pablo/ }))

    const dialog = await screen.findByRole('dialog', { name: 'Pedido #44 · Pablo' })
    expect(within(dialog).getByText(/Bocadillo de calamares/)).toBeInTheDocument()
    expect(within(dialog).getByText(/Refresco · 33 cl/)).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: '600 000 001' })).toHaveAttribute('href', 'tel:600000001')
    expect(within(dialog).getByText('paga al recoger')).toBeInTheDocument()
    expect(within(dialog).getByText('9,00 €')).toBeInTheDocument()
  })

  it('shows the kitchen note in the order pop-up', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')

    await user.click(await screen.findByRole('button', { name: /#43.*Ana/ }))

    expect(within(await screen.findByRole('dialog', { name: 'Pedido #43 · Ana' })).getByText('Nota: sin cebolla')).toBeInTheDocument()
  })

  it('warns in yellow before cancelling, and keeps the order on No', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')

    await user.click(within(await card('#44')).getByRole('button', { name: 'Cancelar' }))
    const dialog = await screen.findByRole('dialog', { name: '¿Cancelar el pedido #44?' })
    expect(within(dialog).getByText('Estás por cancelar este pedido. Esta acción no se puede deshacer.')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'No' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(within(await card('#44')).getByRole('button', { name: 'Empezar a preparar' })).toBeInTheDocument()
  })

  it('removes the order from the board on Sí', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')

    await user.click(within(await card('#44')).getByRole('button', { name: 'Cancelar' }))
    await user.click(within(await screen.findByRole('dialog', { name: '¿Cancelar el pedido #44?' })).getByRole('button', { name: 'Sí' }))

    await waitFor(() => expect(screen.queryByRole('article', { name: 'Pedido #44' })).not.toBeInTheDocument())
  })

  it('does not open the order pop-up when Cancelar is pressed', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')

    await user.click(within(await card('#44')).getByRole('button', { name: 'Cancelar' }))

    expect(await screen.findByRole('dialog', { name: '¿Cancelar el pedido #44?' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Pedido #44 · Pablo' })).not.toBeInTheDocument()
  })

  it('shows how late an order is, the detail of a line, and a dash when nothing is said about payment', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')

    await user.click(await screen.findByRole('button', { name: /#42.*Marcos/ }))

    const dialog = await screen.findByRole('dialog', { name: 'Pedido #42 · Marcos' })
    expect(within(dialog).getByText(/Retrasado \d+ min/)).toBeInTheDocument()
    expect(within(dialog).getByText(/\(8 uds\.\)/)).toBeInTheDocument()
    expect(within(dialog).getByText('—')).toBeInTheDocument()
  })
})
