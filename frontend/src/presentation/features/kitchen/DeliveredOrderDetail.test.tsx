import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { KitchenBoard } from '../../../domain/kitchen/kitchen'
import { renderApp } from '../../../test/render-app'

const board: KitchenBoard = {
  shiftOpenedAt: '19:02',
  orders: [],
  delivered: [
    {
      id: '#7', customer: 'Brais', pickupTime: '20:00', deliveredAt: '20:05', phone: '600 000 009', totalCents: 700,
      paymentNote: 'pagado', note: 'sin sal',
      lines: [{ quantity: 1, name: 'Caldo', variant: 'Taza', detail: 'caliente' }],
    },
  ],
}

// No fake timers here: the pop-up's exit animation runs on the real frame clock.
describe('delivered order details', () => {
  it('shows the kitchen note, the payment note and the detail of each line', async () => {
    const user = userEvent.setup()
    renderApp('/cocina', { getKitchenBoard: async () => board })

    await user.click(await screen.findByRole('button', { name: /#7.*Brais/ }))

    const dialog = await screen.findByRole('dialog', { name: 'Pedido #7 · Brais' })
    expect(within(dialog).getByText('Nota: sin sal')).toBeInTheDocument()
    expect(within(dialog).getByText('pagado')).toBeInTheDocument()
    expect(within(dialog).getByText(/Caldo · Taza \(caliente\)/)).toBeInTheDocument()
  })
})
