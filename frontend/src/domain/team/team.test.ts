import { describe, expect, it } from 'vitest'
import {
  cancelInvitation,
  InvitationError,
  inviteStaff,
  MemberError,
  removeMember,
  resendInvitation,
  setMemberActive,
  setMemberPin,
  type Invitation,
  type StaffMember,
  updateMember,
} from './team'

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

describe('resending an invitation', () => {
  it('gives the same invitation seven new days from the day it is resent', () => {
    const invitations: Invitation[] = [{ id: 'i1', email: 'a@b.es', role: 'kitchen', expiresOn: '2026-11-03' }]

    expect(resendInvitation(invitations, 'i1', '2026-11-05')).toEqual([
      { id: 'i1', email: 'a@b.es', role: 'kitchen', expiresOn: '2026-11-12' },
    ])
  })

  it('brings back an expired invitation', () => {
    const invitations: Invitation[] = [{ id: 'i1', email: 'a@b.es', role: 'bar', expiresOn: '2026-10-20' }]

    expect(resendInvitation(invitations, 'i1', '2026-11-01')[0].expiresOn).toBe('2026-11-08')
  })

  it('refuses when the same email already has another invitation still in its days', () => {
    const invitations: Invitation[] = [
      { id: 'i1', email: 'a@b.es', role: 'kitchen', expiresOn: '2026-10-20' },
      { id: 'i2', email: 'a@b.es', role: 'bar', expiresOn: '2026-11-08' },
    ]

    expect(() => resendInvitation(invitations, 'i1', '2026-11-01')).toThrow('Ya hay una invitación para ese email')
  })

  it('refuses an invitation that is not there any more', () => {
    expect(() => resendInvitation([], 'i9', '2026-11-01')).toThrow(InvitationError)
  })
})

describe('editing a staff member', () => {
  it('changes the name, trimmed, and the role of a kitchen or bar member', () => {
    const result = updateMember(members, 'm2', { name: '  Uxía Pérez ', role: 'bar' })

    expect(result[1]).toEqual({ ...members[1], name: 'Uxía Pérez', role: 'bar' })
    expect(result[0]).toEqual(members[0])
  })

  it('refuses a blank name', () => {
    expect(() => updateMember(members, 'm2', { name: '   ', role: 'kitchen' })).toThrow(new MemberError('Indica un nombre'))
  })

  it('keeps the owner role fixed, though the owner name can change', () => {
    expect(() => updateMember(members, 'm1', { name: 'Titular', role: 'bar' })).toThrow('El titular no puede cambiar de rol')
    expect(updateMember(members, 'm1', { name: 'Ana', role: 'owner' })[0].name).toBe('Ana')
  })

  it('does not make anyone the owner', () => {
    expect(() => updateMember(members, 'm2', { name: 'Uxía', role: 'owner' })).toThrow('Solo se puede cambiar entre cocina y barra')
  })

  it('refuses a member that is not there any more', () => {
    expect(() => updateMember(members, 'm9', { name: 'Nadie', role: 'bar' })).toThrow(MemberError)
  })
})

describe('team rules', () => {
  it('deactivates a member, and reactivates them', () => {
    const off = setMemberActive(members, 'm2', false)
    expect(off[1].active).toBe(false)
    expect(setMemberActive(off, 'm2', true)[1].active).toBe(true)
  })

  it('keeps a deactivated member in the list', () => {
    expect(setMemberActive(members, 'm2', false).map((m) => m.id)).toEqual(['m1', 'm2'])
  })

  it('never deactivates the last active owner', () => {
    expect(() => setMemberActive(members, 'm1', false)).toThrow()
  })
})

describe('setting a PIN', () => {
  it('sets a 4-digit PIN for the member, and marks it as set', () => {
    const result = setMemberPin(members, 'm2', '1234')

    expect(result[1].pinSet).toBe(true)
    expect(result[0]).toEqual(members[0])
  })

  it('refuses anything but 4 digits', () => {
    for (const pin of ['123', '12345', '12a4', '']) {
      expect(() => setMemberPin(members, 'm2', pin)).toThrow('El PIN tiene 4 cifras')
    }
  })

  it('refuses a member that is not there any more', () => {
    expect(() => setMemberPin(members, 'm9', '1234')).toThrow(MemberError)
  })
})

describe('deleting a member', () => {
  it('removes that member and keeps the others', () => {
    expect(removeMember(members, 'm2').map((m) => m.id)).toEqual(['m1'])
  })

  it('never removes the last active owner', () => {
    expect(() => removeMember(members, 'm1')).toThrow(MemberError)
  })

  it('refuses a member that is not there any more', () => {
    expect(() => removeMember(members, 'm9')).toThrow(MemberError)
  })
})

