import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDemoServices } from '../../../infrastructure/mock/demo-services'
import { renderApp } from '../../../test/render-app'
import { playChime, unlockSound } from './chime'

// The browser holds the chime back until the page is pressed: playChime reports that, and
// unlockSound reports whether the browser has now let the page make sound.
vi.mock('./chime', () => ({ playChime: vi.fn(() => false), unlockSound: vi.fn(() => Promise.resolve(false)) }))

// The board as the first poll sees it, then the same board with one new order from another device.
async function pollsWithNewOrder() {
  const demo = createDemoServices({ loginDelayMs: 0, signedIn: true })
  const first = await demo.getKitchenBoard()
  const arrived = {
    ...first,
    orders: [
      ...first.orders,
      { id: '#50', customer: 'Noa', pickupTime: '21:40', status: 'new' as const, phone: '600 000 050', totalCents: 500, lines: [{ quantity: 1, name: 'Agua', variant: '' }] },
    ],
  }
  let polls = 0
  return async () => (++polls === 1 ? first : arrived)
}

describe('kitchen sound when the browser holds it back', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.mocked(playChime).mockClear()
    vi.mocked(unlockSound).mockClear()
    vi.mocked(unlockSound).mockImplementation(() => Promise.resolve(false))
  })
  afterEach(() => vi.useRealTimers())

  it('asks for a press when a new order chimes before the page was pressed', async () => {
    renderApp('/cocina', { getKitchenBoard: await pollsWithNewOrder() })
    await screen.findByRole('heading', { level: 1, name: 'Pedidos de cocina' })

    await act(() => vi.advanceTimersByTimeAsync(15000))

    expect(playChime).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('button', { name: 'Toca para activar el sonido' })).toBeInTheDocument()
  })

  it('becomes active on a press when the browser then lets the page make sound', async () => {
    vi.mocked(unlockSound).mockImplementation(() => Promise.resolve(true))
    renderApp('/cocina', { getKitchenBoard: await pollsWithNewOrder() })
    await screen.findByRole('heading', { level: 1, name: 'Pedidos de cocina' })
    await act(() => vi.advanceTimersByTimeAsync(15000))
    await screen.findByRole('button', { name: 'Toca para activar el sonido' })

    fireEvent.pointerDown(document.body)

    expect(await screen.findByRole('button', { name: 'Sonido activo' })).toBeInTheDocument()
    expect(unlockSound).toHaveBeenCalled()
  })

  it('turns the sound on with a press on the waiting button, and does not switch it off again', async () => {
    vi.mocked(unlockSound).mockImplementation(() => Promise.resolve(true))
    renderApp('/cocina', { getKitchenBoard: await pollsWithNewOrder() })
    await screen.findByRole('heading', { level: 1, name: 'Pedidos de cocina' })
    await act(() => vi.advanceTimersByTimeAsync(15000))
    const waiting = await screen.findByRole('button', { name: 'Toca para activar el sonido' })

    // A real press is a pointer-down, then a click on the same button, in separate tasks: the page
    // can update between them, so the flush below is what makes this test match a real press.
    fireEvent.pointerDown(waiting)
    await act(() => Promise.resolve())
    fireEvent.click(waiting)

    expect(await screen.findByRole('button', { name: 'Sonido activo' })).toBeInTheDocument()
  })

  it('keeps asking for a press when the browser still refuses the sound', async () => {
    renderApp('/cocina', { getKitchenBoard: await pollsWithNewOrder() })
    await screen.findByRole('heading', { level: 1, name: 'Pedidos de cocina' })
    await act(() => vi.advanceTimersByTimeAsync(15000))
    await screen.findByRole('button', { name: 'Toca para activar el sonido' })

    fireEvent.pointerDown(document.body)
    await act(() => Promise.resolve())

    expect(screen.getByRole('button', { name: 'Toca para activar el sonido' })).toBeInTheDocument()
  })
})
