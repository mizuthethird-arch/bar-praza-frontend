import { canCancel, type OrderEntry } from '../../../domain/orders/order-log'
import { formatEuros } from '../../format/money'
import { card, outlineButton, primaryButton } from '../../ui/classes'

type Props = { entry: OrderEntry | undefined; error?: string | null; onCancel: (id: string) => void }

export function OrderDetail({ entry, error, onCancel }: Props) {
  if (!entry) {
    return (
      <aside aria-label="Detalle del pedido" className={`${card} text-sm text-neutral-400`}>
        Elige un pedido para ver su detalle.
      </aside>
    )
  }

  const phoneHref = entry.phone ? `tel:${entry.phone.replaceAll(' ', '')}` : undefined

  return (
    <aside aria-label="Detalle del pedido" className={`${card} min-w-0`}>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold">{entry.id}</h2>
        {entry.delayedMinutes ? (
          <span className="rounded-full bg-red-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-100">
            Retrasado {entry.delayedMinutes} min
          </span>
        ) : null}
      </div>

      <p className="mt-4 font-semibold">{entry.customer}</p>
      {entry.phone && (
        <a href={phoneHref} className="text-sm underline underline-offset-4">
          {entry.phone}
        </a>
      )}
      {entry.fulfilment && <p className="mt-1 text-sm text-neutral-400">{entry.fulfilment}</p>}

      <ul className="mt-4 space-y-1 border-t border-neutral-800 pt-4 text-sm">
        {/* An order's lines and events never reorder, and the same dish can appear twice. */}
        {entry.lines.map((line, index) => (
          <li key={index} className="flex justify-between gap-3">
            <span>
              {line.quantity}× {line.name}
              {line.variant && ` · ${line.variant}`}
            </span>
            <span>{formatEuros(line.totalCents)}</span>
          </li>
        ))}
        <li className="flex justify-between gap-3 border-t border-neutral-800 pt-2 font-bold">
          <span>Total</span>
          <span>{formatEuros(entry.totalCents)}</span>
        </li>
      </ul>

      <ul className="mt-4 space-y-2 border-t border-neutral-800 pt-4 text-sm">
        {entry.timeline.map((event, index) => (
          <li key={index} className={`flex gap-4 ${event.alert ? 'font-semibold text-red-400' : ''}`}>
            <span className={event.alert ? '' : 'text-neutral-400'}>{event.time}</span>
            <span>{event.text}</span>
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {phoneHref ? (
          <a href={phoneHref} className={`${primaryButton} text-center`}>
            Llamar al cliente
          </a>
        ) : (
          <button type="button" disabled className={`${primaryButton} opacity-40`}>
            Llamar al cliente
          </button>
        )}
        <button
          type="button"
          disabled={!canCancel(entry)}
          onClick={() => onCancel(entry.id)}
          className={`px-4 py-2 text-red-400 disabled:cursor-not-allowed disabled:opacity-40 ${outlineButton}`}
        >
          Cancelar pedido
        </button>
      </div>
    </aside>
  )
}
