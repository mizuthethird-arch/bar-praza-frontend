import type { BarSettings, InvitableRole } from '../domain/team/team'
import type { TeamRepository } from './ports'

export const getTeam = (team: TeamRepository) => team.get()

// Sends an invitation by email. The team's rules (role, email, one live invitation per email) are checked there.
export const inviteMemberTo = (team: TeamRepository, invite: { email: string; role: InvitableRole }) =>
  team.inviteMember(invite)

export const cancelInvitationIn = (team: TeamRepository, id: string) => team.cancelInvitation(id)

export const resendInvitationIn = (team: TeamRepository, id: string) => team.resendInvitation(id)

export const setMemberActiveIn = (team: TeamRepository, id: string, active: boolean) =>
  team.setMemberActive(id, active)

export const removeMemberFrom = (team: TeamRepository, id: string) => team.removeMember(id)

export async function saveSettingsIn(team: TeamRepository, settings: BarSettings) {
  if (settings.barName.trim() === '') throw new Error('The bar needs a name')
  return team.saveSettings({ ...settings, barName: settings.barName.trim() })
}
