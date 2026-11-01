import { useId, useState } from 'react'
import { PIN_LENGTH } from '../../../domain/auth/pin'
import { MemberError, type StaffMember } from '../../../domain/team/team'
import { fieldLabel, inputClass, primaryButton } from '../../ui/classes'
import { Sheet } from '../../ui/Sheet'

type Props = {
  member: StaffMember
  // Saves the PIN. It throws when the team's rules refuse it, and the pop-up shows why.
  onSave: (pin: string) => Promise<void>
  onClose: () => void
}

// Only digits, at most PIN_LENGTH of them: the field cannot hold anything else.
const digitsOnly = (value: string) => value.replace(/\D/g, '').slice(0, PIN_LENGTH)

// Sets or changes a staff member's PIN. It is typed twice, so a typo does not lock someone out.
export function PinDialog({ member, onSave, onClose }: Props) {
  const titleId = useId()
  const [pin, setPin] = useState('')
  const [repeat, setRepeat] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (pin !== repeat) return setError('Los PIN no coinciden')
    try {
      await onSave(pin)
    } catch (failure) {
      setError(failure instanceof MemberError ? failure.message : 'No se pudo guardar el PIN')
    }
  }

  return (
    <Sheet
      titleId={titleId}
      onClose={onClose}
      closeLabel="Cancelar"
      footer={
        <button type="button" onClick={() => void save()} className={`px-4 py-2 ${primaryButton}`}>
          Guardar PIN
        </button>
      }
    >
      <h2 id={titleId} className="text-xl font-bold">
        {member.pinSet ? 'Cambiar PIN' : 'Poner PIN'} · {member.name}
      </h2>

      <div className="mt-5 space-y-4">
        <label className={fieldLabel}>
          PIN nuevo ({PIN_LENGTH} cifras)
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(event) => setPin(digitsOnly(event.target.value))}
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={fieldLabel}>
          Repite el PIN
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={repeat}
            onChange={(event) => setRepeat(digitsOnly(event.target.value))}
            className={`mt-1 ${inputClass}`}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </Sheet>
  )
}
