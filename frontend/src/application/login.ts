import type { Credentials } from '../domain/auth/credentials'
import type { AuthGateway } from './ports'

// The gateway owns the session: the backend sets its cookie on login, or the mock keeps its flag.
export function login(gateway: AuthGateway, credentials: Credentials): Promise<void> {
  return gateway.login(credentials)
}

export function logout(gateway: AuthGateway): Promise<void> {
  return gateway.logout()
}

export function isSignedIn(gateway: AuthGateway): Promise<boolean> {
  return gateway.isSignedIn()
}
