import type { SessionStore } from '../../application/ports'

export const SESSION_KEY = 'barpraza.mockSession'

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>
type Options = { active?: boolean; storage?: Storage }

// Mock session. With `storage` (the browser's sessionStorage) it survives a reload
// until the tab closes; without it, or if the storage throws, it lives in memory.
// A real one would hold the backend's session, not a flag.
export function createMockSessionStore({ active = false, storage }: Options = {}): SessionStore {
  let current = active
  const attempt = (write: (storage: Storage) => void) => {
    try {
      if (storage) write(storage)
    } catch {
      // Blocked storage: the in-memory flag still works for this page.
    }
  }

  attempt((s) => {
    if (active) s.setItem(SESSION_KEY, '1')
    else current = s.getItem(SESSION_KEY) === '1'
  })

  return {
    isActive: () => current,
    start: () => {
      current = true
      attempt((s) => s.setItem(SESSION_KEY, '1'))
    },
    end: () => {
      current = false
      attempt((s) => s.removeItem(SESSION_KEY))
    },
  }
}
