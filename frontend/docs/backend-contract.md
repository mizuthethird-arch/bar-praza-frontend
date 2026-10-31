# Backend contract expected by the frontend

Status: draft from the frontend side, 2026-10-31. Written by Kai (frontend).

This document lists what the dashboard (MS-2) calls today against its in-memory mock, so the
backend can be built to the same shape. The operations, inputs, outputs and rules are taken
from the code. URLs and HTTP methods are only a **proposal**: the technical design belongs to the
tech lead (BRIEF rule 6), and the backend owner decides the final routes.

Source of truth in the code:

- Ports the backend adapters must satisfy: `src/application/ports.ts`
- What the screens call: `src/application/services.ts`
- Data shapes: `src/domain/**`
- Reference behaviour (the mock "server"): `src/infrastructure/mock/`

## 1. Rules that apply to every write

1. **One command per change.** The frontend never sends a whole list back. It sends one change
   ("cancel order #42", "add 5 kg of patata"). The server applies it to its **latest** state.
   This is what stops two devices (kitchen tablet, bar phone) from overwriting each other.
   The test `writes from two devices at once` in
   `src/infrastructure/mock/create-mock-services.test.ts` shows the expected behaviour.
2. **Every command answers with the new state** of that area (the full list or object, as in the
   tables below). The screen shows that answer, so changes made by other devices appear too.
3. **The server enforces the rules.** The frontend checks input first for quick feedback, but
   the rules listed for each command must also be checked on the server, because a client can
   be bypassed.
4. **Money is in integer cents** (`priceCents`, `totalCents`, `salesCents`). Never floats.
5. **Errors.** Today the screens show one generic message per action ("No se pudo …") for any
   failure. Only login tells errors apart (see 2). Proposal for the backend:
   `400` for invalid input, `401` for no or expired session, `404` for an unknown id, `409` for a
   broken rule (for example, removing the last active owner).

## 2. Session

| Operation | Input | Output | Rules / errors |
|---|---|---|---|
| `login` | `{ email, password }` | nothing | Wrong credentials must be told apart from other failures: the screen shows "Email o contraseña incorrectos" for that case and a generic message otherwise. |
| `logout` | none | nothing | Ends the session. |
| `hasSession` | none | boolean | Used by the route guard. The mock keeps it in sessionStorage, so it survives a reload. |

Open, owned elsewhere:

- ISS-4: session length and logout rules (user).
- WP-1.5: the login endpoint itself (backend).
- How the session is carried (cookie or token) is the tech lead's decision. The frontend only
  needs `hasSession()` to answer without a network round trip, or a "check session" call at start.
- The frontend does not yet react to a `401` in the middle of a session (it should go back to
  `/login`). That is frontend work, pending the decision above.

## 3. Reads

| Operation | Proposed route | Returns (type in `src/domain`) |
|---|---|---|
| `getDashboard` | `GET /dashboard` | `Dashboard` (`application/get-dashboard.ts`): today's `Order[]`, `Dish[]`, order windows, minimum prep minutes |
| `getScheduleOverview` | `GET /schedule` | `ScheduleOverview` (`schedule/schedule.ts`) |
| `listOrderLog` | `GET /orders` | `OrderEntry[]` (`orders/order-log.ts`) |
| `getCatalog` | `GET /products` | `Product[]` (`menu/product.ts`) |
| `getStock` | `GET /stock` | `StockState` (`stock/stock.ts`) |
| `listCustomers` | `GET /customers` | `Customer[]` (`customers/customers.ts`). Each customer needs a stable `id`, because names repeat. |
| `getReport` | `GET /reports/weekly` | `Report` (`reports/report.ts`) |
| `getTeam` | `GET /team` | `TeamState` (`team/team.ts`) |
| `getKitchenBoard` | `GET /kitchen/orders` | `KitchenBoard` (`kitchen/kitchen.ts`): shift start time, the active orders (`new`, `preparing`, `ready`) and `delivered`, the orders delivered and paid in the current shift, newest first, each with `deliveredAt`. The screen asks again every 15 s to pick up orders from other devices. |
| `listLiveEvents` | `GET /live-events` | `LiveEvent[]` (`live/live-console.ts`) |
| `pollLiveEvents(afterId)` | `GET /live-events?after={id}` | `LiveEvent[]` with `id > afterId`. Event ids must only grow. |

## 4. Commands

### Orders

