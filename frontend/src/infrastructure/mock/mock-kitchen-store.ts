// The kitchen board, kept in browser storage in the demo build. Every open tab reads and changes
// the same board, as it would against the backend. Without storage, or when storage refuses to
// work, the board lives in memory for this tab only.
export const KEY = 'barpraza.kitchenBoard'

export type BoardStorage = Pick<Storage, 'getItem' | 'setItem'>

export function kitchenStore<T>(storage: BoardStorage | undefined, seed: () => T) {
  let memory: T | null = null

  const read = (): T => {
    try {
      const saved = storage?.getItem(KEY)
      if (saved) return JSON.parse(saved) as T
    } catch {
      // Unreadable or blocked storage: start again from the seed below.
    }
    const board = memory ?? seed()
    memory = board
    try {
      storage?.setItem(KEY, JSON.stringify(board))
    } catch {
      // Blocked storage: the board stays in memory.
    }
    return board
  }

  const write = (board: T) => {
    memory = board
    try {
      storage?.setItem(KEY, JSON.stringify(board))
    } catch {
      // Blocked storage: the board stays in memory.
    }
  }

  return {
    read: async () => read(),
    change: async (apply: (state: T) => T) => {
      const next = apply(read())
      write(next)
      return next
    },
  }
}
