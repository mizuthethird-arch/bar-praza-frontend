import { useState, type ReactNode } from 'react'
import type { BarSettings, Role, TeamState } from '../../../domain/team/team'
import { useServices } from '../../app/use-services'
import { useAsync } from '../../hooks/use-async'
import { AsyncView } from '../../ui/async-view'
import { bodyCell, card, fieldLabel, headCell, inputClass, primaryButton, sectionTitle, textButton } from '../../ui/classes'
import { Page, PageHeader, Reveal } from '../../ui/Page'

const roleLabel: Record<Role, string> = { owner: 'Titular', kitchen: 'Cocina', bar: 'Barra' }

function memberStatus(member: TeamState['members'][number]) {
  if (!member.active) return 'Desactivada'
  return member.invited ? 'Invitada' : 'Activa'
}

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

function StaffCard({ team, onChange }: { team: TeamState; onChange: (state: TeamState) => void }) {
  const services = useServices()
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('kitchen')
  const [error, setError] = useState<string | null>(null)

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

  async function add() {
    if (name.trim() === '') return setError('Indica un nombre')
    if (await run(services.addMember({ name, role }), 'No se pudo añadir')) setName('')
  }

  const ownerMessage = 'Tiene que quedar al menos un titular activo'

  return (
    <section className={`${card} min-w-0`}>
      <h2 className={sectionTitle}>Personal</h2>
      <div className="team-table-scroll mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
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
            {team.members.map((member) => (
              <tr key={member.id} className="border-b border-neutral-800/70 last:border-0">
                <td className={`${bodyCell} font-medium`}>{member.name}</td>
                <td className={bodyCell}>{roleLabel[member.role]}</td>
                <td className={bodyCell}>
                  {member.invited ? (
                    <span className="rounded-full bg-sky-950 px-2 py-0.5 text-xs text-sky-300">Invitada</span>
                  ) : (
                    <label className="inline-flex items-center gap-2 whitespace-nowrap">
                      <input type="checkbox" aria-label={`Activo ${member.name}`} checked={member.active} onChange={(event) => void run(services.setMemberActive(member.id, event.target.checked), ownerMessage)} className="size-4 accent-emerald-500" />
                      <span className={`rounded-full px-2 py-0.5 text-xs ${member.active ? 'bg-emerald-950 text-emerald-300' : 'bg-neutral-800 text-neutral-300'}`}>
                        {memberStatus(member)}
                      </span>
                    </label>
                  )}
                </td>
                <td className={bodyCell}>{member.pinSet ? 'Sí' : 'No'}</td>
                <td className={`${bodyCell} whitespace-nowrap text-neutral-300`}>{member.lastAccess ?? 'Nunca'}</td>
                <td className={`${bodyCell} whitespace-nowrap text-neutral-300`}>{member.device ?? '—'}</td>
                <td className={`${bodyCell} text-right`}>
                  <button
                    type="button"
                    aria-label={`Quitar ${member.name}`}
                    onClick={() => void run(services.removeMember(member.id), ownerMessage)}
                    className={textButton}
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-3 border-t border-neutral-800 pt-4 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
        <label className={fieldLabel}>
          Nombre del miembro
          <input value={name} onChange={(event) => setName(event.target.value)} className={`mt-1 ${inputClass}`} />
        </label>
        <label className={fieldLabel}>
          Rol
          <select value={role} onChange={(event) => setRole(event.target.value as Role)} className={`mt-1 ${inputClass}`}>
            {Object.entries(roleLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => void add()} className={primaryButton}>
          Añadir
        </button>
      </div>
      {error && <div className="mt-3"><Error>{error}</Error></div>}
    </section>
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

  return (
    <AsyncView state={state}>
      {(loaded) => {
        const team = changed ?? loaded
        return (
          <Page>
            <PageHeader eyebrow="Datos de demostración" title="Personal y ajustes" />
            <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Reveal className="min-w-0">
                <StaffCard team={team} onChange={setChanged} />
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
