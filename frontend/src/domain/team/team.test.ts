import { describe, expect, it } from 'vitest'
import { addMember, removeMember, setMemberActive, type StaffMember } from './team'

const members: StaffMember[] = [
  { id: 'm1', name: 'Titular', role: 'owner', active: true },
  { id: 'm2', name: 'Uxía', role: 'kitchen', active: true },
]

describe('team rules', () => {
  it('adds a trimmed member with the next id and active', () => {
    const result = addMember(members, { name: '  Xosé ', role: 'bar' })

    expect(result[2]).toEqual({ id: 'm3', name: 'Xosé', role: 'bar', active: true })
    expect(members).toHaveLength(2)
  })

  it('rejects a blank name', () => {
    expect(() => addMember(members, { name: ' ', role: 'bar' })).toThrow()
  })

  it('numbers a new member from m1 when no existing id has the m<number> shape', () => {
    const others: StaffMember[] = [{ id: 'owner', name: 'Titular', role: 'owner', active: true }]

    expect(addMember(others, { name: 'Xosé', role: 'bar' })[1].id).toBe('m1')
  })

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
