import { useId } from 'react'
import { primaryButton } from '../../ui/classes'
import { Sheet } from '../../ui/Sheet'

type Props = { onConfirm: () => void; onClose: () => void }

// Asks before "Cerrar turno" takes effect. Focus starts on No, so a stray Enter does not close the shift.
export function CloseShiftDialog({ onConfirm, onClose }: Props) {
  const titleId = useId()

  return (
    <Sheet
      titleId={titleId}
      onClose={onClose}
      closeLabel="No"
      footer={
        <button type="button" onClick={onConfirm} className={`px-4 py-2 ${primaryButton}`}>
          Sí
        </button>
      }
    >
      <h2 id={titleId} className="text-xl font-bold">
        ¿Cerrar el turno?
      </h2>
      <p className="mt-3 text-sm text-neutral-300">¿Seguro que quieres cerrar el turno de cocina?</p>
    </Sheet>
  )
}
