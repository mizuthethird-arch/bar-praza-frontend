# Frontend status — Bar Praza

Snapshot: 2026-10-31. Scope: the dashboard frontend (MS-2 screens, mock backend) and the login screen.
Sources: `docs/mock-data.md`, `docs/design-standard.md`, `docs/backend-contract.md`, the code under `src/presentation/` and `src/application/`, and a test run.

Test run: 60 test files, 320 tests, all passing (`./node_modules/.bin/vitest run`, 2026-10-31).

## 1. Recap

The frontend is a React + Vite + TypeScript PWA with Tailwind. It uses clean architecture (domain → application → infrastructure/presentation) and runs entirely on an in-memory mock backend. No real backend is connected yet.

What exists:
- Login screen with a route guard. Session kept in `sessionStorage`. Logout in the sidebar.
- Installable PWA (`vite-plugin-pwa`, auto-update service worker, manifest).
- Dark design system, mobile first, with the rules in `docs/design-standard.md`.
- Ten panel pages plus the login, each with a mock data set (`docs/mock-data.md`).

Nothing is role-based yet: owner, kitchen and bar accounts all see the same pages.

## 2. Implemented

| Screen | Route | What works |
|---|---|---|
| Login | `/login` | Email and password form, 500 ms delay, same error for wrong email or password, session survives reload. |
| Resumen | `/` | Four stat cards, today's orders table, menu table, order windows card. Read-only. |
| Pedidos | `/pedidos` | Search (accent-insensitive), channel and status filters, order detail, cancel with rules, call client link, CSV export. |
| Carta y productos | `/carta` | Category filter, product editor (name, prices, variants, allergens, switches), save, archive. |
| Stock | `/stock` | Stock list, filters (kitchen, drinks, low stock), adjuster for entry, waste and count with rules. |
| Clientes | `/clientes` | Customer list with phone (last three digits), pending data requests panel. |
| Informes | `/informes` | Weekly report, orders-per-day chart, CSV export. |
| Horario y pedidos | `/horario` | Pause and resume orders (15, 30, 60 min), add and remove closures. Weekly hours and order rules are display only. |
| Personal y ajustes | `/ajustes` | Add, activate or deactivate, remove staff; last active owner protected; bar settings save. |
| Pedidos de cocina | `/cocina` | Four columns (Nuevos, En curso, Listos, Entregados y cobrados), start, ready, deliver, cancel with confirmation, delivery history with detail pop-up, sold-out list, sound toggle, changes arrive as they happen (no refresh). |
| Consola en vivo | `/consola` | Scripted live events, arriving as they happen (mock push), pause. |

Cross-cutting:
- Sidebar navigation with active state; secondary items for kitchen and live console.
- Shared page shell, status tones, buttons, motion (page entrance, pop-up sheet, drag to close, reduced-motion respected).
- Contrast tests (WCAG AA) with two known failures for `neutral-500` text (design open item).

## 3. Missing or not wired

Found by scanning every button and link in `src/presentation/`. Items marked **dead** render and look clickable but do nothing. Items marked **disabled** are visibly off.

### Resumen (`/`)
| # | Item | State | Where | Note |
|---|---|---|---|---|
| FE-1 | "Abrir consola" | **dead** | `features/dashboard/OrdersTable.tsx:21` | Plain button with no handler. Should open `/consola`. |
| FE-2 | "Pausar pedidos" (header) | **dead** | `features/dashboard/DashboardPage.tsx:37` | No handler. Should reuse the pause flow from `/horario`. |
| FE-3 | "Editar horario" | **dead** | `features/dashboard/OrderWindowsCard.tsx:23` | No handler. Should open `/horario`. |
| FE-4 | "Añadir plato" | **dead** | `features/dashboard/MenuTable.tsx:17` | No handler, no add flow. |
| FE-5 | "Editar" (per dish) | **dead** | `features/dashboard/MenuTable.tsx:51` | No handler. Should open the product editor in `/carta`. |
| FE-6 | "Pedidos abiertos" badge | static | `DashboardPage.tsx` | Text only, not driven by the schedule status. |

### Navigation
| # | Item | State | Where | Note |
|---|---|---|---|---|
| FE-7 | "Tomar pedido (móvil)" | **disabled** (dimmed, no route) | `layout/AppShell.tsx:20` | Not built. No route, no screen. |

### Carta y productos (`/carta`)
| # | Item | State | Where | Note |
|---|---|---|---|---|
| FE-8 | "Nueva categoría" | **disabled** | `features/catalog/CatalogPage.tsx:42` | Not built (mock-data doc says so). |
| FE-9 | "Nuevo producto" | **disabled** | `features/catalog/CatalogPage.tsx:45` | Not built. |
| FE-10 | "Subir foto" | not found in code | — | Named in mock-data doc as not built. No control in the code yet. |

