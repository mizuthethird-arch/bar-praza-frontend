import { act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { RememberedDevice } from '../../domain/auth/remembered-device'
import { renderApp } from '../../test/render-app'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const unlockNever = () => new Promise<never>(() => undefined)

// An answer that arrives after the screen is gone must be dropped, not applied to a page that is not there.
describe('answers that arrive after the screen is gone', () => {
  it('drops a late session answer', async () => {
    const late = deferred<boolean>()
    const { unmount } = renderApp('/', { hasSession: () => late.promise })

    unmount()
    await act(async () => late.resolve(true))

    expect(document.body).not.toHaveTextContent('Hoy en la praza')
  })

  it('drops a late session failure', async () => {
    const late = deferred<boolean>()
    const { unmount } = renderApp('/', { hasSession: () => late.promise })

    unmount()
    await act(async () => late.reject(new Error('down')))

    expect(document.body).not.toHaveTextContent('Entrar al panel')
  })

  it('drops a late answer about the remembered device', async () => {
    const late = deferred<RememberedDevice>()
    const { unmount } = renderApp(
      '/login',
      { pinUnlock: { getRememberedDevice: () => late.promise, unlockWithPin: unlockNever } },
      { signedIn: false },
    )

    unmount()
    await act(async () =>
      late.resolve({ name: 'Owner Praza', initials: 'OP', email: 'owner@example.com', device: 'Chrome en Windows' }),
    )

    expect(document.body).not.toHaveTextContent('Desbloquear con PIN')
  })

  it('drops a late "no remembered device" answer', async () => {
    const late = deferred<RememberedDevice>()
    const { unmount } = renderApp(
      '/login',
      { pinUnlock: { getRememberedDevice: () => late.promise, unlockWithPin: unlockNever } },
      { signedIn: false },
    )

    unmount()
    await act(async () => late.reject(new Error('no device')))

    expect(document.body).not.toHaveTextContent('Desbloquear con PIN')
  })
})
