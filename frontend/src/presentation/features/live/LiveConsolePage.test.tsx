import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { LiveEvent } from '../../../domain/live/live-console'
import { renderApp } from '../../../test/render-app'

// The server's push, in a test: the page's watch is kept, so the test can send an event through it.
function liveFeed() {
  const feed = { send: (_event: LiveEvent) => {}, stop: vi.fn() }
  const watchLiveEvents = (onEvent: (event: LiveEvent) => void) => {
    feed.send = (event) => onEvent(event)
    return feed.stop
  }
  return { feed, watchLiveEvents }
}

const delayed: LiveEvent = { id: 9, time: '21:20', kind: 'delayed', orderId: '#42', detail: 'Hora de recogida superada' }
const ready: LiveEvent = { id: 10, time: '21:21', kind: 'ready', orderId: '#41', detail: 'Listo para recoger' }

describe('LiveConsolePage', () => {
  it('shows the events received so far, newest first', async () => {
    renderApp('/consola')

    const items = await screen.findAllByRole('listitem')
    expect(items).toHaveLength(4)
    expect(items[0]).toHaveTextContent('Preparando · [Uxía], consola')
  })

  it('counts the orders received', async () => {
    renderApp('/consola')

    const card = (await screen.findByText('Pedidos recibidos')).parentElement!
    expect(within(card).getByText('3')).toBeInTheDocument()
  })

  it('adds an event as soon as the server sends it', async () => {
    const { feed, watchLiveEvents } = liveFeed()
    renderApp('/consola', { watchLiveEvents })
    await screen.findAllByRole('listitem')

    act(() => feed.send(ready))

    expect(await screen.findByText('Listo para recoger')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })

  it('counts a delayed order as soon as it arrives', async () => {
    const { feed, watchLiveEvents } = liveFeed()
    renderApp('/consola', { watchLiveEvents })
    await screen.findAllByRole('listitem')

    act(() => feed.send(delayed))

    const card = (await screen.findByText('Retrasados')).parentElement!
    expect(await within(card).findByText('1')).toBeInTheDocument()
  })

  it('holds new events while paused, and adds them on resume', async () => {
    const user = userEvent.setup()
    const { feed, watchLiveEvents } = liveFeed()
    renderApp('/consola', { watchLiveEvents })
    await screen.findAllByRole('listitem')

    await user.click(screen.getByRole('button', { name: 'Pausar' }))
    act(() => feed.send(ready))

    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByText('Datos de demostración · en pausa · 1 nuevos')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reanudar' }))

    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getByText('Datos de demostración · en tiempo real')).toBeInTheDocument()
  })

  it('stops watching when the page is left', async () => {
    const { feed, watchLiveEvents } = liveFeed()
    const { unmount } = renderApp('/consola', { watchLiveEvents })
    await screen.findAllByRole('listitem')

    unmount()

    expect(feed.stop).toHaveBeenCalledTimes(1)
  })
})
