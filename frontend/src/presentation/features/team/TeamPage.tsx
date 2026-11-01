import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  INVITATION_DAYS,
  InvitationError,
  type BarSettings,
  type InvitableRole,
  type Role,
  type StaffMember,
  type TeamState,
} from '../../../domain/team/team'
import { useServices } from '../../app/use-services'
import { useAsync } from '../../hooks/use-async'
import { AsyncView } from '../../ui/async-view'
import { bodyCell, card, fieldLabel, headCell, inputClass, primaryButton, sectionTitle, textButton } from '../../ui/classes'
import { Page, PageHeader, Reveal } from '../../ui/Page'
import { useRowMotion } from '../../ui/motion'
import { Toast } from '../../ui/Toast'
import { MemberEditDialog } from './MemberEditDialog'
import { PinDialog } from './PinDialog'

const roleLabel: Record<Role, string> = { owner: 'Titular', kitchen: 'Cocina', bar: 'Barra' }

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-emerald-500" />
    </label>
  )
}

function Error({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-sm text-red-400">
      {children}
    </p>
  )
}

const statusLabel = { active: 'Activo', deactivated: 'Desactivado', invited: 'Invitado' } as const
const statusTone = {
  active: 'bg-emerald-950 text-emerald-300',
  deactivated: 'bg-neutral-800 text-neutral-400',
  invited: 'bg-amber-950 text-amber-300',
} as const

