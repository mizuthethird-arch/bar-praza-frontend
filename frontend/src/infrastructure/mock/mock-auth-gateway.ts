import type { AuthGateway, SessionStore } from '../../application/ports'
import { InvalidCredentialsError } from '../../domain/auth/errors'
import { mockAccounts } from './mock-accounts'

type Options = { delayMs?: number; session: SessionStore }

// Mock of the login endpoint. Checks the demo accounts, gives the same error for an unknown
// email and a wrong password, and keeps the session in the mock session store.
export function createMockAuthGateway({ delayMs = 500, session }: Options): AuthGateway {
  return {
    async login({ email, password }) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      const account = mockAccounts.find((a) => a.email === email.trim().toLowerCase())
      if (!account || account.password !== password) throw new InvalidCredentialsError()
      session.start()
    },
    async logout() {
      session.end()
    },
    async isSignedIn() {
      return session.isActive()
    },
  }
}
