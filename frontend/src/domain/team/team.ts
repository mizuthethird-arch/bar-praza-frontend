import { isValidPin } from '../auth/pin'

export type Role = 'owner' | 'kitchen' | 'bar'

// Only kitchen and bar staff can be invited. The owner is set up once, for the restaurant (D-1, SCH-3).
export type InvitableRole = Exclude<Role, 'owner'>

export type StaffMember = {
  id: string
  name: string
  // Where a password recovery link is sent.
  email: string
  role: Role
  active: boolean
  // Whether the person has set a PIN for the device they use.
  pinSet: boolean
  // The last time the person signed in, as YYYY-MM-DD HH:mm, or null when they never have.
  lastAccess: string | null
  // The tablet or phone this person's PIN is kept on, or null.
  device: string | null
}

// An invitation sent by email. It works once (D-3) and lasts seven days from when it was sent (D-2).
export type Invitation = {
  id: string
  email: string
  role: InvitableRole
  // The last day it can be used, as YYYY-MM-DD.
  expiresOn: string
}

// A device that remembers a staff member, so the PIN opens it. Only an active device can be disconnected.
export type DeviceStatus = 'active' | 'disconnected' | 'expired'

export type StaffDevice = {
  id: string
  memberId: string
  name: string
  // The day the device started remembering the member, as YYYY-MM-DD.
  rememberedOn: string
  // The last time it was used, as YYYY-MM-DD HH:mm, or null when it never was.
  lastUsed: string | null
  status: DeviceStatus
  // The day it stopped being remembered, as YYYY-MM-DD, or null while it is active.
  endedOn: string | null
}

export type BarSettings = {
  barName: string
  phone: string
  address: string
  notifyNewOrders: boolean
  notifyDelays: boolean
}

export type TeamState = {
  members: StaffMember[]
  invitations: Invitation[]
  settings: BarSettings
}

// Thrown when an invitation breaks a rule. The message is for the person, so the page shows it as it is.
export class InvitationError extends Error {}

export const INVITATION_DAYS = 7

const isActiveOwner = (member: StaffMember) => member.role === 'owner' && member.active

function assertKeepsAnOwner(before: StaffMember[], after: StaffMember[]) {
  if (before.some(isActiveOwner) && !after.some(isActiveOwner)) throw new MemberError('Tiene que quedar al menos un titular activo')
}

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

// The day `days` days after a YYYY-MM-DD date, as YYYY-MM-DD. Calendar days, so time zones do not matter.
function addDays(day: string, days: number): string {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, date + days)).toISOString().slice(0, 10)
}

// Sends an invitation. `today` is the day it is sent, as YYYY-MM-DD. An email that already has an invitation
// still in its seven days cannot get another one.
export function inviteStaff(
  invitations: Invitation[],
  { email, role }: { email: string; role: InvitableRole },
  today: string,
): Invitation[] {
  const address = email.trim().toLowerCase()
  if (!isValidEmail(address)) throw new InvitationError('Indica un email válido')
  if (role !== 'kitchen' && role !== 'bar') throw new InvitationError('Solo se puede invitar a cocina o barra')
  if (invitations.some((invitation) => invitation.email === address && invitation.expiresOn >= today)) {
    throw new InvitationError('Ya hay una invitación para ese email')
  }

  const lastNumber = Math.max(0, ...invitations.map((invitation) => Number(/^i(\d+)$/.exec(invitation.id)?.[1] ?? 0)))
  return [...invitations, { id: `i${lastNumber + 1}`, email: address, role, expiresOn: addDays(today, INVITATION_DAYS) }]
}

// Cancels an invitation that has not been used. Its link stops working at once.
export function cancelInvitation(invitations: Invitation[], id: string): Invitation[] {
  if (!invitations.some((invitation) => invitation.id === id)) throw new InvitationError('Esa invitación ya no existe')
  return invitations.filter((invitation) => invitation.id !== id)
}

