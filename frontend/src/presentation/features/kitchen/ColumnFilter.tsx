import { pillActive, pillIdle } from '../../ui/classes'

export type ColumnKey = 'fresh' | 'preparing' | 'ready' | 'delivered'

export const columnLabels: Record<ColumnKey, string> = {
  fresh: 'Nuevos',
  preparing: 'En curso',
  ready: 'Listos',
  delivered: 'Entregados',
}

const keys = Object.keys(columnLabels) as ColumnKey[]
const allShown = Object.fromEntries(keys.map((key) => [key, true])) as Record<ColumnKey, boolean>

// Shows or hides the kitchen columns. Several can be on at once; the last one that is on cannot be turned off.
export function ColumnFilter({
  shown,
  onChange,
}: {
  shown: Record<ColumnKey, boolean>
  onChange: (next: Record<ColumnKey, boolean>) => void
}) {
  const count = keys.filter((key) => shown[key]).length
  const everything = count === keys.length

  return (
    <div role="group" aria-label="Mostrar columnas" className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={everything}
        onClick={() => onChange(allShown)}
        className={`rounded-full border px-3 py-1 text-xs font-semibold ${everything ? pillActive : pillIdle}`}
      >
        Todos
      </button>
      {keys.map((key) => {
        const on = shown[key]
        return (
          <button
            key={key}
            type="button"
            aria-pressed={on}
            disabled={on && count === 1}
            onClick={() => onChange({ ...shown, [key]: !on })}
            className={`rounded-full border px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${on ? pillActive : pillIdle}`}
          >
            {columnLabels[key]}
          </button>
        )
      })}
    </div>
  )
}
