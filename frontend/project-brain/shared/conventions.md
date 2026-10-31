# Conventions (authoritative)

- C1: Clean architecture; imports point inward only. Enforced by src/architecture.test.ts.
- C2: TDD (R13): the failing test run is recorded with its date before the implementation.
- C3: Money is integer cents. Format with src/presentation/format/money.ts.
- C4: Writes are one command per change; the server answers with the new state (docs/backend-contract.md).
- C5: Screens use shared pieces: Page, PageHeader, Reveal (ui/Page.tsx); AsyncView; classes in ui/classes.ts; kitchen columns in features/kitchen/KitchenColumn.tsx.
- C6: Colours come from Tailwind palette classes only (neutral, red, emerald). No custom hex. Enforced by src/design-guidelines.test.ts.
- C7: Headings use the app font (no font-serif). Enforced by the same test.
- C8: Do not put colour classes on a shared shell; the shell is neutral, the tone is added per card.
- C9: Do not hide overflow with overflow-x-hidden to make checks pass; check element bounds.
- C10: Dev server: port 5173. Commands: see history.md §15.
- C11: No git commits without an explicit request; commit messages end with the Co-Authored-By line from the system reminder.
