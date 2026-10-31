import { Navigate, Outlet, useLocation } from 'react-router'
import { justSignedIn } from './just-signed-in'
import { useHasSession } from './use-has-session'

// Sends visitors without a session to /login, remembering where they were going.
// Right after a successful sign-in the cookie is already set, so the app opens at once and the
// check runs behind it; a check that fails still sends the visitor to /login.
export function RequireSession() {
  const signedIn = useHasSession()
  const location = useLocation()

  if (signedIn === false) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (signedIn === null && !justSignedIn(location.state)) return null
  return <Outlet />
}
