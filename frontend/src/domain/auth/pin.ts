// The PIN unlocks the device that remembered this person; it is not the password.
export const PIN_LENGTH = 4

export type PinResult = { status: 'ok' } | { status: 'wrong'; attemptsLeft: number } | { status: 'locked' }
