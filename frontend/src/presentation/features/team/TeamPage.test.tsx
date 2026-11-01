import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

describe('TeamPage', () => {
  it('lists the staff with their roles', async () => {
    renderApp('/ajustes')

    const row = (await screen.findByText('[Uxía]')).closest('tr')!
    expect(within(row).getByText('Cocina')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Personal y ajustes' })).toHaveAttribute('href', '/ajustes')
  })

  it('sends an invitation by email, shows it as pending, and clears the field', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    await user.type(await screen.findByLabelText('Email'), 'Brais@Bar.es')
    await user.selectOptions(screen.getByLabelText('Rol'), 'Barra')
    await user.click(screen.getByRole('button', { name: 'Enviar invitación' }))

    const row = (await screen.findByText('brais@bar.es')).closest('tr')!
    expect(within(row).getByText('Barra')).toBeInTheDocument()
    expect(within(row).getByText('Invitado')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveValue('')
  })

  it('shows the status, PIN, last access and device of each person', async () => {
    renderApp('/ajustes')

    const titular = (await screen.findByText('[Titular]')).closest('tr')!
    expect(within(titular).getByText('Activo', { selector: 'span' })).toBeInTheDocument()
    expect(within(titular).getByText('Configurado')).toBeInTheDocument()
    expect(within(titular).getByText('01/11 21:10')).toBeInTheDocument()
    expect(within(titular).getByText('TABLET BARRA')).toBeInTheDocument()

    const uxia = (await screen.findByText('[Uxía]')).closest('tr')!
    expect(within(uxia).getByText('Sin PIN')).toBeInTheDocument()
    expect(within(uxia).getByText('—', { selector: 'td:nth-child(6)' })).toBeInTheDocument()
  })

  it('shows a deactivated member as such', async () => {
    renderApp('/ajustes')

    const xose = (await screen.findByText('[Xosé]')).closest('tr')!
    expect(within(xose).getByText('Desactivado')).toBeInTheDocument()
  })

  it('cancels a pending invitation, and its row goes', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')
    await user.type(await screen.findByLabelText('Email'), 'brais@bar.es')
    await user.click(screen.getByRole('button', { name: 'Enviar invitación' }))
    await screen.findByText('brais@bar.es')

    await user.click(screen.getByRole('button', { name: 'Anular invitación de brais@bar.es' }))

    await waitFor(() => expect(screen.queryByText('brais@bar.es')).not.toBeInTheDocument())
  })

  it('offers only kitchen and bar, never the owner', async () => {
    renderApp('/ajustes')

    const options = within(await screen.findByLabelText('Rol')).getAllByRole('option')

    expect(options.map((option) => option.textContent)).toEqual(['Cocina', 'Barra'])
  })

  it('says why an invitation cannot be sent, such as a bad email', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    await user.type(await screen.findByLabelText('Email'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Enviar invitación' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Indica un email válido')
  })

  it('switches a member off and removes another', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    const toggle = await screen.findByRole('checkbox', { name: 'Activo [Uxía]' })
    await user.click(toggle)
    expect(toggle).not.toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Quitar [Xosé]' }))
    await waitFor(() => expect(screen.queryByText('[Xosé]')).not.toBeInTheDocument())
  })

  it('explains why the last owner cannot be removed', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    await user.click(await screen.findByRole('button', { name: 'Quitar [Titular]' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('al menos un titular')
    expect(screen.getByText('[Titular]')).toBeInTheDocument()
  })

  it('saves the bar settings', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    const phone = await screen.findByLabelText('Teléfono')
    await user.clear(phone)
    await user.type(phone, '981 000 000')
    await user.click(screen.getByRole('checkbox', { name: 'Avisar de pedidos retrasados' }))
    await user.click(screen.getByRole('button', { name: 'Guardar ajustes' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Ajustes guardados')
  })

  it('does not save settings without a bar name', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    await user.clear(await screen.findByLabelText('Nombre del bar'))
    await user.click(screen.getByRole('button', { name: 'Guardar ajustes' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Indica el nombre del bar')
  })
})
