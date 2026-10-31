import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '../../../test/render-app'

describe('LiveConsolePage edge cases', () => {
  it('does not list an event twice when a poll repeats it', async () => {
    const user = userEvent.setup()
    renderApp('/consola', {
      pollLiveEvents: async () => [{ id: 4, time: '20:50', kind: 'preparing', orderId: '#40', detail: 'repetido' }],
    })
    await screen.findAllByRole('listitem')

    await user.click(screen.getByRole('button', { name: 'Actualizar' }))

    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('shows an error when the first load fails', async () => {
    renderApp('/consola', { listLiveEvents: () => Promise.reject(new Error('down')) })

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar')
  })

  it('clears the refresh error once a refresh works again', async () => {
    const user = userEvent.setup()
    let fail = true
    renderApp('/consola', {
      pollLiveEvents: async () => {
        if (fail) throw new Error('down')
        return []
      },
    })

    await user.click(await screen.findByRole('button', { name: 'Actualizar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo actualizar')

    fail = false
    await user.click(screen.getByRole('button', { name: 'Actualizar' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('LiveConsolePage automatic refresh', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  it('adds an event every five seconds until paused', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderApp('/consola')
    await screen.findAllByRole('listitem')

    await act(() => vi.advanceTimersByTimeAsync(5000))
    expect(await screen.findByText('Listo para recoger')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Pausar' }))
    await act(() => vi.advanceTimersByTimeAsync(15000))

    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })
})
