import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { DeliveredOrder, KitchenOrder } from '../../../domain/kitchen/kitchen'
import { addMinutes, clockOf } from '../../../domain/time/clock'
import { renderApp } from '../../../test/render-app'

// Times are built from the real clock, so the test does not depend on when it runs.
const at = (minutes: number) => addMinutes(clockOf(new Date()), minutes)
const newOrder = (id: string, pickupTime: string): KitchenOrder => ({
  id, customer: 'Ana', pickupTime, status: 'new', phone: '600 000 000', totalCents: 500, lines: [{ quantity: 1, name: 'Agua', variant: '' }],
})
const delivered = (id: string, deliveredAt: string, totalCents: number): DeliveredOrder => ({
  id, customer: 'Ana', pickupTime: '20:00', phone: '600 000 000', totalCents, deliveredAt, lines: [{ quantity: 1, name: 'Agua', variant: '' }],
})

const board = {
  shiftOpenedAt: '19:02',
  // #50 came in first, but is picked up later than #51.
  orders: [newOrder('#50', at(30)), newOrder('#51', at(10))],
  delivered: [delivered('#30', at(-20), 1000), delivered('#31', at(-5), 300), delivered('#32', at(-12), 2000)],
}

const idsIn = (region: string) =>
  within(screen.getByRole('region', { name: region })).getAllByRole('article').map((article) => article.getAttribute('aria-label'))

// The delivered cards are buttons that show their number first, such as "#31 Cliente…".
const deliveredIds = () =>
  within(screen.getByRole('group', { name: 'Entregados' })).getAllByRole('button').map((card) => card.textContent?.match(/#\d+/)?.[0])

describe('sorting the kitchen columns', () => {
  it('keeps the new column first in first out, with no sort buttons of its own', async () => {
    renderApp('/cocina', { getKitchenBoard: async () => board })
    await screen.findByRole('article', { name: 'Pedido #50' })

    expect(idsIn('Nuevos')).toEqual(['Pedido #50', 'Pedido #51'])
    expect(screen.queryByRole('group', { name: 'Ordenar nuevos' })).not.toBeInTheDocument()
  })

  it('orders the delivered list by delivery first, then by amount on request', async () => {
    const user = userEvent.setup()
    renderApp('/cocina', { getKitchenBoard: async () => board })
    await screen.findByRole('group', { name: 'Entregados' })

    expect(deliveredIds()).toEqual(['#31', '#32', '#30'])
    await user.click(within(screen.getByRole('group', { name: 'Ordenar entregados' })).getByRole('button', { name: 'Importe' }))

    expect(deliveredIds()).toEqual(['#32', '#30', '#31'])
  })
})
