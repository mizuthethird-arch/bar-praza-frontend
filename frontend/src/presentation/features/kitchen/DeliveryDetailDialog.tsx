import { useId } from 'react'
import type { DeliveredOrder } from '../../../domain/kitchen/kitchen'
import { formatEuros } from '../../format/money'
import { Sheet } from '../../ui/Sheet'

type Props = { order: DeliveredOrder; onClose: () => void }

// Details of a delivered order, for when something went wrong.
export function DeliveryDetailDialog({ order, onClose }: Props) {
  const titleId = useId()

  return (
    <Sheet titleId={titleId} onClose={onClose} footer={<span className="font-bold">{formatEuros(order.totalCents)}</span>}>
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
    </Sheet>
  )
}
