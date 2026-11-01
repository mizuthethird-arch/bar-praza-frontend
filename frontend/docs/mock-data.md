# Mock data

The dashboard runs against an in-memory mock backend until the real one exists. This page lists
what the mock holds and what you can try on each screen. All the figures, names and prices are
invented for the demo; values in `[brackets]` are placeholders on purpose.

The code lives in `src/infrastructure/mock/`; `create-mock-services.ts` wires the read mocks; `demo-services.ts` adds the demo logins for a demo build.
The test `mock-data-doc.test.ts` fails if a demo login or a mock file is missing from this page.

## How the mock behaves

- **Changes last until you reload.** Cancelling an order, editing a product and so on change the
  in-memory copy (`memory-store.ts`). A reload brings back the data below.
- **The session survives a reload.** It is kept in the tab's `sessionStorage`
  (`mock-session-store.ts`, key `barpraza.mockSession`). Closing the tab or "Cerrar sesión" ends it.
- **The rules run on the mock "server".** For example, an order already collected cannot be
  cancelled, and the last active owner cannot be removed. They are the rules the real backend must
  enforce too (see `docs/backend-contract.md`).
- **Login waits 500 ms** (`mock-auth-gateway.ts`), so you can see the "Entrando…" state.

## Demo logins

From `mock-accounts.ts`. Every panel page needs a session. Signed out, you are sent to `/login`,
and after logging in you land on the page you asked for.

| Role | Email | Password |
| --- | --- | --- |
| Owner | `titular@barpraza.test` | in `mock-accounts.ts` |
| Kitchen | `cocina@barpraza.test` | in `mock-accounts.ts` |
| Bar | `barra@barpraza.test` | in `mock-accounts.ts` |

