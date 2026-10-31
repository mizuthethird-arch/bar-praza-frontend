import { useState } from 'react'
import { delayedMinutes, type KitchenOrder } from '../../../domain/kitchen/kitchen'
import { minutesBetween } from '../../../domain/time/clock'
import { formatEuros } from '../../format/money'
import { outlineButton, primaryButton, deliverButton } from '../../ui/classes'
import { cardShell, neutralTone } from './KitchenColumn'

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

export function KitchenOrderCard({ order, now, onStart, onReady, onDeliver, onCancel }: Props) {
  const [confirming, setConfirming] = useState(false)
  const late = delayedMinutes(order, now)

  return (
    <article
      aria-label={`Pedido ${order.id}`}
      className={`${cardShell} ${toneOf(order, late)}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
        <h3 className="flex flex-wrap items-center gap-3">
          <span className="text-2xl font-bold">{order.id}</span>
          <span className="font-semibold">{order.customer}</span>
          {late > 0 && <span className={`${badge} bg-red-900 text-red-100`}>Retrasado {late} min</span>}
          {order.status === 'ready' && <span className={`${badge} bg-sky-900 text-sky-100`}>Listo</span>}
        </h3>
        <When order={order} now={now} />
      </header>

      <div className="mt-4 flex-1 space-y-3">
        <ul className="space-y-1 border-t border-neutral-800 pt-4 text-sm">
          {order.lines.map((line, index) => (
            <li key={index}>
              {line.quantity}× {line.name}
              {line.variant && ` · ${line.variant}`}
              {line.detail && ` (${line.detail})`}
            </li>
          ))}
        </ul>

        {order.note && (
          <p className="rounded-md bg-red-950/40 px-3 py-2 text-sm font-semibold text-red-300">Nota: {order.note}</p>
        )}
      </div>

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <a href={`tel:${order.phone.replaceAll(' ', '')}`} className="underline underline-offset-4">
            {order.phone}
          </a>
          <span className="text-neutral-400">
            {formatEuros(order.totalCents)}
            {order.paymentNote && ` · ${order.paymentNote}`}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {order.status === 'new' &&
            (confirming ? (
              <>
                <button type="button" onClick={onCancel} className={`${button} text-red-400 ${outlineButton}`}>
                  Sí, cancelar
                </button>
                <button type="button" onClick={() => setConfirming(false)} className={`${button} ${outlineButton}`}>
                  No
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={onStart} className={`${button} ${primaryButton}`}>
                  Empezar a preparar
                </button>
                <button type="button" onClick={() => setConfirming(true)} className={`${button} ${outlineButton}`}>
                  Cancelar
                </button>
              </>
            ))}
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
    </article>
  )
}
