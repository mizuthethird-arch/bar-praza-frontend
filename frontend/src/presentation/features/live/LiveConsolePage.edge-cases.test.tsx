import { act, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { LiveEvent } from '../../../domain/live/live-console'
import { renderApp } from '../../../test/render-app'

describe('LiveConsolePage edge cases', () => {
  it('does not list an event twice when the server repeats it', async () => {
    let send: (event: LiveEvent) => void = () => {}
    renderApp('/consola', {
      watchLiveEvents: (onEvent) => {
        send = onEvent
        return () => {}
      },
    })
    await screen.findAllByRole('listitem')

    act(() => send({ id: 4, time: '20:50', kind: 'preparing', orderId: '#40', detail: 'repetido' }))

    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('shows an error when the first load fails', async () => {
    renderApp('/consola', { listLiveEvents: () => Promise.reject(new Error('down')) })

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar')
  })
})
