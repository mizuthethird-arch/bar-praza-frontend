# history.md — Bar Praza frontend

## 1. Snapshot header
- Date: 2026-10-31 · Agent: Kai (Frontend Engineer L2) · Session: first brain bootstrap
- Branch/commit: UNKNOWN — needs human input (not a git repository)

## 2. Project identity
- Bar Praza restaurant app, frontend only. Mock data only; no backend connected.
- Stack (from frontend/package.json): React ^19.3.1, react-router ^8.5.1, Vite ^8.3.5, Tailwind CSS ^4.3.3, Vitest ^5.0.5, framer-motion ^14.8.0.
- Layers: src/domain → src/application (use cases + ports) → src/infrastructure/mock → src/presentation (React). Composition root: src/main.tsx.
- UI language: Spanish. Dark design line (see design-map.md).
- Dev server: `npm run dev` in frontend/, open http://127.0.0.1:5173 (port 5173, NOT 3000).

## 3. Objective now
Finish the frontend views on the mock backend and keep the test suite green; wait for the human's visual verdicts before polishing further.

## 4. Status board
- Done: panels Resumen, Pedidos, Carta y productos, Stock, Horario y pedidos, Clientes, Informes, Personal y ajustes, Consola en vivo; route guard and mock session; Pedidos de cocina (/cocina) with 4 columns, history column and details pop-up.
- In progress: none.
- Not started: "Cerrar turno" behaviour (disabled); pop-up actions (undecided); Nuevos/Nuevo producto/Subir foto buttons (disabled); PWA icons (ISS-2 in project notes).
- Blocked: real backend (WP-1, owner Kai Backend, dates unknown).
- Awaiting sign-off: pop-up sheet look on a real phone; primary button colour.

## 5. Completed work (evidence 2026-10-31)
- Tests: `npm test` → 56 files, 304 tests passing. Coverage `npm run test:coverage` → 99.39 % statements, 97.24 % branches (threshold 95 % in frontend/vite.config.ts).
- `npx tsc -b` exit 0; `oxlint` no output; `vite build` built.
- Kitchen board: 4 columns from 2xl (1536 px); cards min-height 24rem, buttons full width; delivered orders compact green cards + details pop-up (portal). Verified in browser at 390, 1024, 1180, 1500, 1920 px: no horizontal overflow.
- Design guidelines test: src/design-guidelines.test.ts (palette only, no serif/custom fonts, shared Page layout, one h1; and the standard names every value in use).
- Design standard: frontend/docs/design-standard.md (13 sections).
- Pop-up motion: bottom sheet, spring rise, drag to close; checked in browser at 390 px (short drag snaps back, 220 px drag closes).
- Tests: 60 files, 321 passing (2026-10-31); coverage 99.22 % statements.

## 6. In-flight work
None. Nothing half-finished. Abandoning now would lose nothing.

## 7. Blockers
- Backend endpoints: docs/backend-contract.md (draft, owner: tech lead decides URLs).
- Session length/logout rules: ISS-4 (user).

## 8. Open questions for the human
See memory/open-questions.md (authoritative list).

## 9. Decisions log
See shared/decisions.md (authoritative list).

## 10. Rules in effect
- RULE-FE-0001 (responsive, role scope, active): check at 390/1024/1500/1920 before done.
- RULE-FE-0002 (design, draft): palette, font and layout guidelines; becomes active after 2+ confirmations.

## 11. Conflicts
- CONFLICT-0001 (pending, flagged): project-brain/ path used by PM brain.
- CONFLICT-0002 (resolved by human 2026-10-31): reference image was light cream; app dark line kept.

## 12. Known risks & landmines
- Do not use custom hex or serif headings in screens (design test fails; user rejected it).
- Do not put colour classes on the shared card shell; add tone per card (Tailwind class order is not reliable).
- Do not add `overflow-x-hidden` to hide overflow; check element bounds instead.
- Chime uses AudioContext; browsers may block it until the user interacts.
- Playwright: the installed browser is chromium_headless_shell-1248; system libs (nspr, nss, asound) are extracted outside the repo.

## 13. Do-not-redo list
See memory/failed-attempts.md.

## 14. Next actions
1. Get visual verdicts on the pop-up and the primary button (acceptance: recorded in design-map.md with date).
2. Answer open questions Q1–Q4 (acceptance: each answer recorded in decisions.md).
3. Decide and implement "Cerrar turno" (acceptance: test first, then browser check at 4 widths).

