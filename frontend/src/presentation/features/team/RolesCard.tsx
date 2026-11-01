import { roleLabel } from './role-labels'
import { PERMISSION_ROWS, PENDING, ROLE_RULES } from './roles-table'
import { bodyCell, card, headCell, sectionTitle } from '../../ui/classes'

const roles = ['owner', 'kitchen', 'bar'] as const

// Read-only: who can do what, by role. Only the rules that are decided are filled in; the rest say PENDING.
export function RolesCard() {
  return (
    <section className={`${card} min-w-0 space-y-5`} aria-labelledby="roles-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="roles-title" className={sectionTitle}>
          Roles y permisos
        </h2>
        <span className="rounded-full bg-amber-950 px-2.5 py-0.5 text-xs font-semibold text-amber-300">Solo lectura</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className={headCell}>Permiso</th>
              {roles.map((role) => (
                <th key={role} className={headCell}>
                  {roleLabel[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_ROWS.map((row) => (
              <tr key={row.label} className="border-b border-neutral-800/70">
                <td className={`${bodyCell} font-medium`}>{row.label}</td>
                {roles.map((role) => (
                  <td key={role} className={row.cells[role] === PENDING ? `${bodyCell} text-neutral-400 italic` : bodyCell}>
                    {row.cells[role]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => (
          <div key={role} className="space-y-2">
            <h3 className="text-sm font-semibold">{roleLabel[role]}</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-300">
              {ROLE_RULES[role].map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-400">
        Qué páginas ve cada rol está por decidir: hoy todas las cuentas ven las mismas páginas.
      </p>
    </section>
  )
}
