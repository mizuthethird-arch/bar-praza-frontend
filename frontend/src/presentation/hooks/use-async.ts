import { useEffect, useRef, useState } from 'react'

export type AsyncState<T> = {
  status: 'loading' | 'ready' | 'error'
  data?: T
  error?: Error
}

// Runs `load` once when the component mounts.
export function useAsync<T>(load: () => Promise<T>): AsyncState<T> {
  const loadRef = useRef(load)
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    loadRef.current().then(
      (data) => {
        if (!cancelled) setState({ status: 'ready', data })
      },
      (error: unknown) => {
        if (!cancelled) setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) })
      },
    )

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