- Email ignores case and spaces around it. The password is exact.
- Any other email, or a wrong password, shows "Email o contraseña incorrectos" (the same message
  for both, so the form doesn't reveal which accounts exist).
- All three roles see the same pages today. Pages by role are not built.
- `.test` is a reserved domain that never delivers mail.

## Unlock with PIN (`/login/pin`)

From the login, "Desbloquear con PIN" opens the PIN screen for the device that remembers this person.
From `mock-pin-gateway.ts`:

- The remembered device is `[Titular]` on `TABLET BARRA`. The demo PIN is `1234`.
- Any other PIN counts as a failed attempt. There are 3 attempts: after the first two you see how many are left.
- The third wrong PIN locks the access ("Acceso bloqueado"). The lock lasts until you reload the page, so
  a reload brings the attempts back.
- "No soy yo · Entrar con email" and "Entrar con email y contraseña" go back to the email login.
- Physical digit keys and Backspace work too.

The real lock time and the real PIN rules are not decided yet (open in the backend work).

## Data by screen

### Resumen (`/`)

From `mock-orders-repository.ts`, `mock-menu-repository.ts` and `mock-schedule-repository.ts`.

- 5 orders today, #40 to #44: 2 new, 2 in progress (#42 is delayed), 1 collected.
- Sales 71,50 €, average ticket 14,30 €.
- 5 dishes; Empanada de bonito is unavailable.
- These orders are a **separate list** from the order log below, so cancelling an order in
  Pedidos does not change this page.

### Pedidos (`/pedidos`)

From `mock-order-log-repository.ts`: 7 orders.

| Nº | Customer | Channel | Total | Status |
| --- | --- | --- | --- | --- |
| #44 | Pablo | App | 9,00 € | New |
| B-12 | Mesa 4 | Table | 21,00 € | Open |
| #42 | Marcos | App | 16,00 € | Preparing, 4 min late |
| #41 | Lucía | App | 23,00 € | Ready |
| B-11 | Barra · Xosé | Bar | 13,00 € | Paid |
| #40 | Iria | App | 9,50 € | Collected |
| #39 | Brais | App | 7,00 € | Cancelled |

Try:
- Search by number, name or phone; it ignores accents ("lucia" finds Lucía).
- Filter by channel and status, and export to CSV.
- Cancel #44, B-12, #42 or #41. The other three are greyed out.
- B-12 has no phone, so "Llamar al cliente" is disabled.
- Every line uses a catalog price, and every total adds up (a test checks both).

### Carta y productos (`/carta`)

From `mock-catalog-repository.ts`: 14 products.

- Raciones 6, Bocadillos 2, Postres 2, Bebidas 4.
- Pulpo á feira is the dish of the day.
- Pimientos de Padrón is low on stock.
- Empanada de bonito is sold out.
- Raxo con patatas is sold at the bar only.

Try: edit the name, the prices (format `12,50`), allergens and the switches, then Guardar; or
Archivar a product. "Nueva categoría", "Nuevo producto" and "Subir foto" are not built yet.

### Stock (`/stock`)

From `mock-stock-repository.ts`: 10 items, last counted 19 oct, 12:05, 2 waste records this week.

- Sold out: Empanada de bonito.
- Below minimum: Pimiento de Padrón, Patata, Cerveza lata. These three plus the empanada make up
  the shopping list.

Try: record an entry, waste (never goes below 0) or a count (0 is allowed) with the adjuster.
Filter by kitchen, drinks or low stock, and export to CSV.

### Clientes (`/clientes`)

From `mock-customers-repository.ts`: 4 customers. Lucía and Iria have an account; Marcos and Ana
are guests. Phones show only their last three digits.

### Informes (`/informes`)

From `mock-reports-repository.ts`: the last 7 days.

- Sales 812,00 €, 89 % of orders on time.
- Orders per day, app versus venue; Wednesday closed.
- The 5 top dishes, and the lunch and dinner peaks.

### Horario y pedidos (`/horario`)

From `mock-schedule-repository.ts`.

- Accepting orders until 23:30, 2 orders in the queue.
- Open every day except Wednesday.
- Order rules: 20 min minimum preparation, last order 30 min before closing, 4 orders per slot.
- Special closures:
  - 2026-11-16 Vacaciones.
  - 2026-12-08 Fiestas del pueblo, abre a las 18:00.

Try: pause for 15, 30 or 60 minutes and resume; add a closure (a real date `AAAA-MM-DD` and a
reason, no duplicates) or remove one. The weekly hours and the rule fields are display only.

### Personal y ajustes (`/ajustes`)

From `mock-team-repository.ts`.

- Staff: `[Titular]` (owner), `[Uxía]` (kitchen), `[Xosé]` (bar), all active.
- Bar settings: name "Bar Praza", phone and address as placeholders, both notifications on.

Try:
- Invite kitchen or bar staff by email. The invitation lasts 7 days and works once; the owner cannot be invited. Pending invitations are listed below the members, with Reenviar (restarts the 7 days) and Anular (cancels it). Switch a member on or off, or remove one.
- Deactivating or removing the only active owner is refused.
- Saving the settings needs a bar name.

### Pedidos de cocina (`/cocina`)

From `mock-kitchen-repository.ts`: the board for the kitchen and the bar, inside the same layout
and dark style as the other screens (sidebar, `PageHeader`, shared cards and buttons) and behind
the login. Open it from "Pedidos de cocina" in the sidebar.

- In the demo build the board is kept in the browser's `localStorage` (`mock-kitchen-store.ts`), so
  every open tab shows the same board, as with the backend. Without storage it stays in memory.
- `/crear-pedido-prueba` (not in the sidebar) makes a test order (#45 onward, "Prueba", 10,00 €,
  picked up in 20 minutes) and tries the sound. "Borrar pedidos de prueba" puts the board back
  to its first state. The board learns of each change as it happens: in the same tab straight
  away, and in another tab of the browser through the storage event, so a new order chimes at once.

- Pickup times are set **relative to the moment the page loads**, so the board always looks like
  the design: two new orders ahead of time, one late, one ready. The shift opened 132 minutes ago.
- Nuevos: #43 Ana (14,00 €, note "sin cebolla") and #44 Pablo (9,00 €).
- En curso: #42 Marcos (preparing, 4 min late, 16,00 €) and #41 Lucía (ready, 23,00 €).
- A ready order is marked in green (card, "Listo" badge and the "Entregado y cobrado" button), the
  same way a late one is marked in red.
- The board has four columns: **Nuevos** (new), **En curso** (in preparation), **Listos** (ready to
  hand over) and **Entregados y cobrados** (the shift's history, the rightmost column). Four columns
  from 1536 px (2xl). From 768 px to 1535 px there are two columns, with the history spanning the
  full width below them. Under 768 px everything stacks in one column.
- Every order card is at least 384 px tall, so short cards line up in a grid. A card with more content
  grows taller (no inner scroll). The buttons are full width, stacked one per row, and sit at the bottom.
- Every column title has the same height (two lines fit), so the first cards line up across the board.
- The history column shows each delivered order as a small green card: number, customer, "Entregado"
  time and price. Tapping a card opens a pop-up with the incident details (pickup time, delivery time,
  phone, payment, items, note and total). Escape or "Cerrar" closes it, and focus returns to the card.
  Below the cards, a "Total cobrado" card gives the sum for the shift (21,50 € at the start: #40 and #38).
- The history column is the history of the shift: everything handed over
  and paid since the shift opened, newest first, with the time. It starts with #40 Iria (9,50 €)
  and #38 Xoán (12,00 €). Pressing "Entregado y cobrado" moves the order there from Listos.
- "Agotados (1)" counts the sold-out products of the catalog (Empanada de bonito) and opens the list.
- This list is a **separate mock** from Pedidos and Resumen, so finishing an order here does not
  change those pages.

Try:
- Empezar a preparar → Marcar listo → Entregado y cobrado: the order moves from Nuevos to En curso, then to Listos, then into the history column.
- Cancelar asks "Sí, cancelar" / "No" first. Only new orders can be cancelled.
- A new order from another device plays a chime if "Sonido activo" is on, as it arrives (no refresh).
  The clock and the "en N min" countdown move every 30 s.
- "Cerrar turno" is shown but not built yet.

### Consola en vivo (`/consola`)

From `mock-live-events-repository.ts`: a scripted evening of 8 events.

- 4 events show on load.
- The mock stands in for the server's push: one more arrives every 5 s until all 8 are there.
- Among them are a delayed order (#42) and a cancellation (#39).
- "Pausar" holds new events back; "Reanudar" adds them to the list.

## Mock files

| File | Holds |
| --- | --- |
| `create-mock-services.ts` | Wires the read mocks and the login and PIN it is given into the use cases. Takes no demo accounts. |
| `demo-services.ts` | The demo build: the demo logins, the demo PIN and a mock session. Only a demo or development build imports it (`main.tsx`), so a production build never includes the demo accounts. |
| `memory-store.ts` | The in-memory "server" copy. It applies each command to the latest state. |
| `mock-accounts.ts` | The demo logins above. |
| `mock-auth-gateway.ts` | Checks the logins, with the 500 ms delay. |
| `mock-pin-gateway.ts` | The remembered device, the demo PIN and the attempts before the lock. |
| `mock-session-store.ts` | The session flag, kept in `sessionStorage` by the app. |
| `mock-orders-repository.ts` | Today's orders for Resumen. |
| `mock-menu-repository.ts` | The dishes for Resumen. |
| `mock-order-log-repository.ts` | The order log for Pedidos. |
| `mock-catalog-repository.ts` | The products for Carta y productos. |
| `mock-stock-repository.ts` | The stock items. |
| `mock-customers-repository.ts` | The customers. |
| `mock-reports-repository.ts` | The weekly report. |
| `mock-schedule-repository.ts` | Hours, closures, order rules and the ordering status. |
| `mock-team-repository.ts` | Staff and bar settings. |
| `mock-kitchen-repository.ts` | The kitchen board: shift start and the orders to prepare. |
| `mock-live-events-repository.ts` | The scripted live events. |

When the backend is ready, `main.tsx` builds the services from HTTP adapters instead of
`createMockServices`, and the screens do not change.