function StatusBadge({ status }: { status: keyof typeof statusLabel }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusTone[status]}`}>{statusLabel[status]}</span>
  )
}

// A stored YYYY-MM-DD HH:mm as it is read on screen: 01/11 21:10.
const formatAccess = (when: string) => {
  const [day, time] = when.split(' ')
  return `${day.split('-').slice(1).reverse().join('/')} ${time}`
}

const invitableLabel: Record<InvitableRole, string> = { kitchen: 'Cocina', bar: 'Barra' }

// A YYYY-MM-DD day as it is written on screen: 08/11/2026.
const formatDay = (day: string) => day.split('-').reverse().join('/')

function StaffCard({ team, onChange, onNotice }: { team: TeamState; onChange: (state: TeamState) => void; onNotice: (text: string) => void }) {
  const services = useServices()
  const rowMotion = useRowMotion()
  // The card's size follows its rows as they are added and removed. Only the size animates, so the text does not stretch.
  const resize = useReducedMotion() ? false : 'size'
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InvitableRole>('kitchen')
  const [error, setError] = useState<string | null>(null)
  // The member whose edit pop-up is open, and the member whose PIN pop-up is open.
  const [editingId, setEditingId] = useState<string | null>(null)
  const editing = team.members.find((member) => member.id === editingId) ?? null
  const [pinId, setPinId] = useState<string | null>(null)
  const pinMember = team.members.find((member) => member.id === pinId) ?? null

  async function run(action: Promise<TeamState>, failure: string) {
    try {
      onChange(await action)
      setError(null)
      return true
    } catch {
      setError(failure)
      return false
    }
  }

  // The team's rules say why an invitation cannot be sent (bad email, a live invitation already), so that message is shown.
  async function invite() {
    try {
      onChange(await services.inviteMember({ email, role }))
      setEmail('')
      setError(null)
    } catch (failure) {
      setError(failure instanceof InvitationError ? failure.message : 'No se pudo enviar la invitación')
    }
  }

  // The notice is shown once the invitation is sent again, so it never claims a send that failed.
  async function resend(email: string, id: string) {
    if (await run(services.resendInvitation(id), 'No se pudo reenviar la invitación')) {
      onNotice(`Se enviará la invitación a ${email}`)
    }
  }

  // The edit pop-up keeps itself open with the error when the team's rules refuse the change.
  async function saveEdit(id: string, changes: { name: string; role: Role }) {
    onChange(await services.updateMember(id, changes))
    setEditingId(null)
  }

  // Deleting is confirmed inside the edit pop-up. The pop-up keeps itself open with the error when the rules refuse it.
  async function deleteMember(member: StaffMember) {
    onChange(await services.removeMember(member.id))
    setEditingId(null)
    onNotice(`${member.name} eliminado del equipo`)
  }

  // The PIN is never shown back, so the notice is the only confirmation.
  async function savePin(member: StaffMember, pin: string) {
    onChange(await services.setMemberPin(member.id, pin))
    setPinId(null)
    onNotice(`PIN guardado para ${member.name}`)
  }

  const ownerMessage = 'Tiene que quedar al menos un titular activo'

  return (
    <motion.section layout={resize} className={`${card} min-w-0`}>
      <h2 className={sectionTitle}>Personal</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-neutral-800">
              {['Nombre', 'Rol', 'Estado', 'PIN', 'Último acceso', 'Dispositivo'].map((title) => (
                <th key={title} className={headCell}>
                  {title}
                </th>
              ))}
              <th className={`${headCell} relative`}>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
            {team.members.map((member) => (
              <motion.tr key={member.id} variants={rowMotion} initial="hidden" animate="show" exit="exit" className="border-b border-neutral-800/70">
                <td className={`${bodyCell} font-medium`}>{member.name}</td>
                <td className={bodyCell}>{roleLabel[member.role]}</td>
                <td className={bodyCell}>
                  <StatusBadge status={member.active ? 'active' : 'deactivated'} />
                </td>
                <td className={bodyCell}>{member.pinSet ? 'Configurado' : 'Sin PIN'}</td>
                <td className={bodyCell}>{member.lastAccess ? formatAccess(member.lastAccess) : '—'}</td>
                <td className={bodyCell}>{member.device ?? '—'}</td>
                <td className={`${bodyCell} whitespace-nowrap text-right`}>
                  <button type="button" aria-label={`Editar ${member.name}`} onClick={() => setEditingId(member.id)} className={`${textButton} mr-4`}>
                    Editar
                  </button>
                  <button
                    type="button"
                    aria-label={`${member.pinSet ? 'Cambiar' : 'Poner'} PIN de ${member.name}`}
                    onClick={() => setPinId(member.id)}
                    className={`${textButton} mr-4`}
                  >
                    {member.pinSet ? 'Cambiar PIN' : 'Poner PIN'}
                  </button>
                  {/* Deactivating keeps the history; deleting is only offered from the edit pop-up. */}
                  {member.active ? (
                    <button
                      type="button"
                      aria-label={`Desactivar ${member.name}`}
                      onClick={() => void run(services.setMemberActive(member.id, false), ownerMessage)}
                      className={textButton}
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Reactivar ${member.name}`}
                      onClick={() => void run(services.setMemberActive(member.id, true), ownerMessage)}
                      className={textButton}
                    >
                      Reactivar
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
            {team.invitations.map((invitation) => (
              <motion.tr key={invitation.id} variants={rowMotion} initial="hidden" animate="show" exit="exit" className="border-b border-neutral-800/70 text-neutral-300">
                <td className={`${bodyCell} break-all`}>{invitation.email}</td>
                <td className={bodyCell}>{invitableLabel[invitation.role]}</td>
                <td className={bodyCell}>
                  <StatusBadge status="invited" />
                </td>
                <td className={bodyCell}>—</td>
                <td className={bodyCell}>—</td>
                <td className={bodyCell}>Caduca el {formatDay(invitation.expiresOn)}</td>
                <td className={`${bodyCell} whitespace-nowrap text-right`}>
                  <button
                    type="button"
                    aria-label={`Reenviar invitación a ${invitation.email}`}
                    onClick={() => void resend(invitation.email, invitation.id)}
                    className={`${textButton} mr-4`}
                  >
                    Reenviar
                  </button>
                  <button
                    type="button"
                    aria-label={`Anular invitación de ${invitation.email}`}
                    onClick={() => void run(services.cancelInvitation(invitation.id), 'No se pudo anular la invitación')}
                    className={textButton}
                  >
                    Anular
                  </button>
                </td>
              </motion.tr>
            ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-neutral-400">Las invitaciones caducan a los {INVITATION_DAYS} días y solo sirven una vez.</p>

      <div className="mt-5 grid gap-3 border-t border-neutral-800 pt-4 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
        <label className={fieldLabel}>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className={fieldLabel}>
          Rol
          <select value={role} onChange={(event) => setRole(event.target.value as InvitableRole)} className={`mt-1 ${inputClass}`}>
            {Object.entries(invitableLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => void invite()} className={primaryButton}>
          Enviar invitación
        </button>
      </div>
      {error && <div className="mt-3"><Error>{error}</Error></div>}
      <AnimatePresence>
        {editing && (
          <MemberEditDialog
            key={editing.id}
            member={editing}
            onSave={(changes) => saveEdit(editing.id, changes)}
            onDelete={() => deleteMember(editing)}
            onClose={() => setEditingId(null)}
          />
        )}
        {pinMember && (
          <PinDialog
            key={pinMember.id}
            member={pinMember}
            onSave={(pin) => savePin(pinMember, pin)}
            onClose={() => setPinId(null)}
          />
        )}
      </AnimatePresence>
    </motion.section>
  )
}

function SettingsCard({ settings, onSaved }: { settings: BarSettings; onSaved: (state: TeamState) => void }) {
  const services = useServices()
  const [draft, setDraft] = useState(settings)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const patch = (changes: Partial<BarSettings>) => {
    setDraft((current) => ({ ...current, ...changes }))
    setMessage(null)
  }

  async function save() {
    if (draft.barName.trim() === '') return setMessage({ ok: false, text: 'Indica el nombre del bar' })
    try {
      onSaved(await services.saveSettings(draft))
      setMessage({ ok: true, text: 'Ajustes guardados' })
    } catch {
      setMessage({ ok: false, text: 'No se pudieron guardar los ajustes' })
    }
  }

  return (
    <section className={`${card} min-w-0 space-y-4`}>
      <h2 className={sectionTitle}>Ajustes del bar</h2>
      {(['barName', 'phone', 'address'] as const).map((field) => (
        <label key={field} className={fieldLabel}>
          {{ barName: 'Nombre del bar', phone: 'Teléfono', address: 'Dirección' }[field]}
          <input value={draft[field]} onChange={(event) => patch({ [field]: event.target.value })} className={`mt-1 ${inputClass}`} />
        </label>
      ))}
      <div className="space-y-3 border-t border-neutral-800 pt-4">
        <Toggle label="Avisar de pedidos nuevos" checked={draft.notifyNewOrders} onChange={(value) => patch({ notifyNewOrders: value })} />
        <Toggle label="Avisar de pedidos retrasados" checked={draft.notifyDelays} onChange={(value) => patch({ notifyDelays: value })} />
      </div>
      {message &&
        (message.ok ? (
          <p role="status" className="text-sm text-emerald-400">
            {message.text}
          </p>
        ) : (
          <Error>{message.text}</Error>
        ))}
      <button type="button" onClick={() => void save()} className={`w-full py-2.5 ${primaryButton}`}>
        Guardar ajustes
      </button>
    </section>
  )
}

export function TeamPage() {
  const services = useServices()
  const state = useAsync(services.getTeam)
  const [changed, setChanged] = useState<TeamState | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  return (
    <AsyncView state={state}>
      {(loaded) => {
        const team = changed ?? loaded
        return (
          <Page>
            <PageHeader eyebrow="Datos de demostración" title="Personal y ajustes" />
            <Toast message={notice} onDone={() => setNotice(null)} />
            <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Reveal className="min-w-0">
                <StaffCard team={team} onChange={setChanged} onNotice={setNotice} />
              </Reveal>
              <Reveal className="min-w-0">
                <SettingsCard settings={loaded.settings} onSaved={setChanged} />
              </Reveal>
            </div>
          </Page>
        )
      }}
    </AsyncView>
  )
}
