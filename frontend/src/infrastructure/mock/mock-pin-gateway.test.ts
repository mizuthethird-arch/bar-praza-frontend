import { describe, expect, it } from 'vitest'
import { createMockPinGateway } from './mock-pin-gateway'

describe('mock PIN gateway', () => {
  it('shows the remembered device of the demo owner', async () => {
    const gateway = createMockPinGateway({ delayMs: 0 })

    await expect(gateway.rememberedDevice()).resolves.toMatchObject({
      email: 'titular@barpraza.test',
      device: 'TABLET BARRA',
    })
  })

  it('accepts the demo PIN', async () => {
    const gateway = createMockPinGateway({ delayMs: 0 })

    await expect(gateway.unlock('1234')).resolves.toEqual({ status: 'ok' })
  })

  it('counts down the attempts on each wrong PIN, then locks', async () => {
    const gateway = createMockPinGateway({ delayMs: 0, maxAttempts: 3 })

    await expect(gateway.unlock('0000')).resolves.toEqual({ status: 'wrong', attemptsLeft: 2 })
    await expect(gateway.unlock('0000')).resolves.toEqual({ status: 'wrong', attemptsLeft: 1 })
    await expect(gateway.unlock('0000')).resolves.toEqual({ status: 'locked' })
  })

  it('stays locked, even for the right PIN, until the page is reloaded', async () => {
    const gateway = createMockPinGateway({ delayMs: 0, maxAttempts: 1 })

    await gateway.unlock('0000')

    await expect(gateway.unlock('1234')).resolves.toEqual({ status: 'locked' })
  })
})
