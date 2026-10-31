import { useReducedMotion, type Transition, type Variants } from 'framer-motion'

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

const still: Variants = { hidden: {}, show: {} }

// Fade-up entrance, switched off when the user asks for reduced motion.
export function useFadeUp(): Variants {
  return useReducedMotion() ? still : fadeUp
}

type Step = { opacity?: number; y?: string | number; transition: Transition }
type SheetVariants = { hidden: Step; show: Step }

const OVERLAY_FADE: Transition = { duration: 0.2 }
const SHEET_SPRING: Transition = { type: 'spring', stiffness: 360, damping: 34, mass: 0.9 }
const SHEET_EXIT: Transition = { duration: 0.22, ease: 'easeIn' }
const INSTANT: Transition = { duration: 0 }

export const DISMISS_OFFSET_PX = 120
export const DISMISS_VELOCITY_PX_S = 600

// A pop-up that rises from the bottom edge like a phone sheet. The overlay fades; the
// sheet springs up and drops away when it closes. Reduced motion shows it at once.
export function sheetMotion(reduced: boolean): { overlay: SheetVariants; sheet: SheetVariants } {
  if (reduced) {
    return {
      overlay: { hidden: { opacity: 1, transition: INSTANT }, show: { opacity: 1, transition: INSTANT } },
      sheet: { hidden: { opacity: 1, y: 0, transition: INSTANT }, show: { opacity: 1, y: 0, transition: INSTANT } },
    }
  }
  return {
    overlay: {
      hidden: { opacity: 0, transition: OVERLAY_FADE },
      show: { opacity: 1, transition: OVERLAY_FADE },
    },
    sheet: {
      hidden: { y: '100%', transition: SHEET_EXIT },
      show: { y: 0, transition: SHEET_SPRING },
    },
  }
}

export function useSheetMotion() {
  return sheetMotion(useReducedMotion() ?? false)
}

// A drag down closes the sheet if it went far enough, or was flicked down fast enough.
export function shouldDismiss(offsetY: number, velocityY: number): boolean {
  return offsetY > DISMISS_OFFSET_PX || velocityY > DISMISS_VELOCITY_PX_S
}
