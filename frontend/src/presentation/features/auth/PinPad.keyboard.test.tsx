import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { PinResult } from '../../../domain/auth/pin'
import { renderApp } from '../../../test/render-app'

const device = { name: 'Owner Praza', initials: 'OP', email: 'owner@example.com', device: 'Chrome en Windows' }
const pinUnlock = (unlockWithPin: (pin: string) => Promise<PinResult>) => ({
  getRememberedDevice: () => Promise.resolve(device),
  unlockWithPin,
})

describe('PIN keypad on the keyboard', () => {
  it('erases the last digit with Backspace and ignores any other key', async () => {
    const user = userEvent.setup()
    renderApp('/login/pin', {}, { signedIn: false })
    await screen.findByRole('status', { name: 'PIN, 0 de 4 cifras' })

    await user.keyboard('12')
    expect(screen.getByRole('status', { name: 'PIN, 2 de 4 cifras' })).toBeInTheDocument()
    await user.keyboard('{Backspace}')
    expect(screen.getByRole('status', { name: 'PIN, 1 de 4 cifras' })).toBeInTheDocument()
    await user.keyboard('a')
    expect(screen.getByRole('status', { name: 'PIN, 1 de 4 cifras' })).toBeInTheDocument()
  })

  it('says so when the PIN could not be checked for another reason', async () => {
    const user = userEvent.setup()
    renderApp('/login/pin', { pinUnlock: pinUnlock(() => Promise.reject(new Error('down'))) }, { signedIn: false })
    await screen.findByRole('heading', { name: 'Hola, Owner Praza' })

    await user.keyboard('1234')

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo entrar. Inténtalo de nuevo.')
  })

  it('ignores digits and Backspace while a PIN is being checked', async () => {
    const user = userEvent.setup()
    let answer!: (result: PinResult) => void
    const unlock = vi.fn(() => new Promise<PinResult>((resolve) => (answer = resolve)))
    renderApp('/login/pin', { pinUnlock: pinUnlock(unlock) }, { signedIn: false })
    await screen.findByRole('heading', { name: 'Hola, Owner Praza' })

    await user.keyboard('1234')
    await user.keyboard('5')
    await user.keyboard('{Backspace}')

    expect(unlock).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status', { name: 'PIN, 4 de 4 cifras' })).toBeInTheDocument()
    answer({ status: 'wrong', attemptsLeft: 2 })
    expect(await screen.findByRole('alert')).toHaveTextContent('Te quedan 2 intentos')
  })
})
