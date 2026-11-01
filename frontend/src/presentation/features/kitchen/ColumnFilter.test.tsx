import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

const visibility = () => within(screen.getByRole('group', { name: 'Mostrar columnas' }))
const columnsOnBoard = () => ['Nuevos', 'En curso', 'Listos', 'Entregados y cobrados'].filter((name) => screen.queryByRole('region', { name }))

describe('showing and hiding the kitchen columns', () => {
  it('shows all four columns at first, with Todos pressed', async () => {
    renderApp('/cocina')
    await screen.findByRole('region', { name: 'Nuevos' })

    expect(visibility().getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true')
    expect(columnsOnBoard()).toHaveLength(4)
  })

  it('shows only the new orders, and then only the new, in progress and ready ones', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')
    await screen.findByRole('region', { name: 'Nuevos' })

    await user.click(visibility().getByRole('button', { name: 'En curso' }))
    await user.click(visibility().getByRole('button', { name: 'Listos' }))
    await user.click(visibility().getByRole('button', { name: 'Entregados' }))
    expect(columnsOnBoard()).toEqual(['Nuevos'])
    expect(visibility().getByRole('button', { name: 'Nuevos' })).toBeDisabled()

    await user.click(visibility().getByRole('button', { name: 'En curso' }))
    await user.click(visibility().getByRole('button', { name: 'Listos' }))
    expect(columnsOnBoard()).toEqual(['Nuevos', 'En curso', 'Listos'])
    expect(visibility().getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('brings every column back with Todos', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')
    await screen.findByRole('region', { name: 'Nuevos' })

    await user.click(visibility().getByRole('button', { name: 'Nuevos' }))
    expect(columnsOnBoard()).toHaveLength(3)

    await user.click(visibility().getByRole('button', { name: 'Todos' }))
    expect(columnsOnBoard()).toHaveLength(4)
  })
})
