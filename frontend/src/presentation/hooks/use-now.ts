import { useEffect, useState } from 'react'

// The current time, refreshed every `everyMs`.
export function useNow(everyMs: number): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), everyMs)
    return () => window.clearInterval(timer)
  }, [everyMs])

  return now
}
