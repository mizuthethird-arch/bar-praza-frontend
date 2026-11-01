import type { Role } from '../../../domain/team/team'

// Shown wherever the rules are not decided yet. The matrix stays read-only until the permissions decision.
export const PENDING = 'Por decidir'

// Rules that are already decided: the owner account, and how kitchen and bar staff join.
export const ROLE_RULES: Record<Role, string[]> = {
  owner: [
    'Es la cuenta que existe desde el inicio. No se puede invitar a nadie como titular.',
    'Su rol no se puede cambiar.',
    'Es el único que gestiona el personal: invitar, editar, PIN y dispositivos.',
    'Siempre tiene que quedar al menos un titular activo.',
  ],
  kitchen: [
    'Entra por invitación por email. La invitación caduca a los 7 días y solo sirve una vez.',
    'Puede cambiar de rol con barra.',
  ],
  bar: [
    'Entra por invitación por email. La invitación caduca a los 7 días y solo sirve una vez.',
    'Puede cambiar de rol con cocina.',
  ],
}

// One row per rule that decides something for a role. Cells the decision has not reached say PENDING.
export const PERMISSION_ROWS: { label: string; cells: Record<Role, string> }[] = [
  { label: 'Cuenta creada al inicio', cells: { owner: 'Sí', kitchen: 'No', bar: 'No' } },
  { label: 'Puede recibir una invitación', cells: { owner: 'No', kitchen: 'Sí', bar: 'Sí' } },
  { label: 'Puede cambiar de rol', cells: { owner: 'No', kitchen: 'Entre cocina y barra', bar: 'Entre cocina y barra' } },
  { label: 'Puede desactivarse o eliminarse', cells: { owner: 'Si queda otro titular activo', kitchen: 'Sí', bar: 'Sí' } },
  { label: 'Páginas a las que entra', cells: { owner: PENDING, kitchen: PENDING, bar: PENDING } },
  { label: 'Gestiona personal (invitar, editar, PIN, dispositivos)', cells: { owner: 'Sí', kitchen: 'No', bar: 'No' } },
]
