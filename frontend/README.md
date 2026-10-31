# Bar Praza — frontend

React + Vite + TypeScript + Tailwind, installable as a PWA. Mock data only: no backend is connected yet.

## Architecture

Clean architecture. Imports point inward only: `presentation → application → domain`, and `infrastructure → application → domain`.

| Layer | Folder | Holds |
| --- | --- | --- |
| Domain | `src/domain` | Entities and pure rules (e.g. `summarizeOrders`). No React, no I/O. |
| Application | `src/application` | Use cases (`login`, `getDashboard`, `getScheduleOverview`) and the ports they need (`ports.ts`). |
| Infrastructure | `src/infrastructure` | Adapters that implement the ports. Today: `mock/`. Later: HTTP adapters for the real backend. |
| Presentation | `src/presentation` | React components, routing, hooks, formatting. Reaches the use cases through `AppServices`. |

`src/main.tsx` is the composition root. To connect the backend, build the services from HTTP adapters there instead of `createMockServices`.

## Demo logins (mock backend only)

Every panel page needs a session. Without one you are sent to `/login`, and after logging in you land on the page you asked for. The accounts live in `src/infrastructure/mock/mock-accounts.ts`; the real ones will come from the backend.

| Role | Email | Password |
| --- | --- | --- |
| Owner | `titular@barpraza.test` | `Praza-Titular-1` |
| Kitchen | `cocina@barpraza.test` | `Praza-Cocina-1` |
| Bar | `barra@barpraza.test` | `Praza-Barra-1` |

Any other email or password shows "Email o contraseña incorrectos". The session is kept in the tab's `sessionStorage`, so it survives a reload; closing the tab or "Cerrar sesión" (end of the sidebar) ends it.

All the mock data, and what to try on each screen, is in [docs/mock-data.md](docs/mock-data.md). The contract the backend needs to meet is in [docs/backend-contract.md](docs/backend-contract.md).

## Workflow

TDD: write the failing test first, then the code. Tests sit next to the code they cover.

```bash
npm run dev     # dev server
npm test        # vitest
npm run build   # typecheck + production build
npm run lint
```
