import { Navigate, Outlet, useLocation } from 'react-router'
import { useHasSession } from './use-has-session'

// Sends visitors without a session to /login, remembering where they were going.
// Shows nothing while the backend answers.
export function RequireSession() {
  const signedIn = useHasSession()
  const location = useLocation()

  if (signedIn === null) return null
  if (!signedIn) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
