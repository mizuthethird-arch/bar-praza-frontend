import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { useMenuMotion, useSignInMotion } from '../ui/motion'
import { SideNav } from './SideNav'

// Three bars that turn into a cross while the menu is open.
function MenuIcon({ open }: { open: boolean }) {
  const bar = 'block h-0.5 w-5 rounded-full bg-current transition-transform duration-300 motion-reduce:transition-none'
  return (
    <span aria-hidden="true" className="flex flex-col items-center justify-center gap-1.5">
      <span className={`${bar} ${open ? 'translate-y-2 rotate-45' : ''}`} />
      <span className={`${bar} ${open ? 'opacity-0' : ''}`} />
      <span className={`${bar} ${open ? '-translate-y-2 -rotate-45' : ''}`} />
    </span>
  )
}

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const motionVariants = useMenuMotion()
  const location = useLocation()
  const signIn = useSignInMotion()
  // Only the first page after a successful sign-in rises in; later page changes stay as they are.
  const arrived = (location.state as { arrived?: boolean } | null)?.arrived === true

  // Escape closes the mobile menu and gives focus back to its button.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-neutral-950 font-mono text-neutral-100 md:flex md:h-screen md:overflow-hidden">
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 border-b border-neutral-800 bg-neutral-900 px-3 md:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md hover:bg-neutral-800/60"
        >
          <MenuIcon open={menuOpen} />
        </button>
        <p className="text-base font-bold">Bar Praza</p>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            variants={motionVariants.panel}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-neutral-900 px-6 pb-10 pt-20 md:hidden"
          >
            <motion.div
              variants={motionVariants.list}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <SideNav
                onNavigate={() => setMenuOpen(false)}
                itemMotion={motionVariants.item}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="hidden min-w-0 bg-neutral-900 p-6 md:block md:h-screen md:w-60 md:shrink-0 md:overflow-y-auto md:border-r md:border-neutral-800">
        <p className="px-3 pb-6 text-base font-bold">Bar Praza</p>
        <SideNav />
      </aside>

      <div className="min-w-0 flex-1 overflow-x-hidden pt-14 md:h-screen md:overflow-y-auto md:pt-0">
        <motion.div
          initial={arrived ? signIn.arrive.initial : false}
          animate={signIn.arrive.animate}
          transition={signIn.arrive.transition}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}
