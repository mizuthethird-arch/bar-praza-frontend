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

  it('resends a pending invitation, and it keeps its row', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')
    await user.type(await screen.findByLabelText('Email'), 'brais@bar.es')
    await user.click(screen.getByRole('button', { name: 'Enviar invitación' }))
    await screen.findByText('brais@bar.es')

    await user.click(screen.getByRole('button', { name: 'Reenviar invitación a brais@bar.es' }))

    expect(await screen.findByText('brais@bar.es')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('tells the user the invitation will be sent, in a notice at the top', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')
    await user.type(await screen.findByLabelText('Email'), 'brais@bar.es')
    await user.click(screen.getByRole('button', { name: 'Enviar invitación' }))
    await screen.findByText('brais@bar.es')

    await user.click(screen.getByRole('button', { name: 'Reenviar invitación a brais@bar.es' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Se enviará la invitación a brais@bar.es')
  })

  it('edits the name and role of a staff member in a pop-up, and the row shows them', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')
    await user.click(await screen.findByRole('button', { name: 'Editar [Uxía]' }))

    const dialog = await screen.findByRole('dialog', { name: 'Editar · [Uxía]' })
    const name = within(dialog).getByLabelText('Nombre')
    await user.clear(name)
    await user.type(name, 'Uxía Pérez')
    await user.selectOptions(within(dialog).getByLabelText('Rol'), 'bar')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    const row = (await screen.findByText('Uxía Pérez')).closest('tr')!
    expect(within(row).getByText('Barra')).toBeInTheDocument()
    expect(screen.queryByText('[Uxía]')).not.toBeInTheDocument()
  })

  it('leaves the member as they were when the pop-up is closed with Cancelar', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')
    await user.click(await screen.findByRole('button', { name: 'Editar [Uxía]' }))
    const dialog = await screen.findByRole('dialog', { name: 'Editar · [Uxía]' })
    await user.type(within(dialog).getByLabelText('Nombre'), ' extra')

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByText('[Uxía]')).toBeInTheDocument()
  })

  it('shows the owner role as fixed in the pop-up, with no role to choose', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')
    await user.click(await screen.findByRole('button', { name: 'Editar [Titular]' }))

    const dialog = await screen.findByRole('dialog', { name: 'Editar · [Titular]' })
    expect(within(dialog).getByLabelText('Nombre')).toBeInTheDocument()
    expect(within(dialog).queryByLabelText('Rol')).not.toBeInTheDocument()
    expect(within(dialog).getByText('Titular (no se puede cambiar)')).toBeInTheDocument()
  })

  it('sets a PIN for a staff member in a pop-up, and confirms it with a notice', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')
    await user.click(await screen.findByRole('button', { name: 'Poner PIN de [Uxía]' }))

    const dialog = await screen.findByRole('dialog', { name: 'Poner PIN · [Uxía]' })
    await user.type(within(dialog).getByLabelText(/PIN nuevo/), '1234')
    await user.type(within(dialog).getByLabelText('Repite el PIN'), '1234')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar PIN' }))

    expect(await screen.findByRole('status')).toHaveTextContent('PIN guardado para [Uxía]')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    const row = screen.getByText('[Uxía]').closest('tr')!
    expect(within(row).getByText('Configurado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cambiar PIN de [Uxía]' })).toBeInTheDocument()
  })

  it('keeps only digits in the PIN fields', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')
    await user.click(await screen.findByRole('button', { name: 'Poner PIN de [Uxía]' }))
    const dialog = await screen.findByRole('dialog', { name: 'Poner PIN · [Uxía]' })

    await user.type(within(dialog).getByLabelText(/PIN nuevo/), 'a1b2c3d4e5')

    expect(within(dialog).getByLabelText(/PIN nuevo/)).toHaveValue('1234')
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

  it('deactivates a member, and reactivates them later', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    await user.click(await screen.findByRole('button', { name: 'Desactivar [Uxía]' }))
    const row = (await screen.findByText('[Uxía]')).closest('tr')!
    expect(within(row).getByText('Desactivado')).toBeInTheDocument()

    await user.click(within(row).getByRole('button', { name: 'Reactivar [Uxía]' }))
    expect(await within(row).findByText('Activo', { selector: 'span' })).toBeInTheDocument()
  })

  it('deletes a staff member from the edit pop-up, once confirmed', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')
    await user.click(await screen.findByRole('button', { name: 'Editar [Xosé]' }))
    const dialog = await screen.findByRole('dialog', { name: 'Editar · [Xosé]' })

    await user.click(within(dialog).getByRole('button', { name: 'Eliminar miembro' }))
    await user.click(within(dialog).getByRole('button', { name: 'Sí, eliminar' }))

    await waitFor(() => expect(screen.queryByText('[Xosé]')).not.toBeInTheDocument())
    expect(screen.getByRole('status')).toHaveTextContent('[Xosé] eliminado del equipo')
  })

  it('keeps the member when the deletion is not confirmed', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')
    await user.click(await screen.findByRole('button', { name: 'Editar [Xosé]' }))
    const dialog = await screen.findByRole('dialog', { name: 'Editar · [Xosé]' })

    await user.click(within(dialog).getByRole('button', { name: 'Eliminar miembro' }))
    await user.click(within(dialog).getByRole('button', { name: 'No' }))

    expect(within(dialog).queryByRole('button', { name: 'Sí, eliminar' })).not.toBeInTheDocument()
    expect(screen.getByText('[Xosé]')).toBeInTheDocument()
  })

  it('never offers to delete a staff member', async () => {
    renderApp('/ajustes')
    await screen.findByText('[Titular]')

    expect(screen.queryByRole('button', { name: /Quitar/ })).not.toBeInTheDocument()
  })

  it('explains why the last owner cannot be deactivated', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    await user.click(await screen.findByRole('button', { name: 'Desactivar [Titular]' }))

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
