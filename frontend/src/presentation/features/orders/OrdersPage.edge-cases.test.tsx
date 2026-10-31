import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { OrderEntry } from '../../../domain/orders/order-log'
import { captureDownloads } from '../../../test/capture-downloads'
import { renderApp } from '../../../test/render-app'

const order: OrderEntry = {
  id: '#9', time: '21:00', customer: 'Noa', channel: 'app', totalCents: 300, status: 'new',
  lines: [{ quantity: 2, name: 'Café', variant: 'Taza', totalCents: 300 }], timeline: [],
}

describe('OrdersPage edge cases', () => {
  const capture = captureDownloads()
  afterEach(() => capture.restore())

  it('exports only the visible orders as CSV', async () => {
    const user = userEvent.setup()
    renderApp('/pedidos')

    await user.type(await screen.findByLabelText('Buscar'), 'lucía')
    await user.click(screen.getByRole('button', { name: 'Exportar CSV' }))

    expect(capture.downloads).toHaveLength(1)
    expect(capture.downloads[0].name).toBe('pedidos.csv')
    const text = await capture.downloads[0].text
    expect(text).toContain('Nº;Hora;Cliente;Canal;Total;Estado')
    expect(text).toContain('#41;21:05;Lucía;App;23,00 €;Listo')
    expect(text).not.toContain('#44')
  })

  it('says so when no order matches the filters', async () => {
    const user = userEvent.setup()
    renderApp('/pedidos')

    await user.type(await screen.findByLabelText('Buscar'), 'zzz')

    expect(screen.getByText('Ningún pedido coincide.')).toBeInTheDocument()
  })

  it('disables calling when the order has no phone', async () => {
    const user = userEvent.setup()
    renderApp('/pedidos')

    await user.click(await screen.findByText('B-12'))

    expect(screen.getByRole('button', { name: 'Llamar al cliente' })).toBeDisabled()
    expect(screen.queryByRole('link', { name: 'Llamar al cliente' })).not.toBeInTheDocument()
  })

  it('keeps finished orders from being cancelled', async () => {
    const user = userEvent.setup()
    renderApp('/pedidos')

    await user.click(await screen.findByText('#40'))

    expect(screen.getByRole('button', { name: 'Cancelar pedido' })).toBeDisabled()
  })

  it('shows an empty detail panel when there are no orders', async () => {
    renderApp('/pedidos', { listOrderLog: async () => [] })

    expect(await screen.findByText('Elige un pedido para ver su detalle.')).toBeInTheDocument()
  })

  it('tells the user when cancelling fails', async () => {
    const user = userEvent.setup()
    renderApp('/pedidos', { cancelOrder: () => Promise.reject(new Error('offline')) })

    await user.click(await screen.findByRole('button', { name: 'Cancelar pedido' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cancelar el pedido')
  })

  it('opens an order from the keyboard', async () => {
    const user = userEvent.setup()
    renderApp('/pedidos')

    const row = (await screen.findByRole('cell', { name: '#41' })).closest('tr')!
    row.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('heading', { level: 2, name: '#41' })).toBeInTheDocument()
  })

  it('does not print a stray 0 for an order delayed zero minutes', async () => {
    const entry = { ...order, delayedMinutes: 0 }
    renderApp('/pedidos', { listOrderLog: async () => [entry] })

    const panel = await screen.findByRole('complementary', { name: 'Detalle del pedido' })
    expect(within(panel).queryByText('0')).not.toBeInTheDocument()
  })

  it('shows repeated lines and events of one order without clashing', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const line = { quantity: 1, name: 'Café', variant: 'Taza', totalCents: 150 }
    const event = { time: '21:00', text: 'Recibido por la app' }
    renderApp('/pedidos', { listOrderLog: async () => [{ ...order, lines: [line, line], timeline: [event, event] }] })

    const panel = await screen.findByRole('complementary', { name: 'Detalle del pedido' })
    expect(within(panel).getAllByText('1× Café · Taza')).toHaveLength(2)
    expect(errors.mock.calls.flat().join(' ')).not.toMatch(/same key/)
    errors.mockRestore()
  })
})
