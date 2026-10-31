import type { PinGateway, SessionStore } from '../../application/ports'
import type { PinResult } from '../../domain/auth/pin'
import type { RememberedDevice } from '../../domain/auth/remembered-device'

type Options = { delayMs?: number; maxAttempts?: number; session: SessionStore }

// Demo PIN for the mock only. The real PIN is set per person by the backend (see the backend's API doc).
export const MOCK_DEMO_PIN = '1234'

const remembered: RememberedDevice = {
  name: '[Titular]',
  initials: 'T',
  email: 'titular@barpraza.test',
  device: 'TABLET BARRA',
}

// Keeps the failed attempts in memory: a reload brings the attempts back, as in the mock data.
// A right PIN starts the mock session, as the backend does with its cookie.
export function createMockPinGateway({ delayMs = 300, maxAttempts = 3, session }: Options): PinGateway {
  let attemptsLeft = maxAttempts

  const wait = () => new Promise((resolve) => setTimeout(resolve, delayMs))

  return {
    // The device is known from the start, so the PIN view opens without a wait.
    async rememberedDevice() {
      return remembered
    },
    async unlock(pin): Promise<PinResult> {
      await wait()
      if (attemptsLeft === 0) return { status: 'locked' }
      if (pin === MOCK_DEMO_PIN) {
        attemptsLeft = maxAttempts
        session.start()
        return { status: 'ok' }
      }
      attemptsLeft -= 1
      return attemptsLeft === 0 ? { status: 'locked' } : { status: 'wrong', attemptsLeft }
    },
  }
}
