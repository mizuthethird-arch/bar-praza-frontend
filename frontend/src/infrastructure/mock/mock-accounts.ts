import type { Role } from '../../domain/team/team'

export type MockAccount = { email: string; password: string; role: Role; name: string }

// Demo logins for the mock backend only. The .test domain is reserved and never
// delivers mail; the real accounts come from the backend (WP-1.1, WP-1.3).
export const mockAccounts: MockAccount[] = [
  { email: 'titular@barpraza.test', password: 'epGrdSpJH6g9J07xbONBandR', role: 'owner', name: '[Titular]' },
  { email: 'cocina@barpraza.test', password: 'iFjv1xDx2toqNh4kA_YWcCob', role: 'kitchen', name: '[Uxía]' },
  { email: 'barra@barpraza.test', password: 'Vb6JsQYPFcnjnojB3hGnLjII', role: 'bar', name: '[Xosé]' },
]
