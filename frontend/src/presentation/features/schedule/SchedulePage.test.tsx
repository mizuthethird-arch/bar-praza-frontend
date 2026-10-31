import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createMockServices } from '../../../infrastructure/mock/create-mock-services'
import { renderApp } from '../../../test/render-app'

describe('SchedulePage', () => {
  it('lists all seven days of the week', async () => {
    renderApp('/horario')

    for (const day of ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']) {
      expect(await screen.findByText(day)).toBeInTheDocument()
    }
  })

  it('marks a closed day as Cerrado', async () => {
    renderApp('/horario')

    expect(await screen.findByText('Cerrado')).toBeInTheDocument()
  })

  it('shows the ordering status and the queue', async () => {
    renderApp('/horario')

    expect(await screen.findByText('Ahora mismo: aceptando pedidos')).toBeInTheDocument()
    expect(screen.getByText('Hasta las [23:30] · 2 pedidos en cola')).toBeInTheDocument()
  })

  it('shows the pause state when ordering is not being accepted', async () => {
    const overview = await createMockServices({ loginDelayMs: 0 }).getScheduleOverview()
    renderApp('/horario', {
      getScheduleOverview: async () => ({
        ...overview,
        status: { ...overview.status, accepting: false },
      }),
    })

    expect(await screen.findByText('Ahora mismo: pedidos pausados')).toBeInTheDocument()
  })

  it('shows an error message when the schedule cannot be loaded', async () => {
    renderApp('/horario', { getScheduleOverview: () => Promise.reject(new Error('down')) })

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar')
  })
})

describe('SchedulePage actions', () => {
  it('pauses and resumes ordering', async () => {
    const user = userEvent.setup()
    renderApp('/horario')

    await screen.findByText('Ahora mismo: aceptando pedidos')
    await user.selectOptions(screen.getByLabelText('Pausar durante'), '30')
    await user.click(screen.getByRole('button', { name: 'Pausar pedidos' }))

    expect(await screen.findByText('Ahora mismo: pedidos pausados')).toBeInTheDocument()
    expect(screen.getByText(/pausados durante 30 minutos/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reanudar pedidos' }))

    expect(await screen.findByText('Ahora mismo: aceptando pedidos')).toBeInTheDocument()
  })

  it('removes a closure', async () => {
    const user = userEvent.setup()
    renderApp('/horario')

    await screen.findByText(/Vacaciones/)
    await user.click(screen.getAllByRole('button', { name: 'Quitar' })[0])

    await waitFor(() => expect(screen.queryByText(/Vacaciones/)).not.toBeInTheDocument())
  })

  it('adds a closure from the form', async () => {
    const user = userEvent.setup()
    renderApp('/horario')

    await screen.findByText(/Vacaciones/)
    await user.click(screen.getByRole('button', { name: 'Añadir cierre' }))
    await user.type(screen.getByLabelText('Fecha del cierre'), '2027-01-01')
    await user.type(screen.getByLabelText('Motivo'), 'Reforma')
    await user.click(screen.getByRole('button', { name: 'Guardar cierre' }))

    expect(await screen.findByText(/Reforma/)).toBeInTheDocument()
  })

  it('does not save a closure without a reason', async () => {
    const user = userEvent.setup()
    renderApp('/horario')

    await screen.findByText(/Vacaciones/)
    await user.click(screen.getByRole('button', { name: 'Añadir cierre' }))
    await user.click(screen.getByRole('button', { name: 'Guardar cierre' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Indica un motivo')
  })
})
