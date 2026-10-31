import { Navigate, Outlet, useLocation } from 'react-router'
import { useServices } from './use-services'

// Sends visitors without a session to /login, remembering where they were going.
export function RequireSession() {
  const { hasSession } = useServices()
  const location = useLocation()

  if (!hasSession()) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
