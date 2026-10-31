import { describe, expect, it, vi } from 'vitest'
import { InvalidCredentialsError } from '../domain/auth/errors'
import { login, logout } from './login'
import { createMockSessionStore } from '../infrastructure/mock/mock-session-store'

const credentials = { email: 'staff@example.com', password: 'secret-pass' }

describe('login use case', () => {
  it('starts a session only after the gateway accepts the credentials', async () => {
    const session = createMockSessionStore()
    const rejecting = { login: vi.fn().mockRejectedValue(new InvalidCredentialsError()) }

    await expect(login(rejecting, session, credentials)).rejects.toBeInstanceOf(InvalidCredentialsError)
    expect(session.isActive()).toBe(false)

    await login({ login: vi.fn().mockResolvedValue(undefined) }, session, credentials)
    expect(session.isActive()).toBe(true)

    logout(session)
    expect(session.isActive()).toBe(false)
  })

  it('sends the credentials to the auth gateway', async () => {
    const gateway = { login: vi.fn().mockResolvedValue(undefined) }

    await login(gateway, createMockSessionStore(), credentials)

    expect(gateway.login).toHaveBeenCalledWith(credentials)
  })

  it('lets InvalidCredentialsError reach the caller', async () => {
    const gateway = { login: vi.fn().mockRejectedValue(new InvalidCredentialsError()) }

    await expect(login(gateway, createMockSessionStore(), credentials)).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
