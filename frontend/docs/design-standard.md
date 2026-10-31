# Design standard — Bar Praza

Status: written from the code and the human's verdicts on 2026-10-31. Every value here is in use.
Where a value came from the human, the verdict date is given. Where it is only in the code, it is marked provisional.
A new colour, size or motion value needs a verdict first and then an entry here (see "How to change this standard").

Source files: `src/presentation/ui/classes.ts`, `src/presentation/ui/motion.ts`, `src/presentation/ui/Page.tsx`, `src/presentation/features/kitchen/*`.
Tests that enforce parts of this standard: `src/design-guidelines.test.ts` (palette, font, layout, and that this document names the values in use).

## 1. Base palette

Only Tailwind palette classes. No custom hex. No serif headings.

| Role | Classes | Used for | Status |
|---|---|---|---|
| Page | `bg-neutral-950 text-neutral-100` | page background and text | approved (human, 2026-10-31: keep the dark line) |
| Card | `border-neutral-800 bg-neutral-900` | every neutral card | approved (2026-10-31) |
| Strong border | `border-neutral-700` | dialogs, selects | approved (2026-10-31, pop-up border grey) |
| Muted text | `text-neutral-400` for labels, eyebrows, empty states and hints | all muted text | approved 2026-10-31 (`text-neutral-500` was removed: it fails WCAG AA, CONFLICT-0003) |
| Body text | `text-neutral-300` secondary, `text-neutral-100` primary | body copy | approved (in use) |
| Divider | `border-neutral-800` (and `/70` in tables) | lines inside cards and tables | approved (in use) |

## 2. Status tones

Each status has one tone: a border, a background and a badge. Put the tone on the card itself; do not put a colour class on the shared shell.

| Status | Card | Badge | Text | Approved |
|---|---|---|---|---|
| Neutral (new, preparing) | `border-neutral-800 bg-neutral-900` | — | `text-neutral-300` for "Preparando" | 2026-10-31 |
| Alert (late, low stock) | `border-red-900 bg-red-950/40` | `bg-red-900 text-red-100` | `text-red-300` for notes | 2026-10-31 (late order red) |
| Ready (Listos) | `border-sky-900 bg-sky-950/40` | `bg-sky-900 text-sky-100` ("Listo") | `text-sky-300` | 2026-10-31 (human: ready cards blue, matching the palette) |
| Delivered (history cards) | `border-emerald-900 bg-neutral-900` (grey card, green border) | — | `text-emerald-300` for the time | 2026-10-31 (human: only the total card is fully green) |
| Total cobrado | `border-emerald-900 bg-emerald-950/40` (the only fully green card) | — | `text-emerald-300` for the amount | 2026-10-31 |
| Open shift | — | `bg-emerald-950 text-emerald-300` ("Turno abierto") | — | 2026-10-31 |
| Count | — | `bg-white text-black` (number in a title) | — | 2026-10-31 |

Badges: `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap`.

## 3. Buttons

All buttons: `rounded-md text-sm`. Full width inside cards (human, 2026-10-31).

| Kind | Classes | Use | Status |
|---|---|---|---|
| Primary | `bg-neutral-100 text-neutral-950` with `px-4 py-2 font-medium hover:bg-white` (primaryButton) | main action on a panel page | provisional (no kitchen verdict yet) |
| Deliver | `bg-sky-700 text-white` with `px-4 py-2 font-medium hover:bg-sky-600` (deliverButton) | "Entregado y cobrado" (sky, like the Listos cards: human, 2026-10-31) | approved 2026-10-31 (green); contrast not yet calculated |
| Outline | `border border-neutral-600 hover:bg-neutral-800` (outlineButton) | secondary actions, "Cancelar", "Cerrar" | approved (in use) |
| Destructive text | outline plus `text-red-400` | "Sí, cancelar" | approved (in use) |
| Disabled | `opacity-40` | not yet built ("Cerrar turno") | approved (in use) |

