import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from '../../../test/render-app'
import { playChime } from './chime'

vi.mock('./chime', () => ({ playChime: vi.fn() }))

describe('test order page (/crear-pedido-prueba)', () => {
  it('creates a test order and says where it will appear', async () => {
    const user = userEvent.setup()
    renderApp('/crear-pedido-prueba')

    await user.click(await screen.findByRole('button', { name: 'Crear pedido de prueba' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Pedido #45 creado')
    expect(screen.getByRole('status')).toHaveTextContent('Pedidos de cocina')
  })

  it('plays the chime, so the sound can be tried from a click', async () => {
    const user = userEvent.setup()
    renderApp('/crear-pedido-prueba')

    await user.click(await screen.findByRole('button', { name: 'Probar sonido' }))

    expect(playChime).toHaveBeenCalledTimes(1)
  })

  it('clears the test orders', async () => {
    const user = userEvent.setup()
    renderApp('/crear-pedido-prueba')

    await user.click(await screen.findByRole('button', { name: 'Borrar pedidos de prueba' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Pedidos de prueba borrados')
  })

  it('says so when the build has no test board, such as the real backend', async () => {
    renderApp('/crear-pedido-prueba', { testKitchen: undefined })

    const notice = await screen.findByRole('alert')
    expect(within(notice).getByText(/datos de demostración/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Crear pedido de prueba' })).not.toBeInTheDocument()
  })
})
