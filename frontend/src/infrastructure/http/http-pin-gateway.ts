import type { PinGateway } from '../../application/ports'
import type { PinResult } from '../../domain/auth/pin'
import type { RememberedDevice } from '../../domain/auth/remembered-device'
import { NoRememberedDeviceError, PinNotSetError } from '../../domain/auth/errors'
import { errorCode } from './http-errors'

type Options = { baseUrl: string; fetch?: typeof fetch }

// The PIN screen's endpoints. The device cookie (set by a login that ticked "Recordar este dispositivo")
// identifies the tablet; a right PIN sets the session cookie, so the caller asks GET /auth/session next.
export function createHttpPinGateway({ baseUrl, fetch: send = fetch }: Options): PinGateway {
  const call = (path: string, init: RequestInit = {}) => send(`${baseUrl}${path}`, { credentials: 'include', ...init })

  return {
    async rememberedDevice(): Promise<RememberedDevice> {
      const response = await call('/auth/device')
      if (response.status === 200) return (await response.json()) as RememberedDevice
      if (response.status === 401 && (await errorCode(response)) === 'no_device') throw new NoRememberedDeviceError()
      throw new Error(`device check failed with ${response.status}`)
    },

    async unlock(pin): Promise<PinResult> {
      const response = await call('/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      if (response.status === 200) return pinAnswer((await response.json()) as { result?: unknown; attemptsLeft?: unknown })

      const code = await errorCode(response)
      if (response.status === 401 && code === 'no_device') throw new NoRememberedDeviceError()
      if (response.status === 403 && code === 'pin_not_set') throw new PinNotSetError()
      throw new Error(`PIN check failed with ${response.status}`)
    },
  }
}

// { "result": "ok" } | { "result": "wrong", "attemptsLeft": n } | { "result": "locked" }
function pinAnswer(body: { result?: unknown; attemptsLeft?: unknown }): PinResult {
  if (body.result === 'ok') return { status: 'ok' }
  if (body.result === 'locked') return { status: 'locked' }
  if (body.result === 'wrong' && typeof body.attemptsLeft === 'number') {
    return { status: 'wrong', attemptsLeft: body.attemptsLeft }
  }
  throw new Error('PIN check gave an unexpected answer')
}
