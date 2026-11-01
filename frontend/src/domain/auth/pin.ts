// The PIN unlocks the device that remembered this person; it is not the password.
export const PIN_LENGTH = 4

export const isValidPin = (pin: string) => new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin)

export type PinResult = { status: 'ok' } | { status: 'wrong'; attemptsLeft: number } | { status: 'locked' }
