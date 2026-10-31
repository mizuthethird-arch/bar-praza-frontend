import type { BarSettings, Role } from '../domain/team/team'
import type { TeamRepository } from './ports'

export const getTeam = (team: TeamRepository) => team.get()

export async function addMemberTo(team: TeamRepository, { name, role }: { name: string; role: Role }) {
  if (name.trim() === '') throw new Error('A member needs a name')
  return team.addMember({ name: name.trim(), role })
}

export const setMemberActiveIn = (team: TeamRepository, id: string, active: boolean) =>
  team.setMemberActive(id, active)

export const removeMemberFrom = (team: TeamRepository, id: string) => team.removeMember(id)

export async function saveSettingsIn(team: TeamRepository, settings: BarSettings) {
  if (settings.barName.trim() === '') throw new Error('The bar needs a name')
  return team.saveSettings({ ...settings, barName: settings.barName.trim() })
}
