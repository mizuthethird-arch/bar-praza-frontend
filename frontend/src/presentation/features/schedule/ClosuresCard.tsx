import { useState, type FormEvent } from 'react'
import type { SpecialClosure } from '../../../domain/schedule/schedule'
import { isIsoDate } from '../../../domain/schedule/schedule-changes'
import { card, outlineButton, primaryButton, sectionTitle, selectClass, textButton } from '../../ui/classes'

type Props = {
  closures: SpecialClosure[]
  onAdd: (closure: SpecialClosure) => Promise<void>
  onRemove: (closure: SpecialClosure) => void
}

export function ClosuresCard({ closures, onAdd, onRemove }: Props) {
  const [adding, setAdding] = useState(false)
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (note.trim() === '') {
      setError('Indica un motivo para el cierre')
      return
    }
    if (!isIsoDate(date)) {
      setError('Indica una fecha válida (AAAA-MM-DD)')
      return
    }
    try {
      await onAdd({ date, note })
      setAdding(false)
      setDate('')
      setNote('')
      setError(null)
    } catch {
      setError('No se pudo guardar el cierre')
    }
  }

  return (
    <section className={card}>
      <h2 className={sectionTitle}>Cierres especiales</h2>
      <ul className="mt-4 divide-y divide-neutral-800 text-sm">
        {closures.map((closure) => (
          <li key={`${closure.date}-${closure.note}`} className="flex items-center justify-between gap-3 py-3">
            <span>
              {closure.date} · {closure.note}
            </span>
            <button type="button" onClick={() => onRemove(closure)} className={`shrink-0 ${textButton}`}>
              Quitar
            </button>
          </li>
        ))}
      </ul>
      {adding ? (
        <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
          <label className="block text-xs text-neutral-400">
            Fecha del cierre
            <input
              type="text"
              placeholder="AAAA-MM-DD"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={`mt-1 block w-full ${selectClass}`}
            />
          </label>
          <label className="block text-xs text-neutral-400">
            Motivo
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className={`mt-1 block w-full ${selectClass}`}
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button type="submit" className={primaryButton}>
              Guardar cierre
            </button>
            <button type="button" onClick={() => setAdding(false)} className={`px-4 py-2 ${outlineButton}`}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className={`mt-4 w-full py-2.5 ${outlineButton}`}>
          Añadir cierre
        </button>
      )}
    </section>
  )
}
