export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials')
    this.name = 'InvalidCredentialsError'
  }
}

// The backend refused the request shape (400 invalid_request).
export class InvalidRequestError extends Error {
  constructor() {
    super('Invalid request')
    this.name = 'InvalidRequestError'
  }
}

// Too many login attempts from this address (429 too_many_requests).
export class TooManyAttemptsError extends Error {
  constructor() {
    super('Too many attempts')
    this.name = 'TooManyAttemptsError'
  }
}

// The device is not remembered, or the account is deactivated (401 no_device): the PIN is not offered.
export class NoRememberedDeviceError extends Error {
  constructor() {
    super('No remembered device')
    this.name = 'NoRememberedDeviceError'
  }
}

// The account has no PIN yet (403 pin_not_set).
export class PinNotSetError extends Error {
  constructor() {
    super('PIN not set')
    this.name = 'PinNotSetError'
  }
}
