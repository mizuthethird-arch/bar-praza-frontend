import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import type { DeliveredOrder } from '../../../domain/kitchen/kitchen'
import { formatEuros } from '../../format/money'
import { outlineButton } from '../../ui/classes'
import { shouldDismiss, useSheetMotion } from '../../ui/motion'

type Props = { order: DeliveredOrder; onClose: () => void }

// Details of a delivered order, for when something went wrong. Rendered through a portal,
// so the pop-up sits above the whole page, not inside the column.
export function DeliveryDetailDialog({ order, onClose }: Props) {
  const titleId = useId()
  const { overlay, sheet } = useSheetMotion()
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
        onDragEnd={(_, info) => {
          if (shouldDismiss(info.offset.y, info.velocity.y)) onCloseRef.current()
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-neutral-700 bg-neutral-950 px-6 pb-6 pt-3 text-neutral-100 md:rounded-xl md:p-6"
      >
        <div aria-hidden="true" className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-600 md:hidden" />
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={titleId} className="text-xl font-bold">{`Pedido ${order.id} · ${order.customer}`}</h2>
          <span className="rounded-full bg-emerald-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-100">
            Entregado
          </span>
        </header>

        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-neutral-400">Recogida</dt>
          <dd>{order.pickupTime}</dd>
          <dt className="text-neutral-400">Hora de entrega</dt>
          <dd>{order.deliveredAt}</dd>
          <dt className="text-neutral-400">Teléfono</dt>
          <dd>
            <a href={`tel:${order.phone.replaceAll(' ', '')}`} className="underline underline-offset-4">
              {order.phone}
            </a>
          </dd>
          <dt className="text-neutral-400">Pago</dt>
          <dd>{order.paymentNote ?? '—'}</dd>
        </dl>

        <ul className="mt-5 space-y-1 border-t border-neutral-800 pt-4 text-sm">
          {order.lines.map((line, index) => (
            <li key={index}>
              {line.quantity}× {line.name}
              {line.variant && ` · ${line.variant}`}
              {line.detail && ` (${line.detail})`}
            </li>
          ))}
        </ul>

        {order.note && <p className="mt-4 rounded-md bg-red-950/40 px-3 py-2 text-sm font-semibold text-red-300">Nota: {order.note}</p>}

        <footer className="mt-6 flex items-center justify-between gap-3 border-t border-neutral-800 pt-4">
          <span className="font-bold">{formatEuros(order.totalCents)}</span>
          <button ref={closeRef} type="button" onClick={() => onCloseRef.current()} className={`px-4 py-2 ${outlineButton}`}>
            Cerrar
          </button>
        </footer>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
