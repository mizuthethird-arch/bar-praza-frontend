import type { TeamRepository } from '../../application/ports'
import {
  cancelInvitation,
  devicesOf,
  disconnectDevice,
  inviteStaff,
  resendInvitation,
  setMemberActive,
  removeMember,
  passwordResetFor,
  setMemberPin,
  updateMember,
  type StaffDevice,
  type StaffMember,
  type TeamState,
} from '../../domain/team/team'
import { memoryStore } from './memory-store'

// Names and contact data are placeholders, not the bar's real ones.
const initial: TeamState = {
  members: [
    { id: 'm1', name: '[Titular]', email: 'titular@example.com', role: 'owner', active: true, pinSet: true, lastAccess: '2026-11-01 21:10', device: 'TABLET BARRA' },
    { id: 'm2', name: '[Uxía]', email: 'uxia@example.com', role: 'kitchen', active: true, pinSet: false, lastAccess: '2026-11-01 19:02', device: null },
    { id: 'm3', name: '[Xosé]', email: 'xose@example.com', role: 'bar', active: false, pinSet: true, lastAccess: '2026-10-30 22:40', device: 'TABLET BARRA' },
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

const initialDevices: StaffDevice[] = [
  { id: 'd1', memberId: 'm1', name: 'TABLET BARRA', rememberedOn: '2026-10-20', lastUsed: '2026-11-01 21:10', status: 'active', endedOn: null },
  { id: 'd2', memberId: 'm1', name: 'Móvil del titular', rememberedOn: '2026-09-02', lastUsed: '2026-10-02 12:00', status: 'expired', endedOn: '2026-10-02' },
  { id: 'd3', memberId: 'm2', name: 'Tablet cocina', rememberedOn: '2026-10-28', lastUsed: '2026-11-01 19:02', status: 'active', endedOn: null },
  { id: 'd4', memberId: 'm3', name: 'TABLET BARRA', rememberedOn: '2026-10-01', lastUsed: '2026-10-30 22:40', status: 'disconnected', endedOn: '2026-10-31' },
]

// The day as YYYY-MM-DD in the local time zone, which is how the person reads the calendar.
const dayOf = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function createMockTeamRepository({ now = () => new Date() }: { now?: () => Date } = {}): TeamRepository {
  const store = memoryStore(initial)
  const devices = memoryStore(initialDevices)
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
    setMemberPin: (id, pin) => changeMembers((members) => setMemberPin(members, id, pin)),
    removeMember: (id) => changeMembers((members) => removeMember(members, id)),
    sendPasswordReset: async (id) => {
      passwordResetFor((await store.read()).members, id)
    },
    updateMember: (id, changes) => changeMembers((members) => updateMember(members, id, changes)),
    saveSettings: (settings) => store.change((state) => ({ ...state, settings })),
    listDevices: async (memberId) => devicesOf(await devices.read(), memberId),
    disconnectDevice: async (memberId, deviceId) => {
      const next = await devices.change((all) => disconnectDevice(all, memberId, deviceId, dayOf(now())))
      return devicesOf(next, memberId)
    },
  }
}
