import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

describe('DashboardPage', () => {
  it('shows the figures computed from today’s orders', async () => {
    renderApp('/')

    expect(await screen.findByText('71,50 €')).toBeInTheDocument()
    expect(screen.getByText('14,30 €')).toBeInTheDocument()
    expect(screen.getByText('2 nuevos · 2 en curso')).toBeInTheDocument()
    expect(screen.getByText('5 pedidos')).toBeInTheDocument()
  })

  it('lists the orders with their status', async () => {
    renderApp('/')

    const row = (await screen.findByText('#42')).closest('tr')!
    expect(within(row).getByText('21:10 · retrasado')).toBeInTheDocument()
    expect(within(row).getByText('Preparando')).toBeInTheDocument()
  })

  it('lists the menu with prices, allergens and sold-out dishes', async () => {
    renderApp('/')

    const sold = (await screen.findByText('Empanada de bonito')).closest('tr')!
    expect(within(sold).getByText('4,50 €')).toBeInTheDocument()
    expect(within(sold).getByText('Gluten, pescado, huevo')).toBeInTheDocument()
    expect(within(sold).getByText('Agotado')).toBeInTheDocument()
  })

  it('shows a loading message while the data is on its way', async () => {
    renderApp('/', { getDashboard: () => new Promise(() => {}) })

    expect(await screen.findByRole('status')).toHaveTextContent('Cargando')
  })

  it('shows an error message when the dashboard cannot be loaded', async () => {
    renderApp('/', { getDashboard: () => Promise.reject(new Error('down')) })

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar')
  })
})
