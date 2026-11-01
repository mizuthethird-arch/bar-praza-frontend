import { describe, expect, it, vi } from 'vitest'
import { getRememberedDevice, unlockWithPin } from './pin-unlock'

const device = { name: '[Titular]', initials: 'T', email: 'titular@barpraza.test', device: 'TABLET BARRA' }

describe('PIN unlock use case', () => {
  it('shows the device remembered for this tablet', async () => {
    const gateway = { rememberedDevice: vi.fn().mockResolvedValue(device), unlock: vi.fn() }

    await expect(getRememberedDevice(gateway)).resolves.toEqual(device)
  })

  it('sends the PIN to the gateway and returns its answer', async () => {
    const gateway = { rememberedDevice: vi.fn(), unlock: vi.fn().mockResolvedValue({ status: 'ok' }) }

    await expect(unlockWithPin(gateway, '1234')).resolves.toEqual({ status: 'ok' })

    expect(gateway.unlock).toHaveBeenCalledWith('1234')
  })

  it('passes the wrong-PIN and locked answers on unchanged', async () => {
    const wrong = { rememberedDevice: vi.fn(), unlock: vi.fn().mockResolvedValue({ status: 'wrong', attemptsLeft: 2 }) }
    const locked = { rememberedDevice: vi.fn(), unlock: vi.fn().mockResolvedValue({ status: 'locked' }) }

    await expect(unlockWithPin(wrong, '0000')).resolves.toEqual({ status: 'wrong', attemptsLeft: 2 })
    await expect(unlockWithPin(locked, '0000')).resolves.toEqual({ status: 'locked' })
  })
})
