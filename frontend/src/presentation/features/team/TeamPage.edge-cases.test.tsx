import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

describe('TeamPage edge cases', () => {
  it('will not switch off the last active owner', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    const toggle = await screen.findByRole('checkbox', { name: 'Activo [Titular]' })
    await user.click(toggle)

    expect(await screen.findByRole('alert')).toHaveTextContent('al menos un titular')
    expect(toggle).toBeChecked()
  })

  it('tells the user when adding a member fails and keeps the name', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes', { addMember: () => Promise.reject(new Error('down')) })

    await user.type(await screen.findByLabelText('Nombre del miembro'), 'Brais')
    await user.click(screen.getByRole('button', { name: 'Añadir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo añadir')
    expect(screen.getByLabelText('Nombre del miembro')).toHaveValue('Brais')
  })

  it('clears the name field after adding', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    await user.type(await screen.findByLabelText('Nombre del miembro'), 'Brais')
    await user.click(screen.getByRole('button', { name: 'Añadir' }))

    expect(await screen.findByText('Brais')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre del miembro')).toHaveValue('')
  })

  it('tells the user when saving the settings fails', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes', { saveSettings: () => Promise.reject(new Error('down')) })

    await user.click(await screen.findByRole('button', { name: 'Guardar ajustes' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron guardar los ajustes')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('hides the saved message again as soon as a setting changes', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    await user.click(await screen.findByRole('button', { name: 'Guardar ajustes' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Ajustes guardados')

    await user.type(screen.getByLabelText('Teléfono'), '1')

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows an error when the team cannot be loaded', async () => {
    renderApp('/ajustes', { getTeam: () => Promise.reject(new Error('down')) })

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar')
  })
})
