import { useId } from 'react'
import { dangerSolidButton } from '../../ui/classes'
import { Sheet } from '../../ui/Sheet'

type Props = { orderId: string; onConfirm: () => void; onClose: () => void }

// Asks before an order is cancelled, in a yellow warning. Focus starts on No, so a stray Enter keeps the order.
export function CancelOrderDialog({ orderId, onConfirm, onClose }: Props) {
  const titleId = useId()

  return (
    <Sheet
      titleId={titleId}
      onClose={onClose}
      closeLabel="No"
      footer={
        <button type="button" onClick={onConfirm} className={`px-4 py-2 ${dangerSolidButton}`}>
          Sí
        </button>
      }
    >
      <h2 id={titleId} className="text-xl font-bold">
        {`¿Cancelar el pedido ${orderId}?`}
      </h2>
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-yellow-700 bg-yellow-950/60 p-4 text-sm font-semibold text-yellow-200">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 fill-none stroke-current stroke-2">
          <path d="M12 3 2 20h20L12 3Z" strokeLinejoin="round" />
          <path d="M12 10v4M12 17v.5" strokeLinecap="round" />
        </svg>
        <p>Estás por cancelar este pedido. Esta acción no se puede deshacer.</p>
      </div>
    </Sheet>
  )
}