// Sends the same invitation again. It gets seven new days from `today`, so an expired one can be used once more.
// It is refused when that email already has another invitation still in its days, so one email never has two.
export function resendInvitation(invitations: Invitation[], id: string, today: string): Invitation[] {
  const invitation = invitations.find((item) => item.id === id)
  if (!invitation) throw new InvitationError('Esa invitación ya no existe')
  const hasOtherLive = invitations.some((item) => item.id !== id && item.email === invitation.email && item.expiresOn >= today)
  if (hasOtherLive) throw new InvitationError('Ya hay una invitación para ese email')
  return invitations.map((item) => (item.id === id ? { ...item, expiresOn: addDays(today, INVITATION_DAYS) } : item))
}

// Thrown when an edit breaks a rule. The message is for the person, so the page shows it as it is.
export class MemberError extends Error {}

// Changes a member's name and role. The owner's role is fixed, and nobody else can become the owner (D-1, SCH-3).
export function updateMember(members: StaffMember[], id: string, { name, role }: { name: string; role: Role }): StaffMember[] {
  const member = members.find((item) => item.id === id)
  if (!member) throw new MemberError('Ese miembro ya no existe')
  const trimmed = name.trim()
  if (trimmed === '') throw new MemberError('Indica un nombre')
  if (member.role === 'owner' && role !== 'owner') throw new MemberError('El titular no puede cambiar de rol')
  if (member.role !== 'owner' && role === 'owner') throw new MemberError('Solo se puede cambiar entre cocina y barra')
  return members.map((item) => (item.id === id ? { ...item, name: trimmed, role } : item))
}

// Sets or changes a member's PIN. Only whether a PIN is set is kept here: the PIN itself is held by the backend.
export function setMemberPin(members: StaffMember[], id: string, pin: string): StaffMember[] {
  if (!members.some((member) => member.id === id)) throw new MemberError('Ese miembro ya no existe')
  if (!isValidPin(pin)) throw new MemberError('El PIN tiene 4 cifras')
  return members.map((member) => (member.id === id ? { ...member, pinSet: true } : member))
}

// Deactivating keeps the person's history, and they can be reactivated later.
export function setMemberActive(members: StaffMember[], id: string, active: boolean): StaffMember[] {
  const next = members.map((member) => (member.id === id ? { ...member, active } : member))
  assertKeepsAnOwner(members, next)
  return next
}

// One member's devices, with the active ones first; the rest are the history.
export function devicesOf(devices: StaffDevice[], memberId: string): StaffDevice[] {
  const active = devices.filter((device) => device.memberId === memberId && device.status === 'active')
  const history = devices.filter((device) => device.memberId === memberId && device.status !== 'active')
  return [...active, ...history]
}

// Disconnects a device: the next visit from it asks for the password again. `today` is the day, as YYYY-MM-DD.
export function disconnectDevice(devices: StaffDevice[], memberId: string, deviceId: string, today: string): StaffDevice[] {
  const device = devices.find((item) => item.id === deviceId && item.memberId === memberId)
  if (!device) throw new MemberError('Ese dispositivo ya no existe')
  if (device.status !== 'active') throw new MemberError('Ese dispositivo ya no está conectado')
  return devices.map((item) => (item.id === deviceId ? { ...item, status: 'disconnected', endedOn: today } : item))
}

// The member a password recovery link is sent to. A deactivated member is not sent one: reactivate them first.
export function passwordResetFor(members: StaffMember[], id: string): StaffMember {
  const member = members.find((item) => item.id === id)
  if (!member) throw new MemberError('Ese miembro ya no existe')
  if (!member.active) throw new MemberError('Reactiva a la persona antes de enviarle el enlace')
  return member
}

// Deletes a member. It is only offered from the edit pop-up, after a confirmation. The last active owner stays.
export function removeMember(members: StaffMember[], id: string): StaffMember[] {
  if (!members.some((member) => member.id === id)) throw new MemberError('Ese miembro ya no existe')
  const next = members.filter((member) => member.id !== id)
  assertKeepsAnOwner(members, next)
  return next
}
