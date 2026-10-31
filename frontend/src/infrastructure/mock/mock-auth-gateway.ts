import type { AuthGateway } from '../../application/ports'
import { InvalidCredentialsError } from '../../domain/auth/errors'
import { mockAccounts } from './mock-accounts'

type Options = { delayMs?: number }

// Mock until the real login endpoint exists (WP-1.5). Checks the demo accounts and
// gives the same error for an unknown email and a wrong password.
export function createMockAuthGateway({ delayMs = 500 }: Options = {}): AuthGateway {
  return {
    async login({ email, password }) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      const account = mockAccounts.find((a) => a.email === email.trim().toLowerCase())
      if (!account || account.password !== password) throw new InvalidCredentialsError()
    },
  }
}
