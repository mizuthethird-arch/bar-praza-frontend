import { useState } from 'react'
import { isBelowMinimum, type StockItem, type StockMovement } from '../../../domain/stock/stock'
import { formatQuantity, parseDecimal } from '../../format/quantity'
import { card, fieldLabel, inputClass, primaryButton } from '../../ui/classes'

type Kind = StockMovement['kind']

const kinds: { kind: Kind; label: string }[] = [
  { kind: 'in', label: 'Entrada' },
  { kind: 'waste', label: 'Merma' },
  { kind: 'count', label: 'Recuento' },
]

type Props = {
  item: StockItem
  kind: Kind
  onKindChange: (kind: Kind) => void
  onSubmit: (movement: StockMovement) => Promise<void>
}

function preview(item: StockItem, kind: Kind, amount: number): string {
  const after = kind === 'in' ? item.quantity + amount : kind === 'waste' ? Math.max(0, item.quantity - amount) : amount
  const remaining = formatQuantity(after, item.unit)
  return `Quedará en ${remaining} · ${isBelowMinimum({ ...item, quantity: after }) ? 'por debajo del' : 'por encima del'} mínimo.`
}

export function StockAdjuster({ item, kind, onKindChange, onSubmit }: Props) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const amount = parseDecimal(text)

  async function submit() {
    if (amount === null || (amount <= 0 && kind !== 'count')) return setError('Indica una cantidad')
    try {
      await onSubmit({ itemId: item.id, kind, amount })
      setText('')
      setError(null)
    } catch {
      setError('No se pudo guardar el movimiento')
    }
  }

  return (
    <aside aria-label="Ajustar stock" className={`${card} min-w-0 space-y-4`}>
      <h2 className="text-xl font-bold">Ajustar · {item.name}</h2>

      <div role="tablist" className="grid grid-cols-3 rounded-lg bg-neutral-800 p-1 text-sm">
        {kinds.map((option) => (
          <button
            key={option.kind}
            type="button"
            role="tab"
            aria-selected={option.kind === kind}
            onClick={() => onKindChange(option.kind)}
            className={`rounded-md py-2 ${option.kind === kind ? 'bg-neutral-100 font-medium text-neutral-950' : 'text-neutral-400'}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className={fieldLabel}>
        Cantidad ({item.unit})
        <input value={text} onChange={(event) => setText(event.target.value)} inputMode="decimal" className={`mt-1 ${inputClass}`} />
      </label>

      {kind === 'in' && (
        <label className={fieldLabel}>
          Proveedor
          <select className={`mt-1 ${inputClass}`} defaultValue="">
            <option value="">[Proveedor]</option>
          </select>
        </label>
      )}

      {amount !== null && <p className="text-xs text-neutral-400">{preview(item, kind, amount)}</p>}

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button type="button" onClick={() => void submit()} className={`w-full py-2.5 ${primaryButton}`}>
        Guardar movimiento
      </button>
    </aside>
  )
}
