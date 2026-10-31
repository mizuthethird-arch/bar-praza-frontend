import type { Credentials } from '../domain/auth/credentials'
import type { AuthGateway, SessionStore } from './ports'

export async function login(gateway: AuthGateway, session: SessionStore, credentials: Credentials): Promise<void> {
  await gateway.login(credentials)
  session.start()
}

export function logout(session: SessionStore): void {
  session.end()
}
