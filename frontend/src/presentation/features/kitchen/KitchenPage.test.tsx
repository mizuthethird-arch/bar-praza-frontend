import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { KitchenBoard, KitchenOrder } from '../../../domain/kitchen/kitchen'
import { renderApp } from '../../../test/render-app'
import { playChime } from './chime'

vi.mock('./chime', () => ({ playChime: vi.fn() }))

const card = (id: string) => screen.findByRole('article', { name: `Pedido ${id}` })

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(new Date(2026, 9, 31, 21, 14))
  vi.mocked(playChime).mockClear()
})
afterEach(() => vi.useRealTimers())

describe('KitchenPage', () => {
  it('shows the shift, the clock and the controls in the header', async () => {
    renderApp('/cocina')

    expect(await screen.findByRole('heading', { level: 1, name: 'Pedidos de cocina' })).toBeInTheDocument()
    expect(screen.getByText('Turno abierto · 19:02')).toBeInTheDocument()
    expect(screen.getByText('21:14')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sonido activo' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Agotados (1)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar turno' })).toBeDisabled()
  })

  it('shows four columns in order: new, in progress, ready and delivered', async () => {
    renderApp('/cocina')
    await card('#43')

    const columns = [
      screen.getByRole('region', { name: 'Nuevos' }),
      screen.getByRole('region', { name: 'En curso' }),
      screen.getByRole('region', { name: 'Listos' }),
      screen.getByRole('region', { name: 'Entregados y cobrados' }),
    ]
    const positions = columns.map((column) => column.getBoundingClientRect().left)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  it('splits the orders into new, in preparation and ready', async () => {
    renderApp('/cocina')
    await card('#43')

    const articles = (name: string) =>
      within(screen.getByRole('region', { name })).queryAllByRole('article').map((a) => a.getAttribute('aria-label'))
    expect(articles('Nuevos')).toEqual(['Pedido #43', 'Pedido #44'])
    expect(articles('En curso')).toEqual(['Pedido #42'])
    expect(articles('Listos')).toEqual(['Pedido #41'])
    expect(within(screen.getByRole('region', { name: 'Nuevos' })).getByText('2')).toBeInTheDocument()
  })

  it('shows the shift total in the history column', async () => {
    renderApp('/cocina')

    const history = within(await screen.findByRole('region', { name: 'Entregados y cobrados' }))
    expect(history.getByText('Total cobrado')).toBeInTheDocument()
    expect(history.getByText('21,50 €')).toBeInTheDocument()
  })

  it('shows a new order with its pickup countdown, note, phone and payment', async () => {
    renderApp('/cocina')
    const order = within(await card('#43'))

    expect(order.getByText('Ana')).toBeInTheDocument()
    expect(order.getByText('Recoge 21:30 · en 16 min')).toBeInTheDocument()
    expect(order.getByText('1× Tortilla de patatas · Entera')).toBeInTheDocument()
    expect(order.getByText('Nota: sin cebolla')).toBeInTheDocument()
    expect(order.getByRole('link', { name: '600 000 000' })).toHaveAttribute('href', 'tel:600000000')
    expect(order.getByText('14,00 € · paga al recoger')).toBeInTheDocument()
    expect(order.getByRole('button', { name: 'Empezar a preparar' })).toBeInTheDocument()
    expect(order.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('flags a late order in preparation', async () => {
    renderApp('/cocina')
    const order = within(await card('#42'))

    expect(order.getByText('Retrasado 4 min')).toBeInTheDocument()
    expect(order.getByText('Preparando')).toBeInTheDocument()
    expect(order.getByText('1× Croquetas de jamón · Ración (8 uds.)')).toBeInTheDocument()
    expect(order.getByRole('button', { name: 'Marcar listo' })).toBeInTheDocument()
    expect(order.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
  })

  it('shows a ready order with its pickup time and the delivery button', async () => {
    renderApp('/cocina')
    const order = within(await card('#41'))

    expect(order.getByText('Listo')).toBeInTheDocument()
    expect(order.getByText('Recoge 21:05')).toBeInTheDocument()
    expect(order.getByText('23,00 € · cobrar al entregar')).toBeInTheDocument()
    expect(order.queryByText(/Retrasado/)).not.toBeInTheDocument()
    expect(order.getByRole('button', { name: 'Entregado y cobrado' })).toBeInTheDocument()
  })

  it('moves an order through the flow until it leaves the board', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderApp('/cocina')

    await user.click(within(await card('#43')).getByRole('button', { name: 'Empezar a preparar' }))
    const inProgress = within(screen.getByRole('region', { name: 'En curso' }))
    expect(await inProgress.findByRole('article', { name: 'Pedido #43' })).toBeInTheDocument()

    await user.click(within(screen.getByRole('article', { name: 'Pedido #43' })).getByRole('button', { name: 'Marcar listo' }))
    expect(within(await card('#43')).getByText('Listo')).toBeInTheDocument()

    await user.click(within(screen.getByRole('article', { name: 'Pedido #43' })).getByRole('button', { name: 'Entregado y cobrado' }))
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(screen.queryByRole('article', { name: 'Pedido #43' })).not.toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Entregados y cobrados' })).getByText('#43')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Listos' })).queryByRole('article', { name: 'Pedido #43' })).not.toBeInTheDocument()
  })

  it('marks a ready order in blue (Listos), the way a late one is marked in red', async () => {
    renderApp('/cocina')

    const ready = await card('#41')
    expect(ready).toHaveClass('border-sky-900', 'bg-sky-950/40')
    expect(within(ready).getByText('Listo')).toHaveClass('bg-sky-900', 'text-sky-100')
    expect(within(ready).getByRole('button', { name: 'Entregado y cobrado' })).toHaveClass('bg-sky-700', 'text-white')

    const late = await card('#42')
    expect(late).toHaveClass('border-red-900', 'bg-red-950/40')
    expect(within(late).getByText('Retrasado 4 min')).toHaveClass('bg-red-900', 'text-red-100')

    expect(await card('#43')).not.toHaveClass('border-sky-900', 'border-red-900')
  })

  it('lists what was handed over and paid during the shift, newest first, in a side panel', async () => {
    renderApp('/cocina')

    const history = within(await screen.findByRole('region', { name: 'Entregados y cobrados' }))
    expect(history.getByRole('heading', { name: /Entregados y cobrados/ })).toBeInTheDocument()
    const items = history.getAllByRole('button')
    expect(items.map((card) => card.textContent?.slice(0, 3))).toEqual(['#40', '#38'])
    expect(within(items[0]).getByText('Iria')).toBeInTheDocument()
    expect(within(items[0]).getByText('Entregado 20:50')).toBeInTheDocument()
    expect(within(items[0]).getByText('9,50 €')).toBeInTheDocument()
  })

  it('puts a newly handed-over order at the top of the history with its time', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderApp('/cocina')

    await user.click(within(await card('#41')).getByRole('button', { name: 'Entregado y cobrado' }))

    const history = within(await screen.findByRole('region', { name: 'Entregados y cobrados' }))
    const items = await history.findAllByRole('button')
    expect(items.map((card) => card.textContent?.slice(0, 3))).toEqual(['#41', '#40', '#38'])
    expect(within(items[0]).getByText('Entregado 21:14')).toBeInTheDocument()
    expect(within(items[0]).getByText('23,00 €')).toBeInTheDocument()
    expect(history.getByText('44,50 €')).toBeInTheDocument()
  })

  it('gives the history column the same title format as the other columns', async () => {
    renderApp('/cocina')
    await card('#43')

    const title = (name: string) => screen.getByRole('heading', { level: 2, name: new RegExp(name) })
    expect(title('Entregados y cobrados')).toHaveClass(...title('Nuevos').className.split(' '))
  })

  it('shows each delivered order as a small green card: number, name, time and price', async () => {
    renderApp('/cocina')
    const history = within(await screen.findByRole('region', { name: 'Entregados y cobrados' }))

    const compact = history.getByRole('button', { name: /#40.*Iria.*Entregado 20:50.*9,50 €/ })
    expect(compact).toHaveClass('border-emerald-900', 'bg-neutral-900')
    expect(compact).not.toHaveClass('bg-emerald-950/40')
    expect(compact).not.toHaveClass('min-h-[24rem]')
    expect(within(compact).queryByText('1× Raxo con patatas · Media')).not.toBeInTheDocument()
  })

  it('opens the details of a delivered order in a pop-up outside the column', async () => {
    const user = userEvent.setup()
    renderApp('/cocina')

    await user.click(await screen.findByRole('button', { name: /#40.*Iria/ }))

    const dialog = await screen.findByRole('dialog', { name: 'Pedido #40 · Iria' })
    expect(dialog.closest('[aria-label="Entregados y cobrados"]')).toBeNull()
    expect(dialog).toHaveClass('bg-neutral-950', 'border-neutral-700')
    expect(dialog).not.toHaveClass('border-emerald-900')
    expect(within(dialog).getByText('1× Raxo con patatas · Media')).toBeInTheDocument()
    expect(within(dialog).getByText('1× Agua · 50 cl')).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: '600 000 005' })).toHaveAttribute('href', 'tel:600000005')
    expect(within(dialog).getByText('Recogida')).toBeInTheDocument()
    expect(within(dialog).getByText('20:44')).toBeInTheDocument()
    expect(within(dialog).getByText('Hora de entrega')).toBeInTheDocument()
    expect(within(dialog).getByText('Entregado')).toBeInTheDocument()
    expect(within(dialog).getByText('9,50 €')).toBeInTheDocument()
  })

  it('keeps the pop-up open while the board refreshes', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderApp('/cocina')

    await user.click(await screen.findByRole('button', { name: /#40.*Iria/ }))
    await act(() => vi.advanceTimersByTimeAsync(15000))

    expect(screen.getByRole('dialog', { name: 'Pedido #40 · Iria' })).toBeInTheDocument()
  })

  it('shows the shift total as a card below the delivered orders', async () => {
    renderApp('/cocina')
    const history = within(await screen.findByRole('region', { name: 'Entregados y cobrados' }))

    const lastCard = history.getAllByRole('button').at(-1)!
    const total = history.getByText('Total cobrado')
    expect(lastCard.compareDocumentPosition(total) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('says so when nothing has been handed over yet in the shift', async () => {
    renderApp('/cocina', { getKitchenBoard: async () => ({ shiftOpenedAt: '19:02', orders: [], delivered: [] }) })

    const history = within(await screen.findByRole('region', { name: 'Entregados y cobrados' }))
    expect(history.getByText('Todavía no se ha entregado ningún pedido en este turno.')).toBeInTheDocument()
  })

  it('asks before cancelling, and lets the user back out', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderApp('/cocina')
    const order = within(await card('#44'))

    await user.click(order.getByRole('button', { name: 'Cancelar' }))
    expect(order.queryByRole('button', { name: 'Empezar a preparar' })).not.toBeInTheDocument()
    await user.click(order.getByRole('button', { name: 'No' }))
    expect(order.getByRole('button', { name: 'Empezar a preparar' })).toBeInTheDocument()

    await user.click(order.getByRole('button', { name: 'Cancelar' }))
    await user.click(order.getByRole('button', { name: 'Sí, cancelar' }))
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(screen.queryByRole('article', { name: 'Pedido #44' })).not.toBeInTheDocument()
  })

  it('tells the user when a step fails and keeps the order where it was', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderApp('/cocina', { startKitchenOrder: () => Promise.reject(new Error('offline')) })

    await user.click(within(await card('#43')).getByRole('button', { name: 'Empezar a preparar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo actualizar el pedido')
    expect(within(screen.getByRole('region', { name: 'Nuevos' })).getByRole('article', { name: 'Pedido #43' })).toBeInTheDocument()
  })

  it('lists the sold-out products from the catalog', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderApp('/cocina')

    await user.click(await screen.findByRole('button', { name: 'Agotados (1)' }))

    expect(within(screen.getByRole('region', { name: 'Agotados' })).getByText('Empanada de bonito')).toBeInTheDocument()
  })

  it('shows empty columns and no sold-out count when there is nothing to show', async () => {
    renderApp('/cocina', {
      getKitchenBoard: async () => ({ shiftOpenedAt: '19:02', orders: [], delivered: [] }),
      getCatalog: () => Promise.reject(new Error('down')),
    })

    expect(await screen.findByText('No hay pedidos nuevos.')).toBeInTheDocument()
    expect(screen.getByText('Nada en curso.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Agotados' })).toBeInTheDocument()
  })

  it('shows an error when the board cannot be loaded', async () => {
    renderApp('/cocina', { getKitchenBoard: () => Promise.reject(new Error('down')) })

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar')
  })

  it('is behind the login', async () => {
    renderApp('/cocina', {}, { signedIn: false })

    expect(await screen.findByRole('form', { name: /entrar al panel/i })).toBeInTheDocument()
  })

  it('keeps the sidebar of the app', async () => {
    renderApp('/cocina')

    expect(await screen.findByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Resumen' })).toHaveAttribute('href', '/')
  })
})

describe('KitchenPage card grid', () => {
  it('gives every card the same minimum height, and lets it grow when its content is taller', async () => {
    renderApp('/cocina')
    await card('#43')

    for (const article of screen.getAllByRole('article')) {
      expect(article, article.getAttribute('aria-label') ?? '').toHaveClass('min-h-[24rem]', 'h-auto')
      expect(article, article.getAttribute('aria-label') ?? '').not.toHaveClass('h-96')
    }
  })

  it('does not scroll inside a card: long content makes the card taller', async () => {
    renderApp('/cocina')
    await card('#43')

    for (const article of screen.getAllByRole('article')) {
      expect(article.querySelector('.overflow-y-auto'), article.getAttribute('aria-label') ?? '').toBeNull()
    }
  })

  it('makes every button in a card the same full width', async () => {
    renderApp('/cocina')
    await card('#43')

    for (const article of screen.getAllByRole('article')) {
      for (const button of within(article).queryAllByRole('button')) {
        expect(button, `${article.getAttribute('aria-label')} · ${button.textContent}`).toHaveClass('w-full')
      }
    }
  })

  it('pins the buttons to the bottom of every card', async () => {
    renderApp('/cocina')
    await card('#43')

    for (const article of screen.getAllByRole('article')) {
      expect(article.querySelector('.mt-auto'), article.getAttribute('aria-label') ?? '').not.toBeNull()
    }
  })
})

describe('KitchenPage live updates', () => {
  const base: KitchenOrder = {
    id: '#50', customer: 'Noa', pickupTime: '21:40', status: 'new',
    lines: [{ quantity: 1, name: 'Café', variant: '' }], phone: '600 000 050', totalCents: 150,
  }
  const boards = (): KitchenBoard[] => [
    { shiftOpenedAt: '19:02', orders: [], delivered: [] },
    { shiftOpenedAt: '19:02', orders: [base], delivered: [] },
    { shiftOpenedAt: '19:02', orders: [base], delivered: [] },
  ]
  const polled = () => {
    const queue = boards()
    return async () => queue.shift() ?? { shiftOpenedAt: '19:02', orders: [base], delivered: [] }
  }

  it('picks up orders from other devices and chimes once for each new one', async () => {
    renderApp('/cocina', { getKitchenBoard: polled() })
    await screen.findByText('No hay pedidos nuevos.')
    expect(playChime).not.toHaveBeenCalled()

    await act(() => vi.advanceTimersByTimeAsync(15000))
    expect(await screen.findByRole('article', { name: 'Pedido #50' })).toBeInTheDocument()
    expect(playChime).toHaveBeenCalledTimes(1)

    await act(() => vi.advanceTimersByTimeAsync(15000))
    expect(playChime).toHaveBeenCalledTimes(1)
  })

  it('stays quiet when the sound is off', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderApp('/cocina', { getKitchenBoard: polled() })

    await user.click(await screen.findByRole('button', { name: 'Sonido activo' }))
    expect(screen.getByRole('button', { name: 'Sonido apagado' })).toBeInTheDocument()
    await act(() => vi.advanceTimersByTimeAsync(15000))

    expect(await screen.findByRole('article', { name: 'Pedido #50' })).toBeInTheDocument()
    expect(playChime).not.toHaveBeenCalled()
  })

  it('keeps the board when a refresh fails', async () => {
    let calls = 0
    renderApp('/cocina', {
      getKitchenBoard: async () => {
        calls += 1
        if (calls > 1) throw new Error('offline')
        return { shiftOpenedAt: '19:02', orders: [base], delivered: [] }
      },
    })
    await screen.findByRole('article', { name: 'Pedido #50' })

    await act(() => vi.advanceTimersByTimeAsync(15000))

    expect(screen.getByRole('article', { name: 'Pedido #50' })).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo actualizar')
  })

  it('moves the clock and the countdown forward', async () => {
    renderApp('/cocina')
    await screen.findByText('Recoge 21:30 · en 16 min')

    await act(() => vi.advanceTimersByTimeAsync(60_000))

    expect(screen.getByText('21:15')).toBeInTheDocument()
    expect(screen.getByText('Recoge 21:30 · en 15 min')).toBeInTheDocument()
  })
})
