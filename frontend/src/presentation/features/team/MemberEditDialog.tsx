import { useId, useState } from 'react'
import { MemberError, type Role, type StaffMember } from '../../../domain/team/team'
import { fieldLabel, inputClass, outlineButton, primaryButton } from '../../ui/classes'
import { Sheet } from '../../ui/Sheet'

type Props = {
  member: StaffMember
  // Saves the change. It throws when the team's rules refuse it, and the pop-up shows why.
  onSave: (changes: { name: string; role: Role }) => Promise<void>
  // Deletes the member once the person has confirmed. It throws when the team's rules refuse it.
  onDelete: () => Promise<void>
  // Sends the member a link to choose a new password. It throws when the team's rules refuse it.
  onSendReset: () => Promise<void>
  onClose: () => void
}

const invitableLabel: Record<Exclude<Role, 'owner'>, string> = { kitchen: 'Cocina', bar: 'Barra' }

// Edits a staff member's name and role, and can delete the member. Deleting asks first: focus starts on "No",
// so a stray Enter does not delete anyone.
export function MemberEditDialog({ member, onSave, onDelete, onSendReset, onClose }: Props) {
  const titleId = useId()
  const [name, setName] = useState(member.name)
  const [role, setRole] = useState<Role>(member.role)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    try {
      await onSave({ name, role })
    } catch (failure) {
      setError(failure instanceof MemberError ? failure.message : 'No se pudo guardar el cambio')
    }
  }

  async function sendReset() {
    try {
      await onSendReset()
    } catch (failure) {
      setError(failure instanceof MemberError ? failure.message : 'No se pudo enviar el enlace')
    }
  }

  async function remove() {
    try {
      await onDelete()
    } catch (failure) {
      setError(failure instanceof MemberError ? failure.message : 'No se pudo eliminar el miembro')
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

        <div className="space-y-2 border-t border-neutral-800 pt-4">
          <p className={fieldLabel}>Contraseña</p>
          <p className="text-sm text-neutral-300">
            Se enviará a {member.email} un enlace para elegir una contraseña nueva. El enlace se usa una sola vez.
          </p>
          <button type="button" disabled={!member.active} onClick={() => void sendReset()} className={`px-4 py-2 ${outlineButton}`}>
            Enviar enlace para cambiar la contraseña
          </button>
          {!member.active && <p className="text-xs text-neutral-400">Reactiva a la persona para enviarle el enlace.</p>}
        </div>

        <div className="border-t border-neutral-800 pt-4">
          {confirming ? (
            <div className="space-y-3">
              <p className="text-sm text-neutral-300">¿Eliminar a {member.name}? Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button type="button" autoFocus onClick={() => setConfirming(false)} className={`px-4 py-2 ${outlineButton}`}>
                  No
                </button>
                <button type="button" onClick={() => void remove()} className="rounded-md border border-red-800 bg-red-950 px-4 py-2 text-sm font-semibold text-red-200">
                  Sí, eliminar
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="text-sm text-red-400 underline underline-offset-4">
              Eliminar miembro
            </button>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </Sheet>
  )
}
