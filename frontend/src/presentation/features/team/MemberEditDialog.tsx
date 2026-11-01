import { useId, useState } from 'react'
import { MemberError, type Role, type StaffMember } from '../../../domain/team/team'
import { fieldLabel, inputClass, primaryButton } from '../../ui/classes'
import { Sheet } from '../../ui/Sheet'

type Props = {
  member: StaffMember
  // Saves the change. It throws when the team's rules refuse it, and the pop-up shows why.
  onSave: (changes: { name: string; role: Role }) => Promise<void>
  onClose: () => void
}

const invitableLabel: Record<Exclude<Role, 'owner'>, string> = { kitchen: 'Cocina', bar: 'Barra' }

// Edits a staff member's name and role. The owner's role is fixed, so it is only shown.
export function MemberEditDialog({ member, onSave, onClose }: Props) {
  const titleId = useId()
  const [name, setName] = useState(member.name)
  const [role, setRole] = useState<Role>(member.role)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    try {
      await onSave({ name, role })
    } catch (failure) {
      setError(failure instanceof MemberError ? failure.message : 'No se pudo guardar el cambio')
    }
  }

  return (
    <Sheet
      titleId={titleId}
      onClose={onClose}
      closeLabel="Cancelar"
      footer={
        <button type="button" onClick={() => void save()} className={`px-4 py-2 ${primaryButton}`}>
          Guardar
        </button>
      }
    >
      <h2 id={titleId} className="text-xl font-bold">
        Editar · {member.name}
      </h2>

      <div className="mt-5 space-y-4">
        <label className={fieldLabel}>
          Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} className={`mt-1 ${inputClass}`} />
        </label>

        {member.role === 'owner' ? (
          <div>
            <p className={fieldLabel}>Rol</p>
            <p className="mt-1 text-sm text-neutral-200">Titular (no se puede cambiar)</p>
          </div>
        ) : (
          <label className={fieldLabel}>
            Rol
            <select value={role} onChange={(event) => setRole(event.target.value as Role)} className={`mt-1 ${inputClass}`}>
              {Object.entries(invitableLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </Sheet>
  )
}
