import { describe, expect, it, vi } from 'vitest'
import { InvalidCredentialsError, InvalidRequestError, TooManyAttemptsError } from '../../domain/auth/errors'
import { createHttpAuthGateway } from './http-auth-gateway'

const baseUrl = 'http://localhost:3000'
const credentials = { email: 'staff@example.com', password: 'secret-pass' }

// A fake fetch that answers with the given status and, optionally, a JSON body.
function replyWith(status: number, body?: unknown) {
  return vi.fn(async () =>
    body === undefined
      ? new Response(null, { status })
      : new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  )
}

describe('HTTP auth gateway', () => {
  it('posts the credentials to /auth/login and sends the cookie with them', async () => {
    const send = replyWith(204)
    const gateway = createHttpAuthGateway({ baseUrl, fetch: send })

    await gateway.login(credentials)

    expect(send).toHaveBeenCalledWith(`${baseUrl}/auth/login`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
  })

  it('asks the backend to remember the device only when the person ticked the box', async () => {
    const send = replyWith(204)
    const gateway = createHttpAuthGateway({ baseUrl, fetch: send })

    await gateway.login({ ...credentials, rememberDevice: true })
    await gateway.login(credentials)

    const [, first] = send.mock.calls[0] as unknown as [string, RequestInit]
    const [, second] = send.mock.calls[1] as unknown as [string, RequestInit]
    expect(JSON.parse(first.body as string)).toEqual({ ...credentials, remember_device: true })
    expect(JSON.parse(second.body as string)).toEqual(credentials)
  })

  it('resolves on 204, when the backend has set the session cookie', async () => {
    const gateway = createHttpAuthGateway({ baseUrl, fetch: replyWith(204) })

    await expect(gateway.login(credentials)).resolves.toBeUndefined()
  })

  it('reports a wrong password, an unknown email or a locked account as invalid credentials', async () => {
    const gateway = createHttpAuthGateway({ baseUrl, fetch: replyWith(401, { error: 'invalid_credentials' }) })

    await expect(gateway.login(credentials)).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('reports a malformed request (400) as an invalid request', async () => {
    const gateway = createHttpAuthGateway({ baseUrl, fetch: replyWith(400, { error: 'invalid_request' }) })

    await expect(gateway.login(credentials)).rejects.toBeInstanceOf(InvalidRequestError)
  })

  it('reports too many attempts (429) as such', async () => {
    const gateway = createHttpAuthGateway({ baseUrl, fetch: replyWith(429, { error: 'too_many_requests' }) })

    await expect(gateway.login(credentials)).rejects.toBeInstanceOf(TooManyAttemptsError)
  })

  it('reports a refused request whose body has no readable code as a generic failure', async () => {
    const gateway = createHttpAuthGateway({ baseUrl, fetch: vi.fn(async () => new Response('bad', { status: 400 })) })

    await expect(gateway.login(credentials)).rejects.toThrow('login failed with 400')
  })

  it('treats an error body without a text code as a generic failure', async () => {
    const gateway = createHttpAuthGateway({ baseUrl, fetch: replyWith(400, { error: 42 }) })

    await expect(gateway.login(credentials)).rejects.toThrow('login failed with 400')
  })

  it('reports a server fault or an unreadable body as a generic failure', async () => {
    const fault = createHttpAuthGateway({ baseUrl, fetch: replyWith(500, { error: 'internal_error' }) })
    const broken = createHttpAuthGateway({ baseUrl, fetch: vi.fn(async () => new Response('<html>', { status: 502 })) })

    await expect(fault.login(credentials)).rejects.toThrow('login failed with 500')
    await expect(broken.login(credentials)).rejects.toThrow('login failed with 502')
  })

  it('lets a network failure reach the caller', async () => {
    const gateway = createHttpAuthGateway({ baseUrl, fetch: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) })

    await expect(gateway.login(credentials)).rejects.toThrow('Failed to fetch')
  })

  it('ends the session with POST /auth/logout, sending the cookie', async () => {
    const send = replyWith(204)
    const gateway = createHttpAuthGateway({ baseUrl, fetch: send })

    await gateway.logout()

    expect(send).toHaveBeenCalledWith(`${baseUrl}/auth/logout`, { credentials: 'include', method: 'POST' })
  })

  it('says the session is open on 200 and closed on 401 no_session', async () => {
    const open = createHttpAuthGateway({ baseUrl, fetch: replyWith(200, { authenticated: true }) })
    const closed = createHttpAuthGateway({ baseUrl, fetch: replyWith(401, { error: 'no_session' }) })

    await expect(open.isSignedIn()).resolves.toBe(true)
    await expect(closed.isSignedIn()).resolves.toBe(false)
  })

  it('checks the session with GET /auth/session, sending the cookie', async () => {
    const send = replyWith(200, { authenticated: true })
    const gateway = createHttpAuthGateway({ baseUrl, fetch: send })

    await gateway.isSignedIn()

    expect(send).toHaveBeenCalledWith(`${baseUrl}/auth/session`, { credentials: 'include' })
  })

  it('does not guess the session when the check fails for another reason', async () => {
    const gateway = createHttpAuthGateway({ baseUrl, fetch: replyWith(500, { error: 'internal_error' }) })

    await expect(gateway.isSignedIn()).rejects.toThrow('session check failed with 500')
  })
})
