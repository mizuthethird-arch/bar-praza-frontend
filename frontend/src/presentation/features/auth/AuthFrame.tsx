import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

// The shared frame of the sign-in screens: the arch background photo and the glass card. Below 1440 px
// the card is centred; from 1440 px it sits on the left, as in the Design artifact.
// The card is a layout element, so it resizes smoothly when its content changes.
// Above 1440 px the card grows with the screen, so it keeps the share of the screen it has at 1440 px,
// up to 2560 px. Each step needs both the width and the height: the tallest state (an email error,
// 788 px at 1x, plus the 96 px frame padding) must still fit, so the card never needs a scroll.
// The zoom at each step is the width ratio to 1440 px: 1600, 1920 and 2560 over 1440, rounded to two decimals.
export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-hidden bg-surface px-4 py-6 text-ink min-[1440px]:justify-start md:px-24 md:py-12">
      <img
        src="/login-bg.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[70%_50%]"
      />

      <motion.main
        layout
        className="relative flex w-full max-w-md flex-col rounded-xl border border-line bg-surface-raised/85 px-6 py-12 backdrop-blur-xl [@media(width>=1600px)_and_(height>=970px)]:[zoom:1.1] [@media(width>=1920px)_and_(height>=1150px)]:[zoom:1.33] [@media(width>=2560px)_and_(height>=1500px)]:[zoom:1.78]"
      >
        <p className="mb-6 flex items-center gap-2 text-xs leading-4 font-semibold tracking-[0.12em] text-ink-muted uppercase">
          <span aria-hidden="true" className="h-6 w-6 rounded-t-full bg-tella" />
          Bar Praza · Panel de gestión
        </p>
        {children}
      </motion.main>
    </div>
  )
}
