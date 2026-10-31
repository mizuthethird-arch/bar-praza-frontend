import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navigate, useLocation, useNavigate } from 'react-router'
import type { Credentials } from '../../../domain/auth/credentials'
import { useHasSession } from '../../app/use-has-session'
import { useServices } from '../../app/use-services'
import { useAuthMotion, useSignInMotion } from '../../ui/motion'
import { AuthFrame } from './AuthFrame'
import { LoginForm } from './LoginForm'
import { PinPad } from './PinPad'
import { loginErrorMessage } from './login-error-message'

// Both views are stacked in one grid cell, so the card is as tall as the taller of them and the
// email login and the PIN view have the same height. The hidden one stays out of the way.
// CSS flips visibility at the start of a show and at the end of a hide, so the entering view is
// never late and the leaving one fades out before it disappears.
const STACK = 'col-start-1 row-start-1 transition-[visibility] duration-[280ms] motion-reduce:transition-none'

// One screen for the email login (/login) and the PIN unlock (/login/pin): the card stays mounted,
// so switching between them is a motion, not a page change. The PIN exists only where the backend
// has it; elsewhere the screen is the email login alone.
export function AuthScreen() {
  const { login, pinUnlock } = useServices()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const pinView = location.pathname === '/login/pin'
  const { view } = useAuthMotion()
  const signIn = useSignInMotion()
  const signedIn = useHasSession()
  const [leaving, setLeaving] = useState(false)

  // The card leaves before the app opens; the app then tells its first page to rise in.
  async function handleLogin(credentials: Credentials) {
    try {
      await login(credentials)
    } catch (error) {
      throw new Error(loginErrorMessage(error))
    }
    setLeaving(true)
    await new Promise((resolve) => setTimeout(resolve, signIn.leaveMs))
    navigate(from, { replace: true, state: { arrived: true } })
  }

  if (signedIn === null) return null
  if (signedIn) return <Navigate to={from} replace />
  if (pinView && !pinUnlock) return <Navigate to="/login" replace />

  const shown = { opacity: 1, x: 0, transition: view.transition }
  // The email view leaves to the left and the PIN view comes in from the right, and back.
  const emailHidden = { opacity: 0, x: -24, transition: view.transition }
  const pinHidden = { opacity: 0, x: 24, transition: view.transition }

  return (
    <AuthFrame>
      <motion.div
        className="grid"
        animate={leaving ? signIn.leave.animate : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={signIn.leave.transition}
      >
        <motion.div
          className={`${STACK} ${pinView ? 'invisible' : 'visible'}`}
          aria-hidden={pinView}
          inert={pinView}
          initial={false}
          animate={pinView ? emailHidden : shown}
        >
          <LoginForm
            onSubmit={handleLogin}
            onPin={pinUnlock ? () => navigate('/login/pin', { state: { from } }) : undefined}
          />
        </motion.div>

        {pinUnlock && (
          <motion.div
            className={`${STACK} ${pinView ? 'visible' : 'invisible'}`}
            aria-hidden={!pinView}
            inert={!pinView}
            initial={false}
            animate={pinView ? shown : pinHidden}
          >
            <PinPad
              pinUnlock={pinUnlock}
              active={pinView}
              from={from}
              onEmail={() => navigate('/login', { replace: true })}
            />
          </motion.div>
        )}
      </motion.div>
    </AuthFrame>
  )
}
