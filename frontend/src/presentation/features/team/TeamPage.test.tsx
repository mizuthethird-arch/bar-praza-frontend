import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createDemoServices } from '../../../infrastructure/mock/demo-services'
import { renderApp } from '../../../test/render-app'

describe('TeamPage', () => {
  it('lists the staff with their roles', async () => {
    renderApp('/ajustes')

    const row = (await screen.findByText('[Titular]')).closest('tr')!
    expect(within(row).getByText('Titular')).toBeInTheDocument()
    expect(within(row).getByText('Activa')).toBeInTheDocument()
    expect(within(row).getByText('Sí')).toBeInTheDocument()
    expect(within(row).getByText('TABLET BARRA')).toBeInTheDocument()
    expect(within(row).getByText('Hoy, 09:42')).toBeInTheDocument()
    const kitchenRow = (await screen.findByText('[Uxía]')).closest('tr')!
    expect(within(kitchenRow).getByText('Cocina')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Último acceso' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Personal y ajustes' })).toHaveAttribute('href', '/ajustes')
  })

  it('shows invited and deactivated states as well as active state', async () => {
    const original = await createDemoServices({ loginDelayMs: 0 }).getTeam()
    const team = { ...original, members: [{ ...original.members[0], invited: true }, { ...original.members[1], active: false }] }
    renderApp('/ajustes', { getTeam: () => Promise.resolve(team) })
    expect(await screen.findByText('Invitada')).toBeInTheDocument()
    expect(screen.getByText('Desactivada')).toBeInTheDocument()
  })

  it('adds a member', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    await user.type(await screen.findByLabelText('Nombre del miembro'), 'Brais')
    await user.selectOptions(screen.getByLabelText('Rol'), 'Barra')
    await user.click(screen.getByRole('button', { name: 'Añadir' }))

    const row = (await screen.findByText('Brais')).closest('tr')!
    expect(within(row).getByText('Barra')).toBeInTheDocument()
  })

  it('does not add a member without a name', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    await user.click(await screen.findByRole('button', { name: 'Añadir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Indica un nombre')
  })

  it('switches a member off and removes another', async () => {
    const user = userEvent.setup()
    renderApp('/ajustes')

    const toggle = await screen.findByRole('checkbox', { name: 'Activo [Uxía]' })
    await user.click(toggle)
    expect(toggle).not.toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Quitar [Xosé]' }))
    expect(screen.queryByText('[Xosé]')).not.toBeInTheDocument()
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
