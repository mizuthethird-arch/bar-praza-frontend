import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createMockServices } from '../../../infrastructure/mock/create-mock-services'
import { renderApp } from '../../../test/render-app'

const offline = () => Promise.reject(new Error('offline'))

describe('SchedulePage edge cases', () => {
  it('tells the user when pausing fails', async () => {
    const user = userEvent.setup()
    renderApp('/horario', { pauseOrders: offline })

    await user.click(await screen.findByRole('button', { name: 'Pausar pedidos' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cambiar el estado de los pedidos')
    expect(screen.getByText('Ahora mismo: aceptando pedidos')).toBeInTheDocument()
  })

  it('tells the user when resuming fails', async () => {
    const services = createMockServices({ loginDelayMs: 0 })
    const paused = await services.pauseOrders(15)
    const user = userEvent.setup()
    renderApp('/horario', { getScheduleOverview: async () => paused, resumeOrders: offline })

    await user.click(await screen.findByRole('button', { name: 'Reanudar pedidos' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cambiar el estado de los pedidos')
  })

  it('tells the user when removing a closure fails and keeps it', async () => {
    const user = userEvent.setup()
    renderApp('/horario', { removeClosure: offline })

    const [remove] = await screen.findAllByRole('button', { name: 'Quitar' })
    await user.click(remove)

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo quitar el cierre')
    expect(screen.getAllByRole('button', { name: 'Quitar' })).toHaveLength(2)
  })
})
