import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

describe('OrdersPage', () => {
  it('lists the orders with channel, total and status', async () => {
    renderApp('/pedidos')

    const row = (await screen.findByText('B-12')).closest('tr')!
    expect(within(row).getByText('Mesa 4')).toBeInTheDocument()
    expect(within(row).getByText('21,00 €')).toBeInTheDocument()
    expect(within(row).getByText('Abierto')).toBeInTheDocument()
  })

  it('shows the delayed order in the detail panel by default', async () => {
    renderApp('/pedidos')

    const panel = await screen.findByRole('complementary', { name: 'Detalle del pedido' })
    expect(within(panel).getByText('Retrasado 4 min')).toBeInTheDocument()
    expect(within(panel).getByText('1× Croquetas de jamón · Ración')).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: '600 000 002' })).toHaveAttribute('href', 'tel:600000002')
    expect(within(panel).getByText('Hora de recogida superada')).toBeInTheDocument()
  })

  it('searches and filters', async () => {
    const user = userEvent.setup()
    renderApp('/pedidos')
    await screen.findByText('#44')

    await user.type(screen.getByLabelText('Buscar'), 'lucía')
    expect(screen.queryByText('#44')).not.toBeInTheDocument()
    expect(screen.getByText('#41')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Buscar'))
    await user.selectOptions(screen.getByLabelText('Canal'), 'Mesa')
    expect(screen.queryByText('#44')).not.toBeInTheDocument()
    expect(screen.getByText('B-12')).toBeInTheDocument()
  })

  it('opens another order when its row is clicked', async () => {
    const user = userEvent.setup()
    renderApp('/pedidos')

    await user.click(await screen.findByText('#41'))

    const panel = screen.getByRole('complementary', { name: 'Detalle del pedido' })
    expect(within(panel).getByRole('heading', { name: /#41/ })).toBeInTheDocument()
  })

  it('cancels the selected order', async () => {
    const user = userEvent.setup()
    renderApp('/pedidos')

    await user.click(await screen.findByRole('button', { name: 'Cancelar pedido' }))

    const row = screen.getByRole('cell', { name: '#42' }).closest('tr')!
    expect(await within(row).findByText('Cancelado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar pedido' })).toBeDisabled()
  })

  it('shows an error when the orders cannot be loaded', async () => {
    renderApp('/pedidos', { listOrderLog: () => Promise.reject(new Error('down')) })

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar')
  })
})
