import { describe, expect, it } from 'vitest'
import { cancelInvitation, InvitationError, inviteStaff, removeMember, setMemberActive, type Invitation, type StaffMember } from './team'

const members: StaffMember[] = [
  { id: 'm1', name: 'Titular', role: 'owner', active: true, pinSet: true, lastAccess: null, device: null },
  { id: 'm2', name: 'Uxía', role: 'kitchen', active: true, pinSet: false, lastAccess: null, device: null },
]

describe('inviting staff', () => {
  it('sends an invitation with a lowercase email, the role, and a 7-day expiry', () => {
    const result = inviteStaff([], { email: '  Xosé@Bar.COM ', role: 'bar' }, '2026-11-01')

    expect(result).toEqual([{ id: 'i1', email: 'xosé@bar.com', role: 'bar', expiresOn: '2026-11-08' }])
  })

  it('counts the 7 days across a month end', () => {
    const [sent] = inviteStaff([], { email: 'a@b.es', role: 'kitchen' }, '2026-10-28')

    expect(sent.expiresOn).toBe('2026-11-04')
  })

  it('rejects an email that is not an address', () => {
    expect(() => inviteStaff([], { email: 'nope', role: 'bar' }, '2026-11-01')).toThrow(InvitationError)
  })

  it('rejects an owner invitation, even when the role is forced past the types', () => {
    expect(() => inviteStaff([], { email: 'a@b.es', role: 'owner' as 'bar' }, '2026-11-01')).toThrow('Solo se puede invitar a cocina o barra')
  })

  it('does not send a second invitation to an email that still has a live one', () => {
    const live: Invitation[] = [{ id: 'i1', email: 'a@b.es', role: 'kitchen', expiresOn: '2026-11-08' }]

    expect(() => inviteStaff(live, { email: 'A@b.es', role: 'bar' }, '2026-11-08')).toThrow('Ya hay una invitación para ese email')
  })

  it('allows a new invitation once the old one has expired', () => {
    const expired: Invitation[] = [{ id: 'i1', email: 'a@b.es', role: 'kitchen', expiresOn: '2026-11-08' }]

    const result = inviteStaff(expired, { email: 'a@b.es', role: 'bar' }, '2026-11-09')

    expect(result.map((invitation) => invitation.id)).toEqual(['i1', 'i2'])
  })

  it('never invites the same email into two roles', () => {
    const first = inviteStaff([], { email: 'a@b.es', role: 'kitchen' }, '2026-11-01')

    expect(() => inviteStaff(first, { email: 'a@b.es', role: 'bar' }, '2026-11-02')).toThrow(InvitationError)
  })
})

describe('cancelling an invitation', () => {
  it('removes that invitation and keeps the others', () => {
    const invitations: Invitation[] = [
      { id: 'i1', email: 'a@b.es', role: 'kitchen', expiresOn: '2026-11-08' },
      { id: 'i2', email: 'c@d.es', role: 'bar', expiresOn: '2026-11-08' },
    ]

    expect(cancelInvitation(invitations, 'i1').map((i) => i.id)).toEqual(['i2'])
  })

  it('refuses an invitation that is not there any more', () => {
    expect(() => cancelInvitation([], 'i9')).toThrow(InvitationError)
  })
})

describe('team rules', () => {
  it('switches a member on and off', () => {
    expect(setMemberActive(members, 'm2', false)[1].active).toBe(false)
  })

  it('removes a member', () => {
    expect(removeMember(members, 'm2').map((m) => m.id)).toEqual(['m1'])
  })

  it('never removes or deactivates the last active owner', () => {
    expect(() => removeMember(members, 'm1')).toThrow()
    expect(() => setMemberActive(members, 'm1', false)).toThrow()
  })
})
