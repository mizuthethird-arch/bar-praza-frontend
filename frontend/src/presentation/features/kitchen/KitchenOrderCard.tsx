import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { delayedMinutes, type KitchenOrder } from '../../../domain/kitchen/kitchen'
import { minutesBetween } from '../../../domain/time/clock'
import { formatEuros } from '../../format/money'
import { dangerButton, deliverButton, primaryButton } from '../../ui/classes'
import { cardShell, neutralTone } from './KitchenColumn'
import { CancelOrderDialog } from './CancelOrderDialog'
import { OrderDetailDialog } from './OrderDetailDialog'

type Props = {
  order: KitchenOrder
  now: string
  onStart: () => void
  onReady: () => void
  onDeliver: () => void
  onCancel: () => void
}

const badge = 'whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest'
const button = 'block w-full whitespace-nowrap py-3 text-center'

function When({ order, now }: { order: KitchenOrder; now: string }) {
  if (order.status === 'preparing') return <span className="text-neutral-300">Preparando</span>
  const ahead = minutesBetween(now, order.pickupTime)
  const countdown = order.status === 'new' && ahead > 0 ? ` · en ${ahead} min` : ''
  return <span className="font-bold">{`Recoge ${order.pickupTime}${countdown}`}</span>
}

function toneOf(order: KitchenOrder, late: number) {
  if (late > 0) return 'border-red-900 bg-red-950/40'
  if (order.status === 'ready') return 'border-sky-900 bg-sky-950/40'
  return neutralTone
}

// The order's own area of the card opens its details. The phone and the action buttons sit
// outside that area, so pressing them never opens the details.
// A card keeps its id across columns, so moving it from one column to the next slides it there
// (layoutId), while arriving and leaving fade and slide in and out.
const cardMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] as const },
}

export function KitchenOrderCard({ order, now, onStart, onReady, onDeliver, onCancel }: Props) {
  const [openDetail, setOpenDetail] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const late = delayedMinutes(order, now)

  return (
    <motion.article
      layout
      layoutId={`order-${order.id}`}
      {...cardMotion}
      aria-label={`Pedido ${order.id}`}
      className={`${cardShell} ${toneOf(order, late)}`}
    >
      <button type="button" aria-haspopup="dialog" onClick={() => setOpenDetail(true)} className="flex w-full min-w-0 flex-1 flex-col text-left">
        <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
          <span className="flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold">{order.id}</span>
            <span className="font-semibold">{order.customer}</span>
            {late > 0 && <span className={`${badge} bg-red-900 text-red-100`}>Retrasado {late} min</span>}
            {order.status === 'ready' && <span className={`${badge} bg-sky-900 text-sky-100`}>Listo</span>}
          </span>
          <When order={order} now={now} />
        </span>

        <span className="mt-4 flex-1 space-y-3">
          <span className="block space-y-1 border-t border-neutral-800 pt-4 text-sm">
            {order.lines.map((line, index) => (
              <span key={index} className="block">
                {line.quantity}× {line.name}
                {line.variant && ` · ${line.variant}`}
                {line.detail && ` (${line.detail})`}
              </span>
            ))}
          </span>

          {order.note && (
            <span className="block rounded-md bg-red-950/40 px-3 py-2 text-sm font-semibold text-red-300">Nota: {order.note}</span>
          )}
        </span>

        <span className="mt-4 block text-sm text-neutral-400">
          {formatEuros(order.totalCents)}
          {order.paymentNote && ` · ${order.paymentNote}`}
        </span>
      </button>

      <div className="mt-auto pt-4">
        <a href={`tel:${order.phone.replaceAll(' ', '')}`} className="inline-block text-sm underline underline-offset-4">
          {order.phone}
        </a>

        <div className="mt-4 flex flex-col gap-2">
          {order.status === 'new' && (
            <>
              <button type="button" onClick={onStart} className={`${button} ${primaryButton}`}>
                Empezar a preparar
              </button>
              <button type="button" onClick={() => setConfirming(true)} className={`${button} ${dangerButton}`}>
                Cancelar
              </button>
            </>
          )}
          {order.status === 'preparing' && (
            <button type="button" onClick={onReady} className={`${button} ${primaryButton}`}>
              Marcar listo
            </button>
          )}
          {order.status === 'ready' && (
            <button type="button" onClick={onDeliver} className={`${button} ${deliverButton}`}>
              Entregado y cobrado
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {openDetail && <OrderDetailDialog order={order} late={late} onClose={() => setOpenDetail(false)} />}
        {confirming && (
          <CancelOrderDialog
            orderId={order.id}
            onConfirm={() => {
              setConfirming(false)
              onCancel()
            }}
            onClose={() => setConfirming(false)}
          />
        )}
      </AnimatePresence>
    </motion.article>
  )
}
