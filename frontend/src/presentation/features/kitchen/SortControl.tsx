import { pillActive, pillIdle } from '../../ui/classes'

type Option<T extends string> = { value: T; label: string }

// Two or more ways to order a column, shown as toggle buttons. The one in use is pressed.
export function SortControl<T extends string>({
  column,
  options,
  value,
  onChange,
}: {
  column: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div role="group" aria-label={`Ordenar ${column}`} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${active ? pillActive : pillIdle}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
