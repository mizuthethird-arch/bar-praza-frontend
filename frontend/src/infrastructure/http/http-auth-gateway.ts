import type { AuthGateway } from '../../application/ports'
import { InvalidCredentialsError, InvalidRequestError, TooManyAttemptsError } from '../../domain/auth/errors'
import { errorCode } from './http-errors'

type Options = { baseUrl: string; fetch?: typeof fetch }

// The backend's session endpoints. The session is an HttpOnly cookie: JavaScript cannot read it, and
// it only travels when the request asks for credentials, so every call sends them and the session is
// checked by asking GET /auth/session.
export function createHttpAuthGateway({ baseUrl, fetch: send = fetch }: Options): AuthGateway {
  const call = (path: string, init: RequestInit = {}) => send(`${baseUrl}${path}`, { credentials: 'include', ...init })

  return {
    async login({ email, password, rememberDevice }) {
      // remember_device is sent only when the person ticked the box: it sets the 30-day device cookie.
      const body = { email, password, ...(rememberDevice ? { remember_device: true } : {}) }
      const response = await call('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (response.status === 204) return
      throw await loginFailure(response)
    },

    // The backend answers 204 even without a session, so only a network failure reaches the caller.
    async logout() {
      await call('/auth/logout', { method: 'POST' })
    },

    async isSignedIn() {
      const response = await call('/auth/session')
      if (response.status === 200) return true
      if (response.status === 401) return false
      throw new Error(`session check failed with ${response.status}`)
    },
  }
}

async function loginFailure(response: Response): Promise<Error> {
  const code = await errorCode(response)
  if (response.status === 401 && code === 'invalid_credentials') return new InvalidCredentialsError()
  if (response.status === 400 && code === 'invalid_request') return new InvalidRequestError()
  if (response.status === 429) return new TooManyAttemptsError()
  return new Error(`login failed with ${response.status}`)
}
