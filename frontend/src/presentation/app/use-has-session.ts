import { useEffect, useState } from 'react'
import { useServices } from './use-services'

// null while the backend is asked; then true or false. A failed check counts as signed out,
// so the visitor is sent to the login form instead of seeing a blank page.
export function useHasSession(): boolean | null {
  const { hasSession } = useServices()
  const [signedIn, setSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    let current = true
    hasSession().then(
      (found) => {
        if (current) setSignedIn(found)
      },
      () => {
        if (current) setSignedIn(false)
      },
    )
    return () => {
      current = false
    }
  }, [hasSession])

  return signedIn
}
