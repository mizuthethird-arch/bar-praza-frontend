import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { outlineButton } from './classes'
import { closeOnDragEnd, useSheetMotion } from './motion'

type Props = {
  // Id of the heading inside children, so the pop-up is named after it.
  titleId: string
  onClose: () => void
  // Shown on the left of the footer, before the close button.
  footer?: ReactNode
  // The label of the close button; "No" when the pop-up asks a question.
  closeLabel?: string
  children: ReactNode
}

// The pop-up shell for every pop-up in the app: a phone bottom sheet that becomes a centred dialog
// from md. Rendered through a portal, so it sits above the whole page. It closes with Escape, the
// close button or a drag down; it takes focus when it opens and gives it back when it closes.
// Render it inside AnimatePresence so the exit animation runs.
export function Sheet({ titleId, onClose, footer, closeLabel = 'Cerrar', children }: Props) {
  const { overlay, sheet } = useSheetMotion()
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const opener = document.activeElement as HTMLElement
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      opener.focus()
    }
  }, [])

  return createPortal(
    <motion.div
      variants={overlay}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 md:items-center md:p-4"
    >
      <motion.div
        variants={sheet}
        initial="hidden"
        animate="show"
        exit="hidden"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => closeOnDragEnd(info, () => onCloseRef.current())}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-neutral-700 bg-neutral-950 px-6 pb-6 pt-3 text-neutral-100 md:rounded-xl md:p-6"
      >
        <div aria-hidden="true" className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-600 md:hidden" />
        {children}

        <footer className="mt-6 flex items-center justify-between gap-3 border-t border-neutral-800 pt-4">
          {footer ?? <span />}
          <button ref={closeRef} type="button" onClick={() => onCloseRef.current()} className={`px-4 py-2 ${outlineButton}`}>
            {closeLabel}
          </button>
        </footer>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
