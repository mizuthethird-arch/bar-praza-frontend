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
   failure. Only login and the PIN unlock tell errors apart (see 2). Proposal for the backend:
   `400` for invalid input, `401` for no or expired session, `404` for an unknown id, `409` for a
   broken rule (for example, removing the last active owner).

## 2. Session

| Operation | Input | Output | Rules / errors |
|---|---|---|---|
| `login` | `{ email, password }` | nothing | Built: `POST /auth/login`. Wrong credentials (401 `invalid_credentials`, which also covers a locked account) show "Email o contraseña incorrectos". 400 shows "Revisa el email y la contraseña", 429 shows "Demasiados intentos. Inténtalo más tarde.", anything else "No se pudo entrar. Inténtalo de nuevo." |
| `logout` | none | nothing | Built: `POST /auth/logout`, always 204. If the request fails, the person stays in the app. |
| `hasSession` | none | Promise of boolean | Built: `GET /auth/session` (200 is signed in, 401 is not). Async, so the route guard and the login screen wait for it. A failed check counts as signed out. |

Every call sends `credentials: 'include'`, because the session is an HttpOnly cookie that JavaScript
cannot read. The backend's own description, with the error codes and the lock rules, is in its
`docs/api-for-frontend.md`. The mock stays for everything else until each read and command is built.

Which services the app uses is set at build time (ISS-13):

- `VITE_API_URL` set: the real login and PIN unlock talk to the backend.
- `VITE_DEMO_MODE=true`: the demo build, with the demo logins and the demo PIN. Only this build contains them.
- Development with neither set: the demo logins, so local work needs no setup.
- A production build with neither: nothing starts, and the page says what is missing. It never falls back to the demo logins.

To run the login against the backend, start the dev server on `localhost` (the backend allows only
`http://localhost:5173`) with the API address set:

```bash
VITE_API_URL=http://localhost:3000 node node_modules/vite/bin/vite.js --host localhost --port 5173
```

### PIN unlock (`/login/pin`)

Built on the backend (branch `feat/pin-unlock`, API doc section 4). With the backend login, the PIN button is
shown only where this device is remembered (`GET /auth/device`); otherwise `/login/pin` goes back to the email
login. A login that ticks "Recordar este dispositivo" sends `remember_device: true`, which sets the 30-day device
cookie. Only a successful email and password login lifts the PIN lock.

The PIN unlocks the panel on the device that remembers the person. It does not replace the
password: it only starts a session again on a device that has been used before.

| Operation | Input | Output | Rules / errors |
|---|---|---|---|
| `getRememberedDevice` | none | `RememberedDevice` `{ name, initials, email, device }` | Shown above the keypad. The keypad works before this answer arrives. |
| `unlockWithPin` | `{ pin }` | `PinResult`: `ok`, `wrong` with `attemptsLeft`, or `locked` | Only `ok` starts a session; the screen then goes to the page the person asked for. |

Server rules:

1. The PIN is exactly 4 digits (`PIN_LENGTH`). The screen only sends complete PINs, but the server
   must reject anything else (`400`).
2. A wrong PIN answers `wrong` with the attempts left. The screen says "Te quedan N intentos" or,
   for the last one, "Te queda 1 intento".
3. After 3 wrong attempts (`maxAttempts` in the mock) the answer is `locked`. While locked, every
   call answers `locked`, even with the right PIN. The screen then shows "Acceso bloqueado" and
   offers the email and password login.
4. Any other failure (network, `500`) shows the generic "No se pudo entrar. Inténtalo de nuevo."
   The server must not count such a failure as an attempt.
5. The mock's demo PIN is `1234` and its lock lasts until a reload. The real lock rules are open.

Open, owned elsewhere:

- ISS-4: session length and logout rules (user). The PIN lock has no timer; it ends with a successful email login.
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
| `getKitchenBoard` | `GET /kitchen/orders` | `KitchenBoard` (`kitchen/kitchen.ts`): shift start time, the active orders (`new`, `preparing`, `ready`) and `delivered`, the orders delivered and paid in the current shift, newest first, each with `deliveredAt`. Changes from other devices arrive over the socket (section 6); this read is the first load. |
| `listLiveEvents` | `GET /live-events` | `LiveEvent[]` (`live/live-console.ts`) |
| `watchLiveEvents` | socket (section 6) | `LiveEvent` as each one happens. Event ids must only grow. |

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
| `closeKitchenShift` | `POST /kitchen/shift/close` | none | `KitchenBoard` | Sets `shiftClosedAt` (`HH:mm`) after the person confirms "Sí" in the pop-up. Closing a closed shift keeps the first time. The board then shows "Turno cerrado" and "Cerrar turno" is disabled. |

