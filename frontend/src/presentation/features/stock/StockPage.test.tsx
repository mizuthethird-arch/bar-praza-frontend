import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

describe('StockPage', () => {
  it('shows the summary figures', async () => {
    renderApp('/stock')

    const controlled = (await screen.findByText('Artículos controlados')).parentElement!
    expect(within(controlled).getByText('10')).toBeInTheDocument()
    expect(within(screen.getByText('Bajo mínimo', { selector: 'p' }).parentElement!).getByText('3')).toBeInTheDocument()
    expect(within(screen.getByText('Agotados').parentElement!).getByText('1')).toBeInTheDocument()
    expect(within(screen.getByText('Mermas esta semana').parentElement!).getByText('2')).toBeInTheDocument()
  })

  it('lists the inventory and filters it', async () => {
    const user = userEvent.setup()
    renderApp('/stock')

    expect(await screen.findByText('Pulpo cocido')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Bebidas' }))
    expect(screen.queryByText('Pulpo cocido')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ajustar Albariño' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Bajo mínimo' }))
    expect(screen.getByRole('button', { name: 'Ajustar Cerveza lata' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ajustar Albariño' })).not.toBeInTheDocument()
  })

  it('previews and records an entry for the suggested item', async () => {
    const user = userEvent.setup()
    renderApp('/stock')

    const panel = await screen.findByRole('complementary', { name: 'Ajustar stock' })
    expect(within(panel).getByRole('heading', { name: 'Ajustar · Pimiento de Padrón' })).toBeInTheDocument()

    await user.type(within(panel).getByLabelText('Cantidad (kg)'), '3')
    expect(within(panel).getByText('Quedará en 3,6 kg · por encima del mínimo.')).toBeInTheDocument()

    await user.click(within(panel).getByRole('button', { name: 'Guardar movimiento' }))

    const row = (await screen.findAllByText('Pimiento de Padrón'))[0].closest('tr')!
    expect(await within(row).findByText('3,6 kg')).toBeInTheDocument()
  })

  it('records a waste and a count', async () => {
    const user = userEvent.setup()
    renderApp('/stock')

    const panel = await screen.findByRole('complementary', { name: 'Ajustar stock' })
    await user.click(within(panel).getByRole('tab', { name: 'Merma' }))
    await user.type(within(panel).getByLabelText('Cantidad (kg)'), '0,2')
    await user.click(within(panel).getByRole('button', { name: 'Guardar movimiento' }))

    expect(await screen.findByText('0,4 kg')).toBeInTheDocument()
    expect(within(screen.getByText('Mermas esta semana').parentElement!).getByText('3')).toBeInTheDocument()

    await user.click(within(panel).getByRole('tab', { name: 'Recuento' }))
    await user.type(within(panel).getByLabelText('Cantidad (kg)'), '5')
    await user.click(within(panel).getByRole('button', { name: 'Guardar movimiento' }))

    expect(await screen.findByText('5 kg')).toBeInTheDocument()
  })

  it('rejects an empty or invalid amount', async () => {
    const user = userEvent.setup()
    renderApp('/stock')

    const panel = await screen.findByRole('complementary', { name: 'Ajustar stock' })
    await user.click(within(panel).getByRole('button', { name: 'Guardar movimiento' }))

    expect(await within(panel).findByRole('alert')).toHaveTextContent('Indica una cantidad')
  })

  it('shows the shopping list of items below the minimum', async () => {
    renderApp('/stock')

    const list = (await screen.findByRole('heading', { name: 'Lista de compra' })).closest('section')!
    expect(within(list).getByText('Empanada de bonito')).toBeInTheDocument()
    expect(within(list).getByText('12 porc.')).toBeInTheDocument()
    expect(within(list).getByText('2 cajas')).toBeInTheDocument()
    expect(within(list).queryByText('Pulpo cocido')).not.toBeInTheDocument()
  })
})
