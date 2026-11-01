import { useId } from 'react'
import type { KitchenOrder, KitchenStatus } from '../../../domain/kitchen/kitchen'
import { formatEuros } from '../../format/money'
import { Sheet } from '../../ui/Sheet'

type Props = { order: KitchenOrder; late: number; onClose: () => void }

const statusLabel: Record<KitchenStatus, string> = { new: 'Nuevo', preparing: 'En curso', ready: 'Listo' }

// Everything the kitchen knows about one order, opened by pressing its card.
export function OrderDetailDialog({ order, late, onClose }: Props) {
  const titleId = useId()

  return (
    <Sheet titleId={titleId} onClose={onClose} footer={<span className="font-bold">{formatEuros(order.totalCents)}</span>}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={titleId} className="text-xl font-bold">{`Pedido ${order.id} · ${order.customer}`}</h2>
        <span className="flex flex-wrap gap-2">
          <span className="rounded-full bg-neutral-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-100">
            {statusLabel[order.status]}
          </span>
          {late > 0 && (
            <span className="rounded-full bg-red-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-100">
              Retrasado {late} min
            </span>
          )}
        </span>
      </header>

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-neutral-400">Recogida</dt>
        <dd>{order.pickupTime}</dd>
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
