# Conflicts

## CONFLICT-0001 — 2026-10-31
- Rules: none (resource collision)
- Type: scope_collision (not one of the five types; same path, different owners)
- Context: project-brain/ at the repo root already holds Sam's PM brain. The protocol says Kai's brain lives at project-brain/.
- Resolution: Kai's brain created at frontend/project-brain/. Sam's files were not read for editing and not changed.
- Action: none on Sam's files.
- Flagged to human: yes
- Human verdict 2026-10-31: keep it separate. Status: resolved.
- Follow-up: none.

## CONFLICT-0002 — 2026-10-31
- Rules: reference image (light cream, Bar Praza · Pedidos) vs the app's dark line
- Type: visual_tension
- Context: the human's first /cocina reference was light cream; the rest of the app is dark.
- Resolution: human verdict 2026-10-31: keep the dark line (D-FE-01).
- Action: /cocina restyled to the dark line; cream rejected.
- Flagged to human: yes (resolved by the human)
- Follow-up: none.

## CONFLICT-0003 — 2026-10-31
- Rules: guardrail 12 (accessibility vs design) — neutral-500 text used for eyebrows, empty states and hints
- Type: visual_tension (accessibility vs design)
- Context: WCAG contrast calculated with the Tailwind palette: neutral-500 on page 4.18:1, on card 3.78:1 (AA needs 4.5:1 for text).
- Resolution: pending human decision. Not changed silently. Recorded as known failures in palette-contrast.test.ts, which fails if they pass without the list changing.
- Action: text-neutral-500 replaced by text-neutral-400 in all screens and shared classes; palette-contrast test now has no known failures.
- Flagged to human: yes
- Human verdict 2026-10-31 (Q1): neutral-400. Status: resolved.
- Follow-up: none.

