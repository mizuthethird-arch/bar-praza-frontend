import type { PinResult } from '../domain/auth/pin'
import type { RememberedDevice } from '../domain/auth/remembered-device'
import type { PinGateway, SessionStore } from './ports'

export function getRememberedDevice(gateway: PinGateway): Promise<RememberedDevice> {
  return gateway.rememberedDevice()
}

// Only a right PIN starts the session; a wrong one or a lock leaves the user where they are.
export async function unlockWithPin(gateway: PinGateway, session: SessionStore, pin: string): Promise<PinResult> {
  const result = await gateway.unlock(pin)
  if (result.status === 'ok') session.start()
  return result
}
