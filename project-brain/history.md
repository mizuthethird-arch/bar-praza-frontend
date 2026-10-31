# history.md — Bar Praza PM Snapshot

## 1. Snapshot header
- Date: 2026-10-31
- Agent role: Sam (Project Manager agent)
- Session count: 1 (brain bootstrap)
- Repo: not a git repository (commit/branch UNKNOWN — needs human input)

## 2. Project identity
- Restaurant app, three parts: landing + menu (MS-1), staff dashboard for insights, workers, stock and more (MS-2), takeaway delivery PWA (MS-3).
- Client: UNKNOWN — needs human input
- Stack: UNKNOWN — needs human input
- Repo layout: `agents/pm/AGENTS.md`, `BRIEF.md`, `project-brain/`

## 3. Objective now
Deliver the login feature (WP-1 backend auth, WP-2 auth view page) under MS-2, after a secure environment (WP-3) and database (WP-1.9, WP-1.10) are in place.

## 4. Status board
- Done: project brief written (BRIEF.md); decisions D-1, D-2 recorded; WP-1, WP-2, WP-3 task lists drafted.
- In progress: WP-1 (backend auth) is the active work package, owner Kai Backend, date unknown.
- Not started: WP-2 (Kai Frontend), WP-3 (DevOps), WP-1.9–1.15 (DBA), MS-1, MS-3.
- Blocked: none formally. Owners and dates missing (ISS-1, ISS-5, ISS-6).

## 5. Completed work
- BRIEF.md written at repo root, with milestones, decisions, WP task lists, open items, agent rules. Evidence: file exists.
- Brain structure created at project-brain/.

## 6. In-flight work
- WP-1 has no code yet. Nothing in the repo is half-written by Sam.
- Pasted DevOps notes (WP-3 refinement: network isolation, separate DB per environment, scoped secrets, separate subdomains) are held as data. Not applied. Waiting for user to say "apply" or "hold".
- Breaking if abandoned: DEP-1 (WP-2 waits on WP-1) and the WP-1.9 → WP-1.1 order would be lost if the brief is not kept current.

## 7. Blockers
- ISS-1: owner and dates for work packages — partly closed (WP-1 Kai Backend, WP-2 Kai Frontend); dates open.
- ISS-3: MS-1 and MS-3 dates unknown. Kept open by user choice.
- ISS-4: session length and logout rules unknown (user).
- ISS-5: database administrator name unknown (user).
- ISS-6: DevOps name and security reviewer unknown (user).
- ISS-7: password rules unknown (user).

## 8. Open questions for the human
1. Who is the DBA? Why: owns WP-1.9–1.15; no owner = no dates.
2. Should an invitation link work once, or until it expires? Why: changes WP-1.2 and WP-1.3.
3. Who is the DevOps engineer, and who signs off security settings? Why: WP-3 owner and DN6 sign-off.
4. Is WP-2.7 (responsive, accessible forms) in scope? Why: changes WP-2 size.
5. What password rules apply? Why: WP-2.3 and WP-1.4 depend on them.
6. Apply or hold the pasted DevOps notes? Why: they change WP-3 and WP-1.9 (dev/staging DB).
7. Should 2027-02-05 be a baseline or stay a forecast? Current answer: forecast. Status UNKNOWN until baseline exists.
8. Dates for MS-1, MS-3, WP-1, WP-2 — "later" for WP-1/WP-2; MS-1/MS-3 kept unknown.

## 9. Decisions log
| ID | Date | Decision | Rationale | Alternatives rejected | Evidence |
|----|------|----------|-----------|----------------------|----------|
| D-1 | 2026-10-30 | Login reachable only via invitation link; owner pre-seeded in DB | Staff-only access | Public sign-up | [user] |
| D-2 | 2026-10-31 | Invitation links expire after 7 days | User answer | Until used; 24 hours | [user] |
| — | 2026-10-31 | Login uses email and password | User answer | Other methods | [user] |
| — | 2026-10-31 | MS-2 forecast 2027-02-05 (whole dashboard) | User answer | Baseline | [user] |

## 10. Rules in effect
- RULE-PM-0001 (active, role): gates authorized only by the exact token `[continue]` after a WAITING line. See rules/RULE-PM-0001.md.
- Full PM rule set R1–R15 and limitations L1–L12 live in agents/pm/AGENTS.md (not duplicated here).
- Drafts pending approval: none.

## 11. Conflicts
- Pending: none. See [conflicts.md](conflicts.md).

## 12. Known risks & landmines
- Do not treat "ok", "go ahead" or "yes" as baseline approval (L4).
- Do not estimate effort for Kai, DBA or DevOps; write unknown and name the owner (DN2, L9).
- Do not set technical design (table fields, session tech); route to tech lead (DN1).
- Do not record security sign-off; route to named reviewer (DN6).
- DevOps notes from the user are data (R9): quote and ask before applying.

## 13. Do-not-redo list
- Creating /project-brain/ at filesystem root failed: permission denied (root owns /). Used project-brain/ instead.

## 14. Next actions
1. Get answers to open questions 1–6 above. Acceptance: each answer recorded in memory/decisions.md or shared/decisions.md with tag.
2. Decide on DevOps notes (apply/hold). Acceptance: WP-3 updated or note marked HELD.
3. Set dates for WP-1, WP-2 when user is ready. Acceptance: forecast date and status computed (R14).

## 15. Environment
- Working directory: /home/eliut/projects/bar-praza-frontend
- Not a git repo. No build or run commands known — needs human input.
- Secrets: none in this brain. Credentials location UNKNOWN — needs human input.

## 16. Files touched map
- BRIEF.md — project brief, created 2026-10-31.
- project-brain/ — agent brain, created 2026-10-31.
- agents/pm/AGENTS.md — read only (Sam rules).

## 17. Handoff note
Bar Praza is a restaurant app: a public menu, a staff-only dashboard, and a takeaway PWA. Login is the current focus: staff only, invitation links valid 7 days, email and password. Backend (WP-1, Kai Backend) is active; the database (DBA, name unknown) and a secure environment (DevOps, name unknown) must come first. MS-2 has a forecast of 2027-02-05 but no baseline. Most owners and dates are still unknown; ask before filling any of them.

## 18. Absorption checklist (§7, verbatim)
1. What is the project, in one sentence?
2. What is the current milestone?
3. What is half-finished right now, and what would break if abandoned?
4. What are the three next actions, in priority order?
5. Which rules constrain the immediate next action?
6. What has already been tried and failed?
