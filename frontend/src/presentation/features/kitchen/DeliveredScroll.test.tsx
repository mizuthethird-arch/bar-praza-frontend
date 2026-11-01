import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { DeliveredOrder, KitchenBoard } from '../../../domain/kitchen/kitchen'
import { renderApp } from '../../../test/render-app'

const delivered: DeliveredOrder[] = Array.from({ length: 8 }, (_, i) => ({
  id: `#${30 + i}`, customer: `Cliente ${i + 1}`, pickupTime: '20:00', deliveredAt: '20:10', phone: '600 000 000',
  totalCents: 1000, lines: [{ quantity: 1, name: 'Agua', variant: '' }],
}))
const board: KitchenBoard = { shiftOpenedAt: '19:02', orders: [], delivered }

describe('delivered orders column', () => {
  it('keeps the cards in a box that scrolls after six, with the total outside it', async () => {
    renderApp('/cocina', { getKitchenBoard: async () => board })

    const list = await screen.findByRole('group', { name: 'Entregados' })
    expect(list).toHaveClass('max-h-[30rem]', 'overflow-y-auto')
    expect(within(list).getAllByRole('button')).toHaveLength(8)

    const column = screen.getByRole('region', { name: 'Entregados y cobrados' })
    expect(within(column).getByText('Total cobrado')).toBeInTheDocument()
    expect(list).not.toContainElement(within(column).getByText('Total cobrado'))
  })
})