### Cocina (`/cocina`)
| # | Item | State | Where | Note |
|---|---|---|---|---|
| FE-11 | "Cerrar turno" | **disabled** | `features/kitchen/KitchenPage.tsx:102` | Not built. Backend contract says the new shift starts with an empty history. |

### Clientes (`/clientes`)
| # | Item | State | Where | Note |
|---|---|---|---|---|
| FE-12 | "Ver historial" | **disabled** | `features/customers/CustomersPage.tsx:93` | Not built. |

### Pedidos (`/pedidos`)
| # | Item | State | Where | Note |
|---|---|---|---|---|
| FE-13 | "Llamar al cliente" | disabled when no phone | `features/orders/OrderDetail.tsx:75` | Intended (B-12 has no phone). Not a gap. |

### Stock (`/stock`)
| # | Item | State | Where | Note |
|---|---|---|---|---|
| FE-14 | CSV export | **missing** | `features/stock/StockPage.tsx` | `docs/mock-data.md` says "export to CSV" for stock. The code has no export button. Doc and code disagree. Decide: add the export, or correct the doc. |

### Login and session
| # | Item | State | Note |
|---|---|---|---|
| FE-15 | Invitation landing page (set password) | not built | D-1 and D-2: new staff join through an invitation link. This is WP-2.2 and is missing. |
| FE-16 | Invitation rules on the login page | not built | WP-2.5: no public sign-up link. Confirm the login page has none. |
| FE-17 | Response to `401` mid-session (back to `/login`) | not built | `docs/backend-contract.md` section 2. Depends on the session decision (ISS-4). |
| FE-18 | Role-based pages | not built | All three roles see every page (`docs/mock-data.md`). |
| FE-19 | Password rules | not built | Depends on ISS-7. |

### Ajustes (`/ajustes`)
| # | Item | State | Note |
|---|---|---|---|
| FE-20 | "Añadir" member creates the staff member directly | conflicts with D-1 | With invitations, `addMember` should send an invitation instead. Open question for the user and tech lead (`docs/backend-contract.md`, note under Team). |

### Whole app
| # | Item | State | Note |
|---|---|---|---|
| FE-21 | Real backend | not connected | Every screen runs on mock data. HTTP adapters and `main.tsx` wiring are missing. |
| FE-22 | Custom focus ring | not defined | `docs/design-standard.md` open item 9. |
| FE-23 | `neutral-500` text contrast | fails AA (4.18 and 3.78) | Human decision pending (`docs/design-standard.md` section 10). |
| FE-24 | Layout checks at 320, 768, 1280 px | not checked | Design standard lists these as not yet checked. |

## 4. Work package proposed for these gaps

Recorded in [BRIEF.md](../../BRIEF.md) as WP-4. Owner: Kai Frontend [proposed, not yet confirmed by user]. Dates and effort unknown (DN2: the owner estimates).

- WP-4.1 Wire the dead links and buttons on Resumen (FE-1 to FE-3) [user: "Abrir consola" should be clickable].
- WP-4.2 Wire dish add and edit from Resumen to `/carta` (FE-4, FE-5). Decide whether "Añadir plato" opens the editor or a new flow.
- WP-4.3 Build the missing catalog actions: new category, new product, photo upload (FE-8 to FE-10). Photo upload needs a storage decision from the tech lead.
- WP-4.4 Build "Cerrar turno" in the kitchen (FE-11).
- WP-4.5 Build "Ver historial" for customers (FE-12).
- WP-4.6 Decide and fix the stock CSV export (FE-14).
- WP-4.7 Build the invitation landing page and set-password step (FE-15, FE-16). Tied to WP-2.2.
- WP-4.8 Handle `401` mid-session (FE-17). Depends on ISS-4.
- WP-4.9 Role-based page access (FE-18). Needs the role rules from the user.
- WP-4.10 Replace mock adapters with the HTTP adapters (FE-21). Depends on the backend contract and the tech lead.
- WP-4.11 Design open items: focus ring, `neutral-500` text, layout checks at 320, 768, 1280 (FE-22 to FE-24). Needs human verdicts first.

Open decisions for the user before WP-4 can be sized:
1. Should "Añadir plato" (FE-4) open the existing product editor or a new screen?
2. Keep or remove the stock CSV export (FE-14)?
3. Is "Tomar pedido (móvil)" (FE-7) in MS-2 or a later milestone?
4. Should `addMember` send an invitation (FE-20)?

## 5. Notes for the next session

- The mock-data doc is the source for demo data; the backend contract is the source for the future API. When one changes, update the other.
- Any new button must have a handler, or be disabled and listed here. A dead button looks like a feature.
- `frontend/project-brain/` already exists and is maintained separately from the root `project-brain/`. Do not merge them without asking.
