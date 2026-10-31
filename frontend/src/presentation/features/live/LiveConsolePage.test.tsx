import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

describe('LiveConsolePage', () => {
  it('shows the events received so far, newest first', async () => {
    renderApp('/consola')

    const items = await screen.findAllByRole('listitem')
    expect(items).toHaveLength(4)
    expect(items[0]).toHaveTextContent('Preparando · [Uxía], consola')
  })

  it('counts the orders received', async () => {
    renderApp('/consola')

    const card = (await screen.findByText('Pedidos recibidos')).parentElement!
    expect(within(card).getByText('3')).toBeInTheDocument()
  })

  it('refreshes and adds the next event', async () => {
    const user = userEvent.setup()
    renderApp('/consola')
    await screen.findAllByRole('listitem')

    await user.click(screen.getByRole('button', { name: 'Actualizar' }))

    expect(await screen.findByText('Listo para recoger')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })

  it('counts a delayed order once it shows up', async () => {
    const user = userEvent.setup()
    renderApp('/consola')
    await screen.findAllByRole('listitem')

    await user.click(screen.getByRole('button', { name: 'Actualizar' }))
    await user.click(screen.getByRole('button', { name: 'Actualizar' }))

    const card = (await screen.findByText('Retrasados')).parentElement!
    expect(await within(card).findByText('1')).toBeInTheDocument()
  })

  it('pauses and resumes the refresh', async () => {
    const user = userEvent.setup()
    renderApp('/consola')

    await user.click(await screen.findByRole('button', { name: 'Pausar' }))
    expect(screen.getByRole('button', { name: 'Reanudar' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reanudar' }))
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument()
  })

  it('shows an error when a refresh fails', async () => {
    const user = userEvent.setup()
    renderApp('/consola', { pollLiveEvents: () => Promise.reject(new Error('down')) })

    await user.click(await screen.findByRole('button', { name: 'Actualizar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo actualizar')
  })
})