## 15. Environment
- Install/run: `cd frontend && npm run dev` (port 5173). Test: `npm test`. Coverage: `npm run test:coverage`. Build: `npm run build`. Lint: `npm run lint`.
- npm on this machine: `node /mnt/c/Users/eliut/.unsloth/node/node_modules/npm/bin/npm-cli.js`.
- Demo logins: docs/mock-data.md (mock only; never copy passwords into shared files).
- No git repository.

## 16. Files touched map
- frontend/src/presentation/features/kitchen/* — kitchen board, columns, cards, history, pop-up.
- frontend/src/domain/kitchen/kitchen.ts — board rules and shift total.
- frontend/src/infrastructure/mock/mock-kitchen-repository.ts — mock kitchen data.
- frontend/src/design-guidelines.test.ts — design guideline checks.
- frontend/docs/mock-data.md, backend-contract.md — documentation.

## 17. Handoff note
The kitchen board is the newest and most-changed screen. The human has given specific verdicts (see §20). Use the design-map values; ask before changing a value marked approved. Pop-up and primary button are unconfirmed. Tests and browser checks are current as of 2026-10-31.

## 18. Absorption checklist
1. What is the project, in one sentence? Bar Praza restaurant app, frontend, mock data.
2. What is the current milestone? Views on the mock backend, green suite, visual verdicts pending.
3. What is half-finished? Nothing. Abandoning would lose nothing.
4. Three next actions: see §14.
5. Rules constraining the next action: RULE-FE-0001; RULE-FE-0002 (draft); R13 test-first; R17 frontend only.
6. Failed approaches: memory/failed-attempts.md.
7. Approved vs provisional visuals: shared/design-map.md.
8. Pending visual questions: §19.
9. Verified breakpoints/browsers: §21.

## 19. Visual state
- /cocina (desktop 1920, phone 390): pop-up panel corrected to dark with grey border (neutral-700), verdict 2026-10-31; awaiting choice grey vs white. Primary button (neutral-100 on dark) — provisional.
- Route to view: http://127.0.0.1:5173/login, then log in as cocina@barpraza.test (password in docs/mock-data.md), then /cocina.

## 20. Design decisions confirmed (human verdicts, in order)
- Dark app line kept over the light cream reference · corrected · 2026-10-31 · CONFLICT-0002
- Late order red; ready order green; "Entregado y cobrado" green · approved · 2026-10-31
- Column title height and format ("esta perfecto") · approved · 2026-10-31
- Four columns from 2xl (Q1 yes) · approved · 2026-10-31
- Order cards: min 24rem, grow with content, full-width stacked buttons · approved · 2026-10-31
- Delivered orders: compact green card; details in pop-up · approved · 2026-10-31
- Total card below the delivered cards; no sub-count needed · approved · 2026-10-31
- Consola en vivo unchanged · approved · 2026-10-31
- Brain location kept separate (Q1) · approved · 2026-10-31
- Pop-up: dark panel with grey or white borders (Q2) · corrected · 2026-10-31; grey applied
- Design standard written (2026-10-31, human request)
- Contrast calculated (2026-10-31, Q2 yes): 16 pairs; neutral-500 text failed AA; now neutral-400 everywhere (Q1); all 16 pairs pass (CONFLICT-0003 resolved)
- Focus ring neutral-100 global (Q2); verified in browser
- Q1 (2026-10-31): sky kept; "Entregado y cobrado" button also sky (deliverButton, white on sky-700 5.86:1).
- Listos sky blue; delivered cards grey with green border; total card the only fully green card (2026-10-31, human). Contrast: sky pairs 8.24, 10.73.
- Pop-up is a phone bottom sheet (2026-10-31, human request): spring, grab handle, drag to close; checked at 390 px in the browser
- Pop-up border grey confirmed (Q1, 2026-10-31)
Recorded in shared/design-map.md.

## 20b. Design decisions pending
- Pop-up actions (reprint ticket, mark incident)? — question asked, no answer.
- Remember "Sonido activo" per device? — question asked, no answer.

## 21. Browser & breakpoint verification
- Checked (Playwright, Chromium headless shell 1248, 2026-10-31): 390 px, 1024 px, 1180 px, 1500 px, 1920 px. No horizontal overflow; no element outside its card; buttons full width.
- Not checked: 320 px, 768 px, 1280 px exactly; Firefox; WebKit/Safari.
