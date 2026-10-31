import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

describe('CatalogPage', () => {
  it('shows the category tabs with counts and the products of the first one', async () => {
    renderApp('/carta')

    expect(await screen.findByRole('button', { name: 'Raciones · 6' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Postres · 2' })).toBeInTheDocument()
    const row = screen.getByRole('button', { name: /Pulpo á feira/ }).closest('tr')!
    expect(within(row).getByText('Media 11,00 · Ración 19,00')).toBeInTheDocument()
    expect(within(row).getByText('Plato del día')).toBeInTheDocument()
  })

  it('flags low stock and automatically sold-out products', async () => {
    renderApp('/carta')

    expect(await screen.findByText('0,6 kg · bajo')).toBeInTheDocument()
    expect(screen.getByText('Agotado auto')).toBeInTheDocument()
    expect(screen.getByText('Solo en barra')).toBeInTheDocument()
  })

  it('switches category', async () => {
    const user = userEvent.setup()
    renderApp('/carta')

    await user.click(await screen.findByRole('button', { name: 'Postres · 2' }))

    expect(screen.getByRole('button', { name: /Tarta de queixo/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Pulpo á feira/ })).not.toBeInTheDocument()
  })

  it('edits the selected product and saves it', async () => {
    const user = userEvent.setup()
    renderApp('/carta')

    const panel = await screen.findByRole('complementary', { name: 'Editar producto' })
    expect(within(panel).getByRole('heading', { name: 'Editar · Pulpo á feira' })).toBeInTheDocument()
    expect(within(panel).getByRole('checkbox', { name: 'Moluscos' })).toBeChecked()
    expect(within(panel).getByRole('checkbox', { name: 'Gluten' })).not.toBeChecked()

    await user.clear(within(panel).getByLabelText('Nombre'))
    await user.type(within(panel).getByLabelText('Nombre'), 'Pulpo gallego')
    await user.click(within(panel).getByRole('checkbox', { name: 'Gluten' }))
    await user.click(within(panel).getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByRole('button', { name: /Pulpo gallego/ })).toBeInTheDocument()
    expect(within(screen.getByRole('complementary', { name: 'Editar producto' })).getByRole('checkbox', { name: 'Gluten' })).toBeChecked()
  })

  it('updates the price of a variant', async () => {
    const user = userEvent.setup()
    renderApp('/carta')

    const panel = await screen.findByRole('complementary', { name: 'Editar producto' })
    const price = within(panel).getByLabelText('Precio Ración')
    await user.clear(price)
    await user.type(price, '20,00')
    await user.click(within(panel).getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Media 11,00 · Ración 20,00')).toBeInTheDocument()
  })

  it('does not save a product without a name', async () => {
    const user = userEvent.setup()
    renderApp('/carta')

    const panel = await screen.findByRole('complementary', { name: 'Editar producto' })
    await user.clear(within(panel).getByLabelText('Nombre'))
    await user.click(within(panel).getByRole('button', { name: 'Guardar' }))

    expect(await within(panel).findByRole('alert')).toHaveTextContent('Indica un nombre')
  })

  it('archives a product', async () => {
    const user = userEvent.setup()
    renderApp('/carta')

    await user.click(await screen.findByRole('button', { name: 'Archivar' }))

    expect(screen.queryByRole('button', { name: /Pulpo á feira/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Raciones · 5' })).toBeInTheDocument()
  })
})
