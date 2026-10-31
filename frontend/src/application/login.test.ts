import { describe, expect, it, vi } from 'vitest'
import { InvalidCredentialsError } from '../domain/auth/errors'
import { isSignedIn, login, logout } from './login'

const credentials = { email: 'staff@example.com', password: 'secret-pass' }

describe('login use case', () => {
  it('sends the credentials to the auth gateway', async () => {
    const gateway = { login: vi.fn().mockResolvedValue(undefined), logout: vi.fn(), isSignedIn: vi.fn() }

    await login(gateway, credentials)

    expect(gateway.login).toHaveBeenCalledWith(credentials)
  })

  it('lets InvalidCredentialsError reach the caller', async () => {
    const gateway = { login: vi.fn().mockRejectedValue(new InvalidCredentialsError()), logout: vi.fn(), isSignedIn: vi.fn() }

    await expect(login(gateway, credentials)).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('ends the session and checks it through the gateway', async () => {
    const gateway = {
      login: vi.fn(),
      logout: vi.fn().mockResolvedValue(undefined),
      isSignedIn: vi.fn().mockResolvedValue(true),
    }

    await logout(gateway)
    await expect(isSignedIn(gateway)).resolves.toBe(true)

    expect(gateway.logout).toHaveBeenCalledOnce()
  })
})
