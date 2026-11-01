import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { KitchenBoard, KitchenOrder } from '../../../domain/kitchen/kitchen'
import { createDemoServices } from '../../../infrastructure/mock/demo-services'
import { renderApp } from '../../../test/render-app'
import { playChime, unlockSound } from './chime'

// The browser holds the chime back until the page is pressed: playChime reports that, and
// unlockSound reports whether the browser has now let the page make sound.
vi.mock('./chime', () => ({ playChime: vi.fn(() => false), unlockSound: vi.fn(() => Promise.resolve(false)) }))

// The board's watch in a test: the page keeps the handler, and the test sends a board through it as the server would.
function boardFeed() {
  let send: (board: KitchenBoard) => void = () => {}
  return {
    send: (board: KitchenBoard) => send(board),
    watchKitchenBoard: (onBoard: (board: KitchenBoard) => void) => {
      send = onBoard
      return () => {}
    },
  }
}

const order = (id: string): KitchenOrder => ({
  id, customer: 'Noa', pickupTime: '21:40', status: 'new', phone: '600 000 050', totalCents: 500,
  lines: [{ quantity: 1, name: 'Agua', variant: '' }],
})

// The board as it is now, and the same board with one new order from another device.
async function boardAndNewOrder() {
  const now = await createDemoServices({ loginDelayMs: 0, signedIn: true }).getKitchenBoard()
  return { now, arrived: { ...now, orders: [...now.orders, order('#50')] } }
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
    const { now, arrived } = await boardAndNewOrder()
    const feed = boardFeed()
    renderApp('/cocina', { getKitchenBoard: async () => now, watchKitchenBoard: feed.watchKitchenBoard })
    await screen.findByRole('heading', { level: 1, name: 'Pedidos de cocina' })
    await act(() => Promise.resolve())

    act(() => feed.send(arrived))

    expect(playChime).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('button', { name: 'Toca para activar el sonido' })).toBeInTheDocument()
  })

  it('chimes once for each order that arrives in the same change', async () => {
    const { now } = await boardAndNewOrder()
    const feed = boardFeed()
    renderApp('/cocina', { getKitchenBoard: async () => now, watchKitchenBoard: feed.watchKitchenBoard })
    await screen.findByRole('heading', { level: 1, name: 'Pedidos de cocina' })
    await act(() => Promise.resolve())

    act(() => feed.send({ ...now, orders: [...now.orders, order('#51'), order('#52'), order('#53')] }))

    expect(playChime).toHaveBeenCalledWith(3)
  })

  it('becomes active on a press when the browser then lets the page make sound', async () => {
    vi.mocked(unlockSound).mockImplementation(() => Promise.resolve(true))
    const { now, arrived } = await boardAndNewOrder()
    const feed = boardFeed()
    renderApp('/cocina', { getKitchenBoard: async () => now, watchKitchenBoard: feed.watchKitchenBoard })
    await screen.findByRole('heading', { level: 1, name: 'Pedidos de cocina' })
    await act(() => Promise.resolve())
    act(() => feed.send(arrived))
    await screen.findByRole('button', { name: 'Toca para activar el sonido' })

    fireEvent.pointerDown(document.body)

    expect(await screen.findByRole('button', { name: 'Sonido activo' })).toBeInTheDocument()
    expect(unlockSound).toHaveBeenCalled()
  })

  it('turns the sound on with a press on the waiting button, and does not switch it off again', async () => {
    vi.mocked(unlockSound).mockImplementation(() => Promise.resolve(true))
    const { now, arrived } = await boardAndNewOrder()
    const feed = boardFeed()
    renderApp('/cocina', { getKitchenBoard: async () => now, watchKitchenBoard: feed.watchKitchenBoard })
    await screen.findByRole('heading', { level: 1, name: 'Pedidos de cocina' })
    await act(() => Promise.resolve())
    act(() => feed.send(arrived))
    const waiting = await screen.findByRole('button', { name: 'Toca para activar el sonido' })

    // A real press is a pointer-down, then a click on the same button, in separate tasks: the page
    // can update between them, so the flush below is what makes this test match a real press.
    fireEvent.pointerDown(waiting)
    await act(() => Promise.resolve())
    fireEvent.click(waiting)

    expect(await screen.findByRole('button', { name: 'Sonido activo' })).toBeInTheDocument()
  })

  it('keeps asking for a press when the browser still refuses the sound', async () => {
    const { now, arrived } = await boardAndNewOrder()
    const feed = boardFeed()
    renderApp('/cocina', { getKitchenBoard: async () => now, watchKitchenBoard: feed.watchKitchenBoard })
    await screen.findByRole('heading', { level: 1, name: 'Pedidos de cocina' })
    await act(() => Promise.resolve())
    act(() => feed.send(arrived))
    await screen.findByRole('button', { name: 'Toca para activar el sonido' })

    fireEvent.pointerDown(document.body)
    await act(() => Promise.resolve())

    expect(screen.getByRole('button', { name: 'Toca para activar el sonido' })).toBeInTheDocument()
  })
})
