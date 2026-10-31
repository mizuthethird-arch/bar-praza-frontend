import type { PinResult } from '../domain/auth/pin'
import type { RememberedDevice } from '../domain/auth/remembered-device'
import type { PinGateway } from './ports'

export function getRememberedDevice(gateway: PinGateway): Promise<RememberedDevice> {
  return gateway.rememberedDevice()
}

// The gateway starts the session on a right PIN (the backend sets its cookie; the mock keeps its flag).
export function unlockWithPin(gateway: PinGateway, pin: string): Promise<PinResult> {
  return gateway.unlock(pin)
}