Stacked button rows inside a card: `flex flex-col gap-2`, each `block w-full whitespace-nowrap py-3 text-center`.

## 4. Typography

App font: monospace (`font-mono` on the app shell and login). No serif, no other family.

| Role | Classes |
|---|---|
| Eyebrow | `text-xs uppercase tracking-[0.2em] text-neutral-400` |
| Page title (h1) | `text-3xl font-bold tracking-tight` |
| Column or section title (h2) | `text-lg font-semibold`, in a row of `min-h-14 items-end` (two lines fit) |
| Order number | `text-2xl font-bold` |
| Customer name | `font-semibold` |
| Body | `text-sm` |
| Small text, timestamps | `text-xs` |
| Money in a total | `text-2xl font-bold text-emerald-300` (total card) |

## 5. Shape and spacing

| Element | Classes | Status |
|---|---|---|
| Card | `rounded-xl border p-5` (`p-4` for compact cards) | approved (2026-10-31) |
| Inputs and selects | `rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm` | approved (in use) |
| Page padding | `p-4 md:p-10`, `max-w-6xl`, `space-y-6` | approved (in use) |
| Gaps in grids | `gap-4` between cards, `gap-6` between columns | approved (in use) |

## 6. Cards and sizes

- Order cards (kitchen): `min-h-[24rem] h-auto w-full`. Every card is at least 24rem; a card with more content grows. No inner scroll. (2026-10-31)
- Delivered cards: compact, about 66 px tall, `p-4`. Tapping one opens the details pop-up. (2026-10-31)
- Total card: under the delivered cards, same border and tone as the done cards. (2026-10-31)
- Titles of every column share one height (`min-h-14`), so the first card in each column starts on the same line. (2026-10-31)

## 7. Layout and breakpoints

Full contract: `project-brain/shared/breakpoints.md` (in `frontend/project-brain/`).

- Mobile first. One column below 768 px.
- Kitchen: two columns from `md` (768 px); the history spans both; four columns from `2xl` (1536 px). (2026-10-31)
- Test widths used: 390, 1024, 1180, 1500, 1920 px. Not yet checked: 320, 768, 1280.
- No horizontal page scroll. Do not hide overflow with `overflow-x-hidden` to pass a check; check element bounds instead.

## 8. Motion

| Pattern | Values | Where | Reduced motion |
|---|---|---|---|
| Page entrance | fade and rise: opacity 0→1, y 8→0; children stagger 0.06 s | every panel page (`staggerContainer`, `useFadeUp`) | no movement |
| Pop-up sheet (phone style) | overlay fades over 0.2 s; the sheet rises from the bottom edge on a spring (`type: 'spring'`, stiffness 360, damping 34); it drops away in 0.22 s (`ease: 'easeIn'`) | details pop-up (`sheetMotion`) | appears at once, no movement |
| Drag to close | the sheet follows the finger; it closes if dragged more than 120 px down or flicked faster than 600 px/s down (`shouldDismiss`) | details pop-up | n/a (still closes with the close button and Escape) |

Values in code (`sheetMotion`): overlay `duration 0.2`; sheet hidden `y: 100%`, shown `y: 0` with `type: spring`; exit `duration 0.22`.

Respect the user's setting: every motion value goes through `useReducedMotion`. Do not add motion without a verdict.

## 9. Pop-ups and overlays

- Overlay: `fixed inset-0 z-50 bg-black/70`. Sheet at the bottom on phones (`items-end`); centred from `md` (`md:items-center md:p-4`).
- Sheet: `w-full max-w-md max-h-[90vh] rounded-t-2xl border border-neutral-700 bg-neutral-950 px-6 pb-6 pt-3 md:rounded-xl md:p-6`. (Border grey, human, 2026-10-31.)
- Grab handle on phones: `mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-600 md:hidden`, `aria-hidden`.
- `role="dialog" aria-modal="true" aria-labelledby`.
- Opened through a React portal (`createPortal` to `document.body`), so it sits above the page.
- Focus: moves to the close button on open; returns to the element that opened it on close.
- Closes with the close button, Escape, or a drag down (see section 8). Does not close on refresh.

