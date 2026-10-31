# Project Brief: Restaurant App

Last updated: unknown (no date supplied). Owner of this brief: Sam (PM agent).

## Objective
A restaurant app with three parts:
- **MS-1 Landing and menu page**
- **MS-2 Restaurant dashboard**: insights, workers, stock and more
- **MS-3 Takeaway delivery PWA**

## Milestones
| ID | Name | Owner | Forecast | Status |
|----|------|-------|----------|--------|
| MS-1 | Landing and menu page | unknown (user) | unknown | UNKNOWN |
| MS-2 | Restaurant dashboard | unknown (user) | 2027-02-05 | UNKNOWN (no baseline) |
| MS-3 | Takeaway delivery PWA | unknown (user) | unknown | UNKNOWN |

## Current focus: Login (under MS-2)
Staff only. The owner account is pre-defined in the database. Every other staff member joins through an invitation link.

Decisions:
- **D-1**: Login is reachable only through an invitation link. The owner record is pre-seeded in the database.
- **D-2**: Invitation links expire after 7 days.
- Login uses email and password.

Work packages:
- **WP-1 Backend auth**: Kai Backend. Date unknown. Active now.
- **WP-2 Auth view page**: Kai Frontend. Date unknown. Waits on WP-1 (DEP-1).
- **WP-3 Secure environment**: DevOps (name unknown). Must finish before WP-1.9.

Build order: WP-3 (environment), then WP-1.9 and WP-1.10 (database), then WP-1.1 to WP-1.7 (backend), then WP-2 (frontend).

Task list for WP-1 (backend):
- WP-1.1 Seed the owner account
- WP-1.2 Generate invitation links with 7-day expiry
- WP-1.3 Accept an invitation and create the staff account
- WP-1.4 Store email and hashed password
- WP-1.5 Login endpoint and session start
- WP-1.6 Block emails without an invitation or account
- WP-1.7 Clear errors for wrong credentials, expired and used links
- WP-1.8 Tests for WP-1.1 to WP-1.7

Task list for WP-1 (database, owner: DBA, name unknown):
- WP-1.9 Set up the database for dev and production
- WP-1.10 Create owner, account and invitation tables (fields from tech lead)
- WP-1.11 One account per email address
- WP-1.12 Backend database user with minimal access
- WP-1.13 Migrations with rollback
- WP-1.14 Nightly backups and a tested restore
- WP-1.15 Run the owner seed in each environment

Task list for WP-3 (environment, owner: DevOps):
- WP-3.1 Separate dev, staging and production
- WP-3.2 Secrets in a secrets manager, never in code
- WP-3.3 HTTPS everywhere with automatic certificate renewal
- WP-3.4 Database reachable only from the backend
- WP-3.5 Named accounts with multi-factor login for admin and deploy
- WP-3.6 Automated tests and dependency scans on every change
- WP-3.7 Logging and alerts for failed logins

Frontend work package (dashboard, mock backend):
- **WP-4 Frontend gaps**: Kai Frontend [proposed, not yet confirmed]. Date and effort unknown. Covers dead or disabled controls, missing screens and the mock-to-HTTP switch. Full list with FE-n IDs: [frontend/docs/frontend-status.md](frontend/docs/frontend-status.md).
  - WP-4.1 Wire dead links on Resumen, including "Abrir consola" → `/consola` (FE-1 to FE-3)
  - WP-4.2 Dish add and edit from Resumen (FE-4, FE-5)
  - WP-4.3 New category, new product, photo upload (FE-8 to FE-10)
  - WP-4.4 "Cerrar turno" in the kitchen (FE-11)
  - WP-4.5 Customer history (FE-12)
  - WP-4.6 Stock CSV export: build it or correct the doc (FE-14)
  - WP-4.7 Invitation landing and set-password page, tied to WP-2.2 (FE-15, FE-16)
  - WP-4.8 Handle 401 mid-session (FE-17)
  - WP-4.9 Role-based page access (FE-18)
  - WP-4.10 Replace mock adapters with HTTP adapters (FE-21)
  - WP-4.11 Design open items and layout checks at 320, 768, 1280 px (FE-22 to FE-24)

## Open items
- **ISS-1**: Owner and dates for work packages. Partly closed: WP-1 and WP-2 owners supplied; dates open.
- **ISS-3**: MS-1 and MS-3 dates unknown. Kept open by choice.
- **ISS-4**: Session length and logout rules unknown. Supplied by user.
- **ISS-5**: Database administrator name unknown. Supplied by user.
- **ISS-6**: DevOps name and security reviewer unknown. Supplied by user.
- Invitation links: single use or valid until expiry? Unanswered.

## Rules for AI agents working on this
1. Work only from this brief and from what the user says in the conversation.
2. Do not invent dates, owners, or effort estimates. Write "unknown" and name who can supply it.
3. Tag every figure with its source: [user], [owner:<role>], or [calc: formula].
4. Keep IDs stable. Never renumber. Retire an item by marking it VOID.
5. Do not change a decision (D-#) without new evidence.
6. Technical design belongs to the tech lead. Security sign-off belongs to the named reviewer.
7. Do not treat "ok" or "go ahead" as approval for a baseline. Baseline issue needs an explicit go-ahead from the user.
