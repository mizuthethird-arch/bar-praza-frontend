import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp } from '../../../test/render-app'

describe('ReportsPage', () => {
  it('shows the key figures of the period', async () => {
    renderApp('/informes')

    expect(await screen.findByText('54')).toBeInTheDocument()
    expect(screen.getByText('812,00 €')).toBeInTheDocument()
    expect(screen.getByText('89 %')).toBeInTheDocument()
    expect(screen.getByText('Necesita el recuento de WhatsApp')).toBeInTheDocument()
  })

  it('charts the orders per day and marks the closed day', async () => {
    renderApp('/informes')

    const chart = (await screen.findByRole('img', { name: /Pedidos por día/ }))
    expect(within(chart).getByText('15')).toBeInTheDocument()
    expect(within(chart).getByText('cerrado')).toBeInTheDocument()
  })

  it('ranks the most ordered dishes', async () => {
    renderApp('/informes')

    expect(await screen.findByText('1. Tortilla de patatas')).toBeInTheDocument()
    expect(screen.getByText('31')).toBeInTheDocument()
    expect(screen.getByText('5. Bocadillo de calamares')).toBeInTheDocument()
  })

  it('shows the peak hours', async () => {
    renderApp('/informes')

    expect(await screen.findByText('13:30–14:30')).toBeInTheDocument()
    expect(screen.getByText('21:00–22:00')).toBeInTheDocument()
    expect(screen.getByText(/casi todos el sábado/)).toBeInTheDocument()
  })
})
