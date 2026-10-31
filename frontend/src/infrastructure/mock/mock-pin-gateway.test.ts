import { describe, expect, it } from 'vitest'
import { createMockPinGateway } from './mock-pin-gateway'
import { createMockSessionStore } from './mock-session-store'

describe('mock PIN gateway', () => {
  it('shows the remembered device of the demo owner', async () => {
    const gateway = createMockPinGateway({ delayMs: 0, session: createMockSessionStore() })

    await expect(gateway.rememberedDevice()).resolves.toMatchObject({
      email: 'titular@barpraza.test',
      device: 'TABLET BARRA',
    })
  })

  it('accepts the demo PIN and starts the session', async () => {
    const session = createMockSessionStore()
    const gateway = createMockPinGateway({ delayMs: 0, session })

    await expect(gateway.unlock('1234')).resolves.toEqual({ status: 'ok' })
    expect(session.isActive()).toBe(true)
  })

  it('does not start a session for a wrong PIN', async () => {
    const session = createMockSessionStore()
    const gateway = createMockPinGateway({ delayMs: 0, maxAttempts: 3, session })

    await expect(gateway.unlock('0000')).resolves.toEqual({ status: 'wrong', attemptsLeft: 2 })
    expect(session.isActive()).toBe(false)
  })

  it('counts down the attempts on each wrong PIN, then locks', async () => {
    const gateway = createMockPinGateway({ delayMs: 0, maxAttempts: 3, session: createMockSessionStore() })

    await expect(gateway.unlock('0000')).resolves.toEqual({ status: 'wrong', attemptsLeft: 2 })
    await expect(gateway.unlock('0000')).resolves.toEqual({ status: 'wrong', attemptsLeft: 1 })
    await expect(gateway.unlock('0000')).resolves.toEqual({ status: 'locked' })
  })

  it('stays locked, even for the right PIN, until the page is reloaded', async () => {
    const gateway = createMockPinGateway({ delayMs: 0, maxAttempts: 1, session: createMockSessionStore() })

    await gateway.unlock('0000')

    await expect(gateway.unlock('1234')).resolves.toEqual({ status: 'locked' })
  })
})
