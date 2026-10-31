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
