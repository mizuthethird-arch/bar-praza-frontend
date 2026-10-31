import { describe, expect, it } from 'vitest'
import { InvalidCredentialsError } from '../../domain/auth/errors'
import { mockAccounts } from './mock-accounts'
import { createMockAuthGateway } from './mock-auth-gateway'
import { createMockSessionStore } from './mock-session-store'

describe('mock auth gateway', () => {
  const session = createMockSessionStore()
  const gateway = createMockAuthGateway({ delayMs: 0, session })
  const [owner] = mockAccounts

  it('lets every seeded account in with its own password', async () => {
    for (const { email, password } of mockAccounts) {
      await expect(gateway.login({ email, password }), email).resolves.toBeUndefined()
    }
  })

  it('ignores case and spaces around the email', async () => {
    await expect(
      gateway.login({ email: `  ${owner.email.toUpperCase()} `, password: owner.password }),
    ).resolves.toBeUndefined()
  })

  it('rejects a wrong password', async () => {
    await expect(gateway.login({ email: owner.email, password: 'nope' })).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    )
  })

  it('rejects another account password', async () => {
    await expect(
      gateway.login({ email: owner.email, password: mockAccounts[1].password }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('rejects an email without an account with the same error', async () => {
    await expect(
      gateway.login({ email: 'nadie@barpraza.test', password: owner.password }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('has one account per email and one per staff role', () => {
    expect(new Set(mockAccounts.map((a) => a.email)).size).toBe(mockAccounts.length)
    expect(mockAccounts.map((a) => a.role).sort()).toEqual(['bar', 'kitchen', 'owner'])
  })

  it('starts a session only after the credentials are accepted, and ends it on logout', async () => {
    const own = createMockSessionStore()
    const mock = createMockAuthGateway({ delayMs: 0, session: own })

    await expect(mock.login({ email: owner.email, password: 'nope' })).rejects.toBeInstanceOf(InvalidCredentialsError)
    await expect(mock.isSignedIn()).resolves.toBe(false)

    await mock.login({ email: owner.email, password: owner.password })
    await expect(mock.isSignedIn()).resolves.toBe(true)

    await mock.logout()
    await expect(mock.isSignedIn()).resolves.toBe(false)
  })
})