Notes: the history belongs to the shift. "Cerrar turno" is built as a close marker only: the new shift does not yet start with an empty history, and orders can still change after the close. The history reset is open. "Late" is not stored; the screen works it out from the pickup time and the clock. Pickup
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
| `inviteMember` | `POST /team/invitations` | `{ email, role: 'kitchen' \| 'bar' }` | `TeamState` (with `invitations`) | Email must be a valid address (stored lowercase). Role is kitchen or bar only: an owner cannot be invited (D-1, SCH-3). An email with a live invitation (not yet expired) cannot get a second one. The invitation expires 7 days after it is sent (D-2) and works once (D-3). The server assigns the id. |
| `cancelInvitation` | `DELETE /team/invitations/{id}` | invitation id | `TeamState` | Only a pending invitation can be cancelled; its link stops working at once. Unknown id is an error. |
| `resendInvitation` | `POST /team/invitations/{id}/resend` | invitation id | `TeamState` | Sends the same invitation again: the expiry becomes 7 days from the day it is resent (D-2). Refused when the same email has another invitation still in its days. Unknown id is an error. |
| `setMemberActive` | `PATCH /team/members/{id}` | `{ active }` | `TeamState` | Deactivates or reactivates a member. Deactivating keeps their history. At least one active owner must remain. |
| `removeMember` | `DELETE /team/members/{id}` | member id | `TeamState` | Deletes a member. Only offered from the edit pop-up, after a confirmation. At least one active owner must remain. Unknown id is an error. |
| `sendPasswordReset` | `POST /team/members/{id}/password-reset` (not built yet) | member id | nothing (204) | Sends the member an email with a link to choose a new password. The link works once and expires; the lifetime is the backend's to set (open question 7). Refused for a deactivated member. Unknown id is an error. The frontend shows the email it was sent to. |
| `listDevices` | `GET /team/members/{id}/devices` (not built yet) | member id | `StaffDevice[]` | The devices that remember the member: the active ones first, then the history (disconnected or expired). Each has `name`, `rememberedOn`, `lastUsed`, `status`, `endedOn`. |
| `disconnectDevice` | `DELETE /team/members/{id}/devices/{deviceId}` (not built yet) | member id, device id | `StaffDevice[]` for the member | Disconnects an active device: the next visit from it asks for the password again. A device that is not active, or belongs to another member, is an error. Owner only. |
| `setMemberPin` | `PUT /team/members/{id}/pin` (not built yet) | `{ pin }`, exactly 4 digits | `TeamState` | Sets or changes a member's PIN. The server stores it hashed and never returns it; `pinSet` turns true. Owner only. Unknown id is an error. Open question 6 covers how the PIN is kept and when the lock lasts. |
| `updateMember` | `PATCH /team/members/{id}` (same endpoint as `setMemberActive`, partial body) | `{ name?, role?: 'kitchen' \| 'bar' }` | `TeamState` | Changes a member's name (trimmed, not blank) and role. The owner's role is fixed, and nobody can become the owner (D-1, SCH-3). Unknown id is an error. |
| `saveSettings` | `PUT /team/settings` | `BarSettings` | `TeamState` | `barName` required and trimmed. |

`getTeam` returns each member with `email` (where recovery links are sent), `pinSet` (whether a PIN is set), `lastAccess` (`YYYY-MM-DD HH:mm` or null) and
`device` (the tablet the PIN is kept on, or null). The team list shows one row per member (status: active or
deactivated) and one row per pending invitation (status: invited, with its expiry date).

Note: staff join through an invitation link (D-1, WP-1.2, WP-1.3). The frontend no longer adds a
member directly: "Enviar invitación" sends an invitation. Accepting it (the link, the password the
person sets, and the member being created) belongs to the backend and is not in this contract yet.

## 5. Open questions for the backend owner and tech lead

1. The dashboard's `Order` (numeric `id`, `client`, `pickupTime`) and the order log's
   `OrderEntry` (string `id` such as `#44` or `B-12`) describe the same orders in two shapes.
   Should the backend serve one order model for both screens?
2. Real time: the frontend expects a push channel (section 6), not polling. The backend confirms the
   transport (WebSocket, as proposed, or server-sent events) and the message shapes.
3. Session transport and length (ISS-4), and the response for an expired session.
4. Invitation acceptance: the link, how the token travels, and when the member is created (see the note under Team).
5. Routes, versioning and error body format: the tech lead decides. The proposal in this
   document is only a starting point.
8. Remembered devices: how long a device stays remembered (the login says "Recordar este dispositivo 30 días"), what counts as its last use, and whether the device name is the one the person chose or one the system gives. `member.device` (the PIN tablet) is kept apart from this list.
7. Password recovery: the link's lifetime (how long it works), whether it works once, and what the person sees after the new password is set. The frontend sends it from the owner's pop-up only; the self-service "¿Olvidaste la contraseña?" link on the login page is a separate flow and is still a placeholder.
6. PIN unlock: how the PIN is set and stored per person, how a device is remembered, and how long
   the lock lasts (and who can clear it before that).

## 6. Real time (proposal)

The board and the live console do not poll. They watch a WebSocket that the backend pushes to. Every change
arrives as one JSON text message, so a change made on the mobile app (`tomar pedidos`) reaches the kitchen
board at once. The frontend reads it in `infrastructure/realtime/socket-realtime.ts`; while nothing watches,
the socket is closed, and a dropped socket reconnects with a growing wait (1, 2, 5, 10, then 30 seconds).

| Direction | Message | When |
|---|---|---|
| server → client | `{ "type": "kitchen.board", "board": KitchenBoard }` | On connect, and after every change to the kitchen board (from any device). The full board, not a diff. |
| server → client | `{ "type": "live.event", "event": LiveEvent }` | Each event as it happens. Ids only grow. |

Rules:
1. The handshake is a normal request on the same site, so the session cookie (`bp_session`) is sent with it. An
   expired or revoked session closes the socket. The frontend then keeps retrying; sending the person back to
   `/login` on a 401 mid-session is still open (section 2).
2. Unknown message types are ignored, so the backend can add messages without breaking the frontend.
3. The socket address is set at build time with `VITE_REALTIME_URL` (for example `wss://…/ws`). Without it the demo
   build uses the mock's own changes.
4. Open: the socket route and whether the server pushes a full board on connect only, or also after a reconnect.

