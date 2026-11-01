import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { InvitationError } from '../../../domain/team/team'
import { renderApp } from '../../../test/render-app'

describe('TeamPage edge cases', () => {
  it('will not deactivate the last active owner', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    await user.click(await screen.findByRole('button', { name: 'Desactivar [Titular]' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('al menos un titular')
    expect(screen.getByRole('button', { name: 'Desactivar [Titular]' })).toBeInTheDocument()
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

  it('will not save a blank name, and says so in the pop-up', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')
    await user.click(await screen.findByRole('button', { name: 'Editar [Uxía]' }))
    const dialog = await screen.findByRole('dialog', { name: 'Editar · [Uxía]' })
    await user.clear(within(dialog).getByLabelText('Nombre'))

    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Indica un nombre')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('tells the user when the change cannot be saved, and keeps the pop-up open', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes', { updateMember: () => Promise.reject(new Error('down')) })
    await user.click(await screen.findByRole('button', { name: 'Editar [Uxía]' }))
    const dialog = await screen.findByRole('dialog', { name: 'Editar · [Uxía]' })

    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('No se pudo guardar el cambio')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
