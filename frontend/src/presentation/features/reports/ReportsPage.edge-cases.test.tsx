import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { captureDownloads } from '../../../test/capture-downloads'
import { renderApp } from '../../../test/render-app'

describe('ReportsPage edge cases', () => {
  const capture = captureDownloads()
  afterEach(() => capture.restore())

  it('exports the orders per day as CSV', async () => {
    const user = userEvent.setup()
    renderApp('/informes')

    await user.click(await screen.findByRole('button', { name: 'Exportar' }))

    expect(capture.downloads[0].name).toBe('informe.csv')
    const text = await capture.downloads[0].text
    expect(text).toContain('Día;App;Barra y mesa;Total')
    expect(text).toContain('L;2;3;5')
    expect(text).toContain('X;0;0;0')
  })

  it('shows an error when the report cannot be loaded', async () => {
    renderApp('/informes', { getReport: () => Promise.reject(new Error('down')) })

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar')
  })

  it('copes with a report without any orders', async () => {
    renderApp('/informes', {
      getReport: async () => ({
        periodLabel: 'Últimos 7 días',
        salesCents: 0,
        onTimePercent: 0,
        days: [{ day: 'L', app: 0, venue: 0, closed: false }],
        topDishes: [],
        peaks: { lunch: '—', dinner: '—', delayedOrders: 0, delayedNote: '' },
      }),
    })

    expect(await screen.findByText('0,00 €')).toBeInTheDocument()
    expect(screen.getByText('0 %')).toBeInTheDocument()
  })
})
