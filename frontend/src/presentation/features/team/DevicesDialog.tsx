import { useId, useState } from 'react'
import { formatAccess, formatDay } from '../../format/day'
import { MemberError, type StaffDevice, type StaffMember } from '../../../domain/team/team'
import { useServices } from '../../app/use-services'
import { useAsync } from '../../hooks/use-async'
import { outlineButton } from '../../ui/classes'
import { Sheet } from '../../ui/Sheet'

type Props = {
  member: StaffMember
  onClose: () => void
}

const sectionLabel = 'text-xs uppercase tracking-widest text-neutral-400'
// Every device card uses the same three columns, so its name, details and action line up with the others.
const deviceCard = 'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8rem] items-center gap-3 rounded-lg border border-neutral-800 px-4 py-3'

// Says when a past device stopped being remembered: disconnected by the owner, or expired on its own.
const endedText = (device: StaffDevice) => {
  const day = device.endedOn ? formatDay(device.endedOn) : '—'
  return device.status === 'disconnected' ? `Desconectado el ${day}` : `Caducado el ${day}`
}

// The devices that remember a staff member. Active ones can be disconnected by the owner; the others are the history.
export function DevicesDialog({ member, onClose }: Props) {
  const services = useServices()
  const titleId = useId()
  const loaded = useAsync(() => services.listDevices(member.id))
  const [latest, setLatest] = useState<StaffDevice[] | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const devices = latest ?? loaded.data

  async function disconnect(device: StaffDevice) {
    try {
      setLatest(await services.disconnectDevice(member.id, device.id))
      setMessage({ ok: true, text: `Desconectado: ${device.name}` })
    } catch (failure) {
      setMessage({ ok: false, text: failure instanceof MemberError ? failure.message : 'No se pudo desconectar el dispositivo' })
    }
  }

  const active = devices?.filter((device) => device.status === 'active') ?? []
  const history = devices?.filter((device) => device.status !== 'active') ?? []

  return (
    <Sheet titleId={titleId} onClose={onClose} closeLabel="Cerrar">
      <h2 id={titleId} className="text-xl font-bold">
        Dispositivos · {member.name}
      </h2>

      {loaded.status === 'error' && (
        <p role="alert" className="mt-5 text-sm text-red-400">
          No se pudieron cargar los dispositivos
        </p>
      )}
      {loaded.status === 'loading' && <p className="mt-5 text-sm text-neutral-400">Cargando…</p>}

      {devices && (
        <div className="mt-5 space-y-6">
          <section className="space-y-3">
            <h3 className={sectionLabel}>Conectados</h3>
            {active.length === 0 && <p className="text-sm text-neutral-400">Ningún dispositivo conectado.</p>}
            <div className="grid gap-2">
              {active.map((device) => (
                <div key={device.id} className={deviceCard}>
                  <p className="min-w-0 break-all font-medium">{device.name}</p>
                  <p className="min-w-0 text-xs text-neutral-400">
                    Recordado desde {formatDay(device.rememberedOn)} · último uso {device.lastUsed ? formatAccess(device.lastUsed) : 'nunca'}
                  </p>
                  <button
                    type="button"
                    aria-label={`Desconectar ${device.name} de ${member.name}`}
                    onClick={() => void disconnect(device)}
                    className={`justify-self-end px-3 py-1.5 ${outlineButton}`}
                  >
                    Desconectar
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className={sectionLabel}>Historial</h3>
            {history.length === 0 && <p className="text-sm text-neutral-400">Sin historial.</p>}
            <div className="grid gap-2">
              {history.map((device) => (
                <div key={device.id} className={`${deviceCard} text-neutral-300`}>
                  <p className="min-w-0 break-all font-medium">{device.name}</p>
                  <p className="min-w-0 text-xs text-neutral-400">
                    {endedText(device)} · último uso {device.lastUsed ? formatAccess(device.lastUsed) : 'nunca'}
                  </p>
                  <span aria-hidden="true" />
                </div>
              ))}
            </div>
          </section>

          {message &&
            (message.ok ? (
              <p role="status" className="text-sm text-emerald-400">
                {message.text}
              </p>
            ) : (
              <p role="alert" className="text-sm text-red-400">
                {message.text}
              </p>
            ))}
        </div>
      )}
    </Sheet>
  )
}
