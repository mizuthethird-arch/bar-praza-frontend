import type { TeamRepository } from '../../application/ports'
import {
  cancelInvitation,
  inviteStaff,
  resendInvitation,
  setMemberActive,
  updateMember,
  type StaffMember,
  type TeamState,
} from '../../domain/team/team'
import { memoryStore } from './memory-store'

// Names and contact data are placeholders, not the bar's real ones.
const initial: TeamState = {
  members: [
    { id: 'm1', name: '[Titular]', role: 'owner', active: true, pinSet: true, lastAccess: '2026-11-01 21:10', device: 'TABLET BARRA' },
    { id: 'm2', name: '[Uxía]', role: 'kitchen', active: true, pinSet: false, lastAccess: '2026-11-01 19:02', device: null },
    { id: 'm3', name: '[Xosé]', role: 'bar', active: false, pinSet: true, lastAccess: '2026-10-30 22:40', device: 'TABLET BARRA' },
  ],
  invitations: [],
  settings: {
    barName: 'Bar Praza',
    phone: '[Teléfono]',
    address: '[Dirección]',
    notifyNewOrders: true,
    notifyDelays: true,
  },
}

// The day as YYYY-MM-DD in the local time zone, which is how the person reads the calendar.
const dayOf = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function createMockTeamRepository({ now = () => new Date() }: { now?: () => Date } = {}): TeamRepository {
  const store = memoryStore(initial)
  const changeMembers = (apply: (members: StaffMember[]) => StaffMember[]) =>
    store.change((state) => ({ ...state, members: apply(state.members) }))

  return {
    get: store.read,
    inviteMember: (invite) =>
      store.change((state) => ({ ...state, invitations: inviteStaff(state.invitations, invite, dayOf(now())) })),
    cancelInvitation: (id) => store.change((state) => ({ ...state, invitations: cancelInvitation(state.invitations, id) })),
    resendInvitation: (id) =>
      store.change((state) => ({ ...state, invitations: resendInvitation(state.invitations, id, dayOf(now())) })),
    setMemberActive: (id, active) => changeMembers((members) => setMemberActive(members, id, active)),
    updateMember: (id, changes) => changeMembers((members) => updateMember(members, id, changes)),
    saveSettings: (settings) => store.change((state) => ({ ...state, settings })),
  }
}
