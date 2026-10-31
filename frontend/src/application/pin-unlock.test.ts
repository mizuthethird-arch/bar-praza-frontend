import { describe, expect, it, vi } from 'vitest'
import { createMockSessionStore } from '../infrastructure/mock/mock-session-store'
import { getRememberedDevice, unlockWithPin } from './pin-unlock'

const device = { name: '[Titular]', initials: 'T', email: 'titular@barpraza.test', device: 'TABLET BARRA' }

describe('PIN unlock use case', () => {
  it('shows the device remembered for this tablet', async () => {
    const gateway = { rememberedDevice: vi.fn().mockResolvedValue(device), unlock: vi.fn() }

    await expect(getRememberedDevice(gateway)).resolves.toEqual(device)
  })

  it('starts a session when the PIN is right', async () => {
    const session = createMockSessionStore()
    const gateway = { rememberedDevice: vi.fn(), unlock: vi.fn().mockResolvedValue({ status: 'ok' }) }

    await expect(unlockWithPin(gateway, session, '1234')).resolves.toEqual({ status: 'ok' })

    expect(gateway.unlock).toHaveBeenCalledWith('1234')
    expect(session.isActive()).toBe(true)
  })

  it('reports the attempts left and does not start a session when the PIN is wrong', async () => {
    const session = createMockSessionStore()
    const gateway = { rememberedDevice: vi.fn(), unlock: vi.fn().mockResolvedValue({ status: 'wrong', attemptsLeft: 2 }) }

    await expect(unlockWithPin(gateway, session, '0000')).resolves.toEqual({ status: 'wrong', attemptsLeft: 2 })
    expect(session.isActive()).toBe(false)
  })

  it('reports the lock and does not start a session when the attempts run out', async () => {
    const session = createMockSessionStore()
    const gateway = { rememberedDevice: vi.fn(), unlock: vi.fn().mockResolvedValue({ status: 'locked' }) }

    await expect(unlockWithPin(gateway, session, '0000')).resolves.toEqual({ status: 'locked' })
    expect(session.isActive()).toBe(false)
  })
})
