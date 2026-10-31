import type { Role } from '../../domain/team/team'

export type MockAccount = { email: string; password: string; role: Role; name: string }

// Demo logins for the mock backend only. The .test domain is reserved and never
// delivers mail; the real accounts come from the backend (WP-1.1, WP-1.3).
export const mockAccounts: MockAccount[] = [
  { email: 'titular@barpraza.test', password: 'Praza-Titular-1', role: 'owner', name: '[Titular]' },
  { email: 'cocina@barpraza.test', password: 'Praza-Cocina-1', role: 'kitchen', name: '[Uxía]' },
  { email: 'barra@barpraza.test', password: 'Praza-Barra-1', role: 'bar', name: '[Xosé]' },
]
