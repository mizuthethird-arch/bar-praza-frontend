import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

describe('CustomersPage', () => {
  it('lists customers with a masked phone', async () => {
    renderApp('/clientes')

    expect(await screen.findByText('Lucía')).toBeInTheDocument()
    expect(screen.getByText('--000')).toBeInTheDocument()
    expect(screen.getByText('Pulpo, tortilla')).toBeInTheDocument()
    expect(screen.getByText(/Los teléfonos se muestran parcialmente/)).toBeInTheDocument()
  })

  it('searches by name or last digits', async () => {
    const user = userEvent.setup()
    renderApp('/clientes')
    await screen.findByText('Lucía')

    await user.type(screen.getByLabelText('Buscar'), '002')

    expect(screen.getByText('Marcos')).toBeInTheDocument()
    expect(screen.queryByText('Lucía')).not.toBeInTheDocument()
  })

  it('filters by account type', async () => {
    const user = userEvent.setup()
    renderApp('/clientes')
    await screen.findByText('Lucía')

    await user.selectOptions(screen.getByLabelText('Tipo'), 'Con cuenta')

    expect(screen.getByText('Iria')).toBeInTheDocument()
    expect(screen.queryByText('Marcos')).not.toBeInTheDocument()
  })

  it('shows that there are no pending data requests', async () => {
    renderApp('/clientes')

    expect(await screen.findByText(/Ninguna pendiente/)).toBeInTheDocument()
  })
})
