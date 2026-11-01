import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { InvitationError } from '../../../domain/team/team'
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

  it('tells the user when the invitation cannot be sent, and keeps the email', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes', { inviteMember: () => Promise.reject(new Error('down')) })

    await user.type(await screen.findByLabelText('Email'), 'brais@bar.es')
    await user.click(screen.getByRole('button', { name: 'Enviar invitación' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo enviar la invitación')
    expect(screen.getByLabelText('Email')).toHaveValue('brais@bar.es')
  })

  it('shows the rule message when the email already has a live invitation', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes', {
      inviteMember: () => Promise.reject(new InvitationError('Ya hay una invitación para ese email')),
    })

    await user.type(await screen.findByLabelText('Email'), 'brais@bar.es')
    await user.click(screen.getByRole('button', { name: 'Enviar invitación' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya hay una invitación para ese email')
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

  it('tells the user when an invitation cannot be resent', async () => {
    const user = userEvent.setup()
    const team = {
      members: [],
      invitations: [{ id: 'i1', email: 'x@bar.es', role: 'bar' as const, expiresOn: '2026-11-08' }],
      settings: { barName: 'Bar Praza', phone: '', address: '', notifyNewOrders: true, notifyDelays: true },
    }
    renderApp('/ajustes', { getTeam: () => Promise.resolve(team), resendInvitation: () => Promise.reject(new Error('down')) })

    await user.click(await screen.findByRole('button', { name: 'Reenviar invitación a x@bar.es' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo reenviar la invitación')
  })
})
