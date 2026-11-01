import { describe, expect, it, vi } from 'vitest'
import { NoRememberedDeviceError, PinNotSetError } from '../../domain/auth/errors'
import { createHttpPinGateway } from './http-pin-gateway'

const baseUrl = 'http://localhost:3000'
const device = { name: 'Owner Praza', initials: 'OP', email: 'owner.praza@example.com', device: 'Chrome en Windows' }

function replyWith(status: number, body?: unknown) {
  return vi.fn(async () =>
    body === undefined
      ? new Response(null, { status })
      : new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  )
}

describe('HTTP PIN gateway', () => {
  it('reads the remembered device with GET /auth/device, sending the cookie', async () => {
    const send = replyWith(200, device)
    const gateway = createHttpPinGateway({ baseUrl, fetch: send })

    await expect(gateway.rememberedDevice()).resolves.toEqual(device)
    expect(send).toHaveBeenCalledWith(`${baseUrl}/auth/device`, { credentials: 'include' })
  })

  it('reports no remembered device (401 no_device) as such', async () => {
    const gateway = createHttpPinGateway({ baseUrl, fetch: replyWith(401, { error: 'no_device' }) })

    await expect(gateway.rememberedDevice()).rejects.toBeInstanceOf(NoRememberedDeviceError)
  })

  it('fails the device check on any other answer', async () => {
    const gateway = createHttpPinGateway({ baseUrl, fetch: replyWith(500, { error: 'internal_error' }) })

    await expect(gateway.rememberedDevice()).rejects.toThrow('device check failed with 500')
  })

  it('posts the PIN to /auth/pin, sending the cookie', async () => {
    const send = replyWith(200, { result: 'ok' })
    const gateway = createHttpPinGateway({ baseUrl, fetch: send })

    await gateway.unlock('1234')

    expect(send).toHaveBeenCalledWith(`${baseUrl}/auth/pin`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '1234' }),
    })
  })

  it('reads the right PIN, the wrong PIN with attempts left, and the lock', async () => {
    const right = createHttpPinGateway({ baseUrl, fetch: replyWith(200, { result: 'ok' }) })
    const wrong = createHttpPinGateway({ baseUrl, fetch: replyWith(200, { result: 'wrong', attemptsLeft: 2 }) })
    const locked = createHttpPinGateway({ baseUrl, fetch: replyWith(200, { result: 'locked' }) })

    await expect(right.unlock('1234')).resolves.toEqual({ status: 'ok' })
    await expect(wrong.unlock('0000')).resolves.toEqual({ status: 'wrong', attemptsLeft: 2 })
    await expect(locked.unlock('1234')).resolves.toEqual({ status: 'locked' })
  })

  it('reports a missing device or an account without a PIN', async () => {
    const noDevice = createHttpPinGateway({ baseUrl, fetch: replyWith(401, { error: 'no_device' }) })
    const noPin = createHttpPinGateway({ baseUrl, fetch: replyWith(403, { error: 'pin_not_set' }) })

    await expect(noDevice.unlock('1234')).rejects.toBeInstanceOf(NoRememberedDeviceError)
    await expect(noPin.unlock('1234')).rejects.toBeInstanceOf(PinNotSetError)
  })

  it('fails on a refused request, an odd answer or a server fault', async () => {
    const refused = createHttpPinGateway({ baseUrl, fetch: replyWith(400, { error: 'invalid_request' }) })
    const odd = createHttpPinGateway({ baseUrl, fetch: replyWith(200, { result: 'maybe' }) })
    const fault = createHttpPinGateway({ baseUrl, fetch: replyWith(500, { error: 'internal_error' }) })

    await expect(refused.unlock('12')).rejects.toThrow('PIN check failed with 400')
    await expect(odd.unlock('1234')).rejects.toThrow('unexpected answer')
    await expect(fault.unlock('1234')).rejects.toThrow('PIN check failed with 500')
  })
})