| Command | Proposed route | Input | Returns | Server rules |
|---|---|---|---|---|
| `cancelOrder` | `POST /orders/{id}/cancel` | order id | `OrderEntry[]` | Unknown id → error. Orders that are `paid`, `collected` or already `cancelled` cannot be cancelled (`canCancel`). |

### Catalog

| Command | Proposed route | Input | Returns | Server rules |
|---|---|---|---|---|
| `saveProduct` | `PUT /products/{id}` | one `Product` | `Product[]` | Name required and trimmed. Prices are non-negative integer cents. |
| `archiveProduct` | `POST /products/{id}/archive` | product id | `Product[]` | Archived products leave the list. |

### Stock

| Command | Proposed route | Input | Returns | Server rules |
|---|---|---|---|---|
| `recordStockMovement` | `POST /stock/movements` | `{ itemId, kind: 'in' \| 'waste' \| 'count', amount }` | `StockState` | Unknown item → error. `amount` finite and ≥ 0, and > 0 unless `kind` is `count`. `in` adds, `waste` subtracts but never below 0 and counts one waste record, `count` sets the quantity (`applyMovement`). |

### Kitchen board

| Command | Proposed route | Input | Returns | Server rules |
|---|---|---|---|---|
| `startKitchenOrder` | `POST /kitchen/orders/{id}/start` | order id | `KitchenBoard` | Only a `new` order. |
| `markKitchenOrderReady` | `POST /kitchen/orders/{id}/ready` | order id | `KitchenBoard` | Only a `preparing` order. |
| `deliverKitchenOrder` | `POST /kitchen/orders/{id}/deliver` | order id | `KitchenBoard` | Only a `ready` order. The server stamps `deliveredAt` and moves the order from `orders` to the front of `delivered`. |
| `cancelKitchenOrder` | `POST /kitchen/orders/{id}/cancel` | order id | `KitchenBoard` | Only a `new` order. It leaves the board. |

Notes: the history belongs to the shift. When "Cerrar turno" is defined, the new shift starts with an empty history. "Late" is not stored; the screen works it out from the pickup time and the clock. Pickup
times are `HH:mm`; the server decides how a pickup after midnight is sent. Each order carries its
note, phone, lines and a payment note ("paga al recoger", "cobrar al entregar"). Nothing in the
design says how the payment note is decided, so the owner of the order model must define it.
The board duplicates the order log (Pedidos): see open question 1 below.

### Schedule

| Command | Proposed route | Input | Returns | Server rules |
|---|---|---|---|---|
| `pauseOrders` | `POST /schedule/pause` | `minutes` | `ScheduleOverview` | Whole number > 0. The screen offers 15, 30 and 60. |
| `resumeOrders` | `POST /schedule/resume` | none | `ScheduleOverview` | Clears the pause. |
| `addClosure` | `POST /schedule/closures` | `{ date, note }` | `ScheduleOverview` | `date` is a real `YYYY-MM-DD` date, `note` required and trimmed, no duplicate of the same date and note. |
| `removeClosure` | `DELETE /schedule/closures` | `{ date, note }` | `ScheduleOverview` | A closure has no id today. If the backend adds one, the frontend can switch to `DELETE /schedule/closures/{id}`. |

### Team and settings

| Command | Proposed route | Input | Returns | Server rules |
|---|---|---|---|---|
| `addMember` | `POST /team/members` | `{ name, role: 'owner' \| 'kitchen' \| 'bar' }` | `TeamState` | Name required. The server assigns the id. |
| `setMemberActive` | `PATCH /team/members/{id}` | `{ active }` | `TeamState` | At least one active owner must remain. |
| `removeMember` | `DELETE /team/members/{id}` | member id | `TeamState` | At least one active owner must remain. |
| `saveSettings` | `PUT /team/settings` | `BarSettings` | `TeamState` | `barName` required and trimmed. |

Note: D-1 says staff join through an invitation link (WP-1.2, WP-1.3). The current
`addMember` screen adds a member directly. How the two fit (does `addMember` send an
invitation?) is open, for the user and the tech lead.

## 5. Open questions for the backend owner and tech lead

1. The dashboard's `Order` (numeric `id`, `client`, `pickupTime`) and the order log's
   `OrderEntry` (string `id` such as `#44` or `B-12`) describe the same orders in two shapes.
   Should the backend serve one order model for both screens?
2. Live console: polling every 5 s (what the frontend does now) or a push channel (websocket or
   server-sent events)?
3. Session transport and length (ISS-4), and the response for an expired session.
4. Invitations versus `addMember` (see the note under Team).
5. Routes, versioning and error body format: the tech lead decides. The proposal in this
   document is only a starting point.
