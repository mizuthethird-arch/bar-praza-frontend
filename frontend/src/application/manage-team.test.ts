import { describe, expect, it, vi } from 'vitest'
import type { TeamRepository } from './ports'
import { inviteMemberTo, removeMemberFrom, saveSettingsIn, sendPasswordResetIn, setMemberActiveIn, setMemberPinIn } from './manage-team'

const repo = (): TeamRepository => {
  const done = vi.fn().mockResolvedValue({ members: [], invitations: [], settings: {} })
  return { get: vi.fn(), inviteMember: done, setMemberActive: done, setMemberPin: done, removeMember: done, sendPasswordReset: done, saveSettings: done } as unknown as TeamRepository
}

describe('team use cases', () => {
  it('sends the invitation to the repository, unchanged', async () => {
    const team = repo()

    await inviteMemberTo(team, { email: 'a@b.es', role: 'kitchen' })

    expect(team.inviteMember).toHaveBeenCalledWith({ email: 'a@b.es', role: 'kitchen' })
  })

  it('sends a password recovery link through the repository', async () => {
    const team = repo()

    await sendPasswordResetIn(team, 'm2')

    expect(team.sendPasswordReset).toHaveBeenCalledWith('m2')
  })

  it('deletes a member through the repository', async () => {
    const team = repo()

    await removeMemberFrom(team, 'm2')

    expect(team.removeMember).toHaveBeenCalledWith('m2')
  })

  it('sets a PIN through the repository, unchanged', async () => {
    const team = repo()

    await setMemberPinIn(team, 'm2', '1234')

    expect(team.setMemberPin).toHaveBeenCalledWith('m2', '1234')
  })

  it('deactivates and reactivates members through the repository', async () => {
    const team = repo()

    await setMemberActiveIn(team, 'm2', false)
    await setMemberActiveIn(team, 'm2', true)

    expect(team.setMemberActive).toHaveBeenNthCalledWith(1, 'm2', false)
    expect(team.setMemberActive).toHaveBeenNthCalledWith(2, 'm2', true)
  })

  it('sends trimmed settings, and refuses a blank bar name', async () => {
    const team = repo()
    const settings = { barName: ' Bar Praza ', phone: '', address: '', notifyNewOrders: true, notifyDelays: true }

    await saveSettingsIn(team, settings)
    expect(team.saveSettings).toHaveBeenCalledWith({ ...settings, barName: 'Bar Praza' })

    await expect(saveSettingsIn(team, { ...settings, barName: ' ' })).rejects.toThrow()
    expect(team.saveSettings).toHaveBeenCalledTimes(1)
  })
})