## 10. Accessibility

- Every control has visible text or an accessible name.
- Cards that open something are `button` elements, not `div`s with handlers.
- Errors use `role="alert"`.
- Focus ring (decision 2026-10-31, human): one global rule in `src/index.css`, `:focus-visible { outline: 2px solid neutral-100; outline-offset: 2px }`. Contrast of `neutral-100` against the page is 18.16:1 (non-text minimum 3:1). A unit test cannot read CSS in this setup, so it is verified in the browser: Tab to a button, its computed outline is `solid 2px oklch(0.97 0 none)` (neutral-100), 2026-10-31.

### Contrast (WCAG AA: 4.5:1 for text)

Checked by `src/presentation/ui/palette-contrast.test.ts` with the Tailwind v4 palette. Translucent tints are blended over the page or card colour first. Measured 2026-10-31.

| Text on background | Ratio | Result |
|---|---|---|
| neutral-100 on page | 18.16 | pass |
| neutral-300 on card | 12.09 | pass |
| neutral-400 on card | 6.94 | pass |
| neutral-400 on page | 7.66 | pass |
| red-300 on red tint (alert cards) | 9.84 | pass |
| red-400 on card (destructive text button) | 6.21 | pass |
| red-100 on red-900 (Retrasado badge) | 8.22 | pass |
| emerald-300 on emerald tint (ready, delivered, total) | 12.01 | pass |
| emerald-100 on emerald-900 (Listo badge) | 8.47 | pass |
| emerald-300 on emerald-950 (Turno abierto) | 9.97 | pass |
| sky-100 on sky-900 (Listo badge) | 8.24 | pass |
| sky-300 on sky tint (Listos card text) | 10.73 | pass |
| emerald-300 on card (delivered time) | 11.78 | pass |
| white on sky-700 (Entregado y cobrado) | 5.86 | pass |
| neutral-950 on neutral-100 (primary button) | 18.16 | pass |
| black on white (count badge) | 21.00 | pass |
| neutral-100 on card (outline button) | 16.44 | pass |
| neutral-400 on page (eyebrow, empty states) | 7.66 | pass (replaces neutral-500, which was 4.18) |
| neutral-400 on card (hints inside cards) | 6.94 | pass (replaces neutral-500, which was 3.78) |

Decision 2026-10-31 (human): muted text uses `neutral-400`. No text in the app uses `neutral-500` any more; a guideline test enforces this.

## 11. Do and don't

Do:
- Use the tone table in section 2 for every status.
- Use the shared pieces: `Page`, `PageHeader`, `Reveal`, `ui/classes.ts`, `KitchenColumn.tsx`.
- Check every visual change at 390, 1024, 1500 and 1920 px (RULE-FE-0001).

Don't:
- Use custom hex, serif fonts or new palettes (ATTEMPT-0001 in `project-brain/memory/failed-attempts.md`).
- Put colour classes on the shared card shell (ATTEMPT-0003).
- Use fixed-height cards with inner scrolling (ATTEMPT-0007).
- Use side-by-side buttons in narrow cards (ATTEMPT-0006).
- Use four columns below 1536 px (ATTEMPT-0005).
- Use an all-black page (ATTEMPT-0002).

## 12. How to change this standard

1. The human gives a verdict on a specific value, with a date.
2. Write a failing test for the change (R13), then the change.
3. Record the value here with its verdict date and status (approved or provisional).
4. If it contradicts an earlier entry, log it in `project-brain/conflicts.md` and ask the human before changing it.

## 13. Open items

- Confirm the primary button colour on the kitchen screen (provisional).
- Confirm the pop-up border: grey (applied) or white.
- Confirm the grab handle and drag-to-close feel on a real phone (not checked on a device).
