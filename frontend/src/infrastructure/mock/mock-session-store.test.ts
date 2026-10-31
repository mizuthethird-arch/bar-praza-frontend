import { afterEach, describe, expect, it } from 'vitest'
import { createMockSessionStore, SESSION_KEY } from './mock-session-store'

describe('mock session store', () => {
  it('starts closed unless told otherwise', () => {
    expect(createMockSessionStore().isActive()).toBe(false)
    expect(createMockSessionStore({ active: true }).isActive()).toBe(true)
  })

  it('opens and closes', () => {
    const session = createMockSessionStore()
    session.start()
    expect(session.isActive()).toBe(true)
    session.end()
    expect(session.isActive()).toBe(false)
  })
})

describe('mock session store kept in browser storage', () => {
  afterEach(() => sessionStorage.clear())

  it('survives a reload: a new store on the same storage is still signed in', () => {
    createMockSessionStore({ storage: sessionStorage }).start()

    expect(createMockSessionStore({ storage: sessionStorage }).isActive()).toBe(true)
  })

  it('forgets the session on sign out', () => {
    const session = createMockSessionStore({ storage: sessionStorage })
    session.start()
    session.end()

    expect(createMockSessionStore({ storage: sessionStorage }).isActive()).toBe(false)
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('falls back to memory when the storage throws (private mode, blocked site data)', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }
    const session = createMockSessionStore({ storage: broken })

    expect(session.isActive()).toBe(false)
    session.start()
    expect(session.isActive()).toBe(true)
    session.end()
    expect(session.isActive()).toBe(false)
  })
})
