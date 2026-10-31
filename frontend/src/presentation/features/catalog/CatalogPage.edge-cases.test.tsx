import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

async function openEditor() {
  const panel = await screen.findByRole('complementary', { name: 'Editar producto' })
  return { panel, user: userEvent.setup() }
}

describe('CatalogPage edge cases', () => {
  it('rejects a variant price that is not a plain number', async () => {
    renderApp('/carta')
    const { panel, user } = await openEditor()

    for (const bad of ['abc', '-5', '1e3', 'Infinity']) {
      const price = within(panel).getByLabelText('Precio Ración')
      await user.clear(price)
      await user.type(price, bad)
      await user.click(within(panel).getByRole('button', { name: 'Guardar' }))

      expect(await within(panel).findByRole('alert'), bad).toHaveTextContent('Revisa los nombres y precios')
    }
    expect(screen.queryByText(/Ración 19,00/)).toBeInTheDocument()
  })

  it('accepts a whole-number price', async () => {
    renderApp('/carta')
    const { panel, user } = await openEditor()

    const price = within(panel).getByLabelText('Precio Ración')
    await user.clear(price)
    await user.type(price, '20')
    await user.click(within(panel).getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Media 11,00 · Ración 20,00')).toBeInTheDocument()
  })

  it('does not save a new variant until it has a name and a price', async () => {
    renderApp('/carta')
    const { panel, user } = await openEditor()

    await user.click(within(panel).getByRole('button', { name: '+ Añadir variante' }))
    await user.click(within(panel).getByRole('button', { name: 'Guardar' }))

    expect(await within(panel).findByRole('alert')).toHaveTextContent('Revisa los nombres y precios')

    await user.type(within(panel).getByLabelText('Nombre de variante 3'), 'Tapa')
    await user.type(within(panel).getByLabelText('Precio Tapa'), '4,50')
    await user.click(within(panel).getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Media 11,00 · Ración 19,00 · Tapa 4,50')).toBeInTheDocument()
  })

  it('tells the user when saving fails and keeps the edit', async () => {
    renderApp('/carta', { saveProduct: () => Promise.reject(new Error('down')) })
    const { panel, user } = await openEditor()

    await user.clear(within(panel).getByLabelText('Nombre'))
    await user.type(within(panel).getByLabelText('Nombre'), 'Otro nombre')
    await user.click(within(panel).getByRole('button', { name: 'Guardar' }))

    expect(await within(panel).findByRole('alert')).toHaveTextContent('No se pudo guardar el producto')
    expect(within(panel).getByLabelText('Nombre')).toHaveValue('Otro nombre')
  })

  it('shows a message when a category has no products left', async () => {
    renderApp('/carta', { getCatalog: async () => [] })

    expect(await screen.findByText('No hay productos en esta categoría.')).toBeInTheDocument()
  })

  it('shows an error when the catalog cannot be loaded', async () => {
    renderApp('/carta', { getCatalog: () => Promise.reject(new Error('down')) })

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar')
  })

  it('keeps the draft of each product separate when switching', async () => {
    renderApp('/carta')
    const { panel, user } = await openEditor()

    await user.type(within(panel).getByLabelText('Nombre'), ' (borrador)')
    await user.click(screen.getByRole('button', { name: 'Tortilla de patatas' }))

    expect(within(screen.getByRole('complementary', { name: 'Editar producto' })).getByLabelText('Nombre')).toHaveValue(
      'Tortilla de patatas',
    )
  })
})

describe('CatalogPage toggles', () => {
  it('saves visibility, dish of the day, stock deduction and a removed allergen', async () => {
    renderApp('/carta')
    const { panel, user } = await openEditor()

    await user.click(within(panel).getByRole('checkbox', { name: 'Visible en la app de pedidos' }))
    await user.click(within(panel).getByRole('checkbox', { name: 'Plato del día (sale en «Hoy»)' }))
    await user.click(within(panel).getByRole('checkbox', { name: 'Descontar del stock' }))
    await user.click(within(panel).getByRole('checkbox', { name: 'Moluscos' }))
    await user.click(within(panel).getByRole('button', { name: 'Guardar' }))

    const row = (await screen.findByRole('button', { name: 'Pulpo á feira' })).closest('tr')!
    expect(within(row).getByText('Oculto')).toBeInTheDocument()
    expect(within(row).queryByText('Plato del día')).not.toBeInTheDocument()

    const saved = screen.getByRole('complementary', { name: 'Editar producto' })
    expect(within(saved).getByRole('checkbox', { name: 'Moluscos' })).not.toBeChecked()
    expect(within(saved).getByRole('checkbox', { name: 'Descontar del stock' })).not.toBeChecked()
  })

  it('tells the user when archiving fails and keeps the product', async () => {
    renderApp('/carta', { archiveProduct: () => Promise.reject(new Error('offline')) })
    const { panel, user } = await openEditor()

    await user.click(within(panel).getByRole('button', { name: 'Archivar' }))

    expect(await within(panel).findByRole('alert')).toHaveTextContent('No se pudo archivar el producto')
    expect(screen.getByRole('button', { name: /Pulpo á feira/ })).toBeInTheDocument()
  })
})
