import type { AppServices } from '../../application/services'
import { createMockServices } from './create-mock-services'
import { createMockAuthGateway } from './mock-auth-gateway'
import { createMockPinGateway } from './mock-pin-gateway'
import { createMockSessionStore } from './mock-session-store'

type Options = {
  loginDelayMs?: number
  signedIn?: boolean
  // Where the demo session is kept; the app passes sessionStorage so a reload keeps you signed in.
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
  // Where the kitchen board is kept; the app passes localStorage so every tab shares the board.
  kitchenStorage?: Pick<Storage, 'getItem' | 'setItem'>
}

// The demo build: the demo logins, the demo PIN and a mock session. Only a demo or development build may
// import this module (see main.tsx), so the demo accounts stay out of a production build (ISS-13).
export function createDemoServices({ loginDelayMs, signedIn = false, storage, kitchenStorage }: Options = {}): AppServices {
  const session = createMockSessionStore({ active: signedIn, storage })
  return createMockServices({
    auth: createMockAuthGateway({ delayMs: loginDelayMs, session }),
    pin: createMockPinGateway({ session }),
    kitchenStorage,
  })
}
