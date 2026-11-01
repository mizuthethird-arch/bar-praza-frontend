---
name: popup
description: Use whenever the user asks for a pop-up, dialog, modal, overlay or bottom sheet in the Bar Praza frontend. Builds it on the shared Sheet component so it opens, closes and animates exactly like the delivered-order pop-up in Entregados y cobrados.
---

# Pop-up (shared Sheet)

Every pop-up in the app uses one shell, so they all behave the same. The reference is the
delivered-order details in "Entregados y cobrados" (`DeliveryDetailDialog`). The Agotados list
in Pedidos de cocina is the second user.

Work from the frontend folder (`frontend/`). Paths below are relative to it.

## What the shell already does (do not rebuild it)

`src/presentation/ui/Sheet.tsx` provides `<Sheet titleId onClose footer?>children</Sheet>`:

- Rendered through a portal to `document.body`, above the page (z-50), on a black/70 overlay that fades in.
- On a phone it rises from the bottom edge as a spring sheet with a grab handle. From `md` it is a centred, rounded dialog (max width `md`).
- Closes with Escape, the **Cerrar** button, or a drag down (120 px, or a flick of 600 px/s).
- Takes focus on **Cerrar** when it opens, and gives focus back to the element that opened it when it closes.
- Has `role="dialog"`, `aria-modal="true"` and `aria-labelledby={titleId}`, so the pop-up is named after its heading.
- Shows `footer` on the left of the footer row and **Cerrar** on the right.
- Reduced motion: it appears at once.

The motion values live in `src/presentation/ui/motion.ts` (`sheetMotion`, `shouldDismiss`, the
timings and easing). Change them there, never inside one pop-up, so every pop-up changes together.

## How to build one

1. The opening control is a button with `aria-haspopup="dialog"` whose `onClick` sets the item to show.
2. Keep the item in the parent's state. Render the pop-up inside `AnimatePresence`, or the exit animation does not run:

   ```tsx
   <AnimatePresence>
     {opened && <OrderDialog key={opened.id} order={opened} onClose={() => setOpenId(null)} />}
   </AnimatePresence>
   ```

3. Inside the pop-up component: `const titleId = useId()`, then `<Sheet titleId={titleId} onClose={onClose} footer={...}>`
   and a heading `<h2 id={titleId}>` as the first child. Put the body as children.
4. Do not add your own overlay, portal, Escape listener, drag handler, close button or focus code. If the shell
   lacks something a pop-up needs, change `Sheet.tsx` so every pop-up gets it.
5. Labels are in Spanish (`Cerrar`, not `Close`). Keep the body short.

Not for: the phone menu (`menuMotion`, a circle that grows out of the hamburger) and the sign-in card
(its own motion in `motion.ts`). Those are not pop-ups.

## Tests

Copy the pattern in `DeliveryDetailDialog.test.tsx` and `SoldOutDialog.test.tsx`:

- **Real timers.** Do not call `vi.useFakeTimers` in a file with a pop-up close test. The exit animation runs on the real frame clock. If the file already fakes timers (as `KitchenPage.test.tsx` does), put the close test in its own file.
- Opening shows the dialog by its name (`findByRole('dialog', { name })`).
- Closing with **Cerrar** removes the dialog (`waitFor`) and focus returns to the opening button.
- Escape closes it.
- A pop-up whose content depends on data has a test for the empty state.

## Checks before reporting done

- `npm run check` passes: typecheck, lint, tests, the coverage gate (98% on statements, branches, functions and lines) and the build.
- Visual change: check at 390, 1024, 1500 and 1920 px, as RULE-FE-0001 requires. No horizontal scroll, no text outside the sheet.
