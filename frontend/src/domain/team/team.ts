export type Role = 'owner' | 'kitchen' | 'bar'

export type StaffMember = {
  id: string
  name: string
  role: Role
  active: boolean
  invited?: boolean
  pinSet?: boolean
  lastAccess?: string | null
  device?: string | null
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
  settings: BarSettings
}

const isActiveOwner = (member: StaffMember) => member.role === 'owner' && member.active

function assertKeepsAnOwner(before: StaffMember[], after: StaffMember[]) {
  if (before.some(isActiveOwner) && !after.some(isActiveOwner)) throw new Error('At least one active owner is required')
}

export function addMember(members: StaffMember[], { name, role }: { name: string; role: Role }): StaffMember[] {
  if (name.trim() === '') throw new Error('A member needs a name')

  const lastNumber = Math.max(0, ...members.map((m) => Number(/^m(\d+)$/.exec(m.id)?.[1] ?? 0)))
  return [...members, { id: `m${lastNumber + 1}`, name: name.trim(), role, active: true }]
}

export function setMemberActive(members: StaffMember[], id: string, active: boolean): StaffMember[] {
  const next = members.map((member) => (member.id === id ? { ...member, active } : member))
  assertKeepsAnOwner(members, next)
  return next
}

export function removeMember(members: StaffMember[], id: string): StaffMember[] {
  const next = members.filter((member) => member.id !== id)
  assertKeepsAnOwner(members, next)
  return next
}
