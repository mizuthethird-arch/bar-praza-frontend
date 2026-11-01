import type { TeamRepository } from '../../application/ports'
import { addMember, removeMember, setMemberActive, type StaffMember, type TeamState } from '../../domain/team/team'
import { memoryStore } from './memory-store'

// Names and contact data are placeholders, not the bar's real ones.
const initial: TeamState = {
  members: [
    { id: 'm1', name: '[Titular]', role: 'owner', active: true, pinSet: true, lastAccess: 'Hoy, 09:42', device: 'TABLET BARRA' },
    { id: 'm2', name: '[Uxía]', role: 'kitchen', active: true, pinSet: true, lastAccess: 'Ayer, 21:18', device: 'Móvil' },
    { id: 'm3', name: '[Xosé]', role: 'bar', active: true, pinSet: false, lastAccess: '31 oct, 18:05', device: null },
  ],
  settings: {
    barName: 'Bar Praza',
    phone: '[Teléfono]',
    address: '[Dirección]',
    notifyNewOrders: true,
    notifyDelays: true,
  },
}

export function createMockTeamRepository(): TeamRepository {
  const store = memoryStore(initial)
  const changeMembers = (apply: (members: StaffMember[]) => StaffMember[]) =>
    store.change((state) => ({ ...state, members: apply(state.members) }))

  return {
    get: store.read,
    addMember: (member) => changeMembers((members) => addMember(members, member)),
    setMemberActive: (id, active) => changeMembers((members) => setMemberActive(members, id, active)),
    removeMember: (id) => changeMembers((members) => removeMember(members, id)),
    saveSettings: (settings) => store.change((state) => ({ ...state, settings })),
  }
}
