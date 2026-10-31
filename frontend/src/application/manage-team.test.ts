import { describe, expect, it, vi } from 'vitest'
import type { BarSettings } from '../domain/team/team'
import { addMemberTo, removeMemberFrom, saveSettingsIn, setMemberActiveIn } from './manage-team'
import type { TeamRepository } from './ports'

const settings: BarSettings = { barName: ' Bar Praza ', phone: '', address: '', notifyNewOrders: true, notifyDelays: true }

function repo(): TeamRepository {
  const done = vi.fn().mockResolvedValue({})
  return { get: vi.fn(), addMember: done, setMemberActive: done, removeMember: done, saveSettings: done }
}

describe('team use cases', () => {
  it('sends one change at a time', async () => {
    const team = repo()

    await addMemberTo(team, { name: ' Uxía ', role: 'kitchen' })
    await setMemberActiveIn(team, 'm2', false)
    await removeMemberFrom(team, 'm2')

    expect(team.addMember).toHaveBeenCalledWith({ name: 'Uxía', role: 'kitchen' })
    expect(team.setMemberActive).toHaveBeenCalledWith('m2', false)
    expect(team.removeMember).toHaveBeenCalledWith('m2')
  })

  it('refuses a member without a name', async () => {
    const team = repo()

    await expect(addMemberTo(team, { name: ' ', role: 'bar' })).rejects.toThrow()
    expect(team.addMember).not.toHaveBeenCalled()
  })

  it('sends trimmed settings but needs a bar name', async () => {
    const team = repo()

    await saveSettingsIn(team, settings)
    expect(team.saveSettings).toHaveBeenCalledWith({ ...settings, barName: 'Bar Praza' })

    await expect(saveSettingsIn(team, { ...settings, barName: ' ' })).rejects.toThrow()
    expect(team.saveSettings).toHaveBeenCalledTimes(1)
  })
})
