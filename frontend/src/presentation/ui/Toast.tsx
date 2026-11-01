import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type Props = {
  // Text to show; null shows nothing.
  message: string | null
  // Called once the notice has been shown for durationMs, so the page can clear the message.
  onDone: () => void
  durationMs?: number
}

// A short notice that drops from the top of the screen and goes away by itself.
// Built on framer-motion, which the app already uses, rather than a toast library.
export function Toast({ message, onDone, durationMs = 3000 }: Props) {
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    if (message === null) return
    const timer = window.setTimeout(() => onDoneRef.current(), durationMs)
    return () => window.clearTimeout(timer)
  }, [message, durationMs])

  return (
    <AnimatePresence>
      {message !== null && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          style={{ top: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
          className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
        >
          <p role="status" className="rounded-xl border border-emerald-800 bg-emerald-950 px-5 py-3 text-sm font-semibold text-emerald-200 shadow-lg">
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
