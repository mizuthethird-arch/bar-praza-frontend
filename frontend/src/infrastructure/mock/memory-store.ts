// In-memory stand-in for the server's copy. `change` applies a command to the latest
// state in one step, so concurrent commands never overwrite each other.
export function memoryStore<T>(initial: T) {
  let current = initial
  return {
    read: async () => current,
    change: async (apply: (state: T) => T) => (current = apply(current)),
  }
}
