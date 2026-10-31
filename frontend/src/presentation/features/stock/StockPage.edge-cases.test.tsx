import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { AppServices } from '../../../application/services'
import { renderApp } from '../../../test/render-app'

async function openAdjuster(overrides: Partial<AppServices> = {}) {
  renderApp('/stock', overrides)
  const panel = await screen.findByRole('complementary', { name: 'Ajustar stock' })
  return { panel, user: userEvent.setup() }
}

describe('StockPage edge cases', () => {
  it('switches the adjuster with the header buttons', async () => {
    const { user } = await openAdjuster()
    await user.click(screen.getByRole('button', { name: 'Hacer recuento' }))
    expect(screen.getByRole('tab', { name: 'Recuento' })).toHaveAttribute('aria-selected', 'true')

    await user.click(screen.getByRole('button', { name: 'Registrar entrada' }))
    expect(screen.getByRole('tab', { name: 'Entrada' })).toHaveAttribute('aria-selected', 'true')
  })

  it('rejects zero, text and infinity for an entry', async () => {
    const { panel, user } = await openAdjuster()

    for (const bad of ['0', 'abc', 'Infinity', '-2']) {
      const amount = within(panel).getByLabelText('Cantidad (kg)')
      await user.clear(amount)
      await user.type(amount, bad)
      await user.click(within(panel).getByRole('button', { name: 'Guardar movimiento' }))

      expect(await within(panel).findByRole('alert'), bad).toHaveTextContent('Indica una cantidad')
    }
  })

  it('lets a count set the quantity to zero', async () => {
    const { panel, user } = await openAdjuster()

    await user.click(within(panel).getByRole('tab', { name: 'Recuento' }))
    await user.type(within(panel).getByLabelText('Cantidad (kg)'), '0')
    await user.click(within(panel).getByRole('button', { name: 'Guardar movimiento' }))

    const row = screen.getByRole('button', { name: 'Ajustar Pimiento de Padrón' }).closest('tr')!
    expect(await within(row).findByText('0 kg')).toBeInTheDocument()
  })

  it('warns when the result stays below the minimum', async () => {
    const { panel, user } = await openAdjuster()

    await user.type(within(panel).getByLabelText('Cantidad (kg)'), '0,2')

    expect(within(panel).getByText('Quedará en 0,8 kg · por debajo del mínimo.')).toBeInTheDocument()
  })

  it('shows an error and keeps the amount when saving fails', async () => {
    const { panel, user } = await openAdjuster({ recordStockMovement: () => Promise.reject(new Error('down')) })

    await user.type(within(panel).getByLabelText('Cantidad (kg)'), '3')
    await user.click(within(panel).getByRole('button', { name: 'Guardar movimiento' }))

    expect(await within(panel).findByRole('alert')).toHaveTextContent('No se pudo guardar el movimiento')
    expect(within(panel).getByLabelText('Cantidad (kg)')).toHaveValue('3')
  })

  it('adjusts the item whose Ajustar link was clicked', async () => {
    const { user } = await openAdjuster()

    await user.click(screen.getByRole('button', { name: 'Ajustar Patata' }))

    expect(screen.getByRole('heading', { name: 'Ajustar · Patata' })).toBeInTheDocument()
  })

  it('draws a level bar even for an item without a minimum', async () => {
    renderApp('/stock', {
      getStock: async () => ({
        countedAt: 'hoy',
        wasteThisWeek: 0,
        items: [{ id: 'x', name: 'Sal', quantity: 3, unit: 'kg', minimum: 0, category: 'kitchen', usedIn: '', restockLabel: '' }],
      }),
    })

    const row = (await screen.findByRole('button', { name: 'Ajustar Sal' })).closest('tr')!
    expect(row.querySelector('[style]')).toHaveStyle({ width: '100%' })
  })

  it('shows an error when the stock cannot be loaded', async () => {
    renderApp('/stock', { getStock: () => Promise.reject(new Error('down')) })

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar')
  })
})
