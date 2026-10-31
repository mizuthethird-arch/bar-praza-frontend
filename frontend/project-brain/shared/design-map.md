# Design map (grows from human verdicts)

The written standard that uses these values: frontend/docs/design-standard.md (sections 1–9).

Each entry: value, used in, approved or provisional, verdict date. Provisional entries may be applied but must be flagged when applied.

### Dark base (page and cards)
- value: page bg-neutral-950, text-neutral-100, font-mono; card bg-neutral-900 border-neutral-800 rounded-xl p-5
- used in: AppShell, all panel pages, neutral kitchen cards, Column cards
- approved: yes — verdict: an all-black variant was rejected ("go back"), original date UNKNOWN; reconfirmed 2026-10-31 (D-FE-01)

### Alert (late) — red
- value: card border-red-900 bg-red-950/40; badge bg-red-900 text-red-100; note text-red-300
- used in: late order card, Retrasado badge, low-stock/alert notes
- approved: yes — 2026-10-31 (user: late order is red)

### Ready (Listos) — sky blue
- value: card border-sky-900 bg-sky-950/40; badge bg-sky-900 text-sky-100; text sky-300
- used in: Listos cards
- approved: yes — 2026-10-31 (human: ready cards blue, matching the palette)

### Delivered history cards — grey with green border
- value: card border-emerald-900 bg-neutral-900; time text emerald-300
- used in: compact delivered cards
- approved: yes — 2026-10-31 (human: only the total card is fully green)

### Total cobrado — green (the only fully green card)
- value: border-emerald-900 bg-emerald-950/40; amount text-emerald-300
- used in: history total card
- approved: yes — 2026-10-31

### Deliver button — sky
- value: bg-sky-700 text-white hover:bg-sky-600 (deliverButton)
- used in: "Entregado y cobrado" (sky, like Listos)
- approved: yes — 2026-10-31 (human: the button too; contrast white on sky-700 5.86:1)

### Success button — green
- value: bg-emerald-700 text-white hover:bg-emerald-600 (successButton)
- used in: "Entregado y cobrado"
- approved: yes — 2026-10-31 (user: green). Contrast not yet calculated (open, see history §4).

### Column title
- value: h2 text-lg font-semibold, min-height 3.5rem, items aligned to end, count badge bg-white text-black
- used in: all four kitchen columns
- approved: yes — 2026-10-31 ("el título está perfecto")

### Kitchen card size
- value: min-height 24rem, height auto, width 100 % of column
- used in: order cards
- approved: yes — 2026-10-31

### Delivered card size
- value: compact, about 66 px tall, width 100 %
- used in: delivered cards
- approved: yes — 2026-10-31

### Column breakpoints
- value: 1 column < 768 px; 2 columns from md (768 px); history spans 2 columns; 4 columns from 2xl (1536 px)
- used in: /cocina
- approved: yes — 2026-10-31 (Q1 yes)

### Primary button — neutral
- value: bg-neutral-100 text-neutral-950 hover:bg-white (primaryButton)
- used in: Pedidos, Carta, Horario, Kitchen actions
- approved: provisional — first applied on the panel views; no explicit verdict on the kitchen buttons

### Pop-up dialog (phone bottom sheet)
- value: overlay bg-black/70; sheet bg-neutral-950 border-neutral-700 rounded-t-2xl (md: rounded-xl); grab handle bg-neutral-600; sheet rises on a spring, closes by drag (120 px or 600 px/s) or button or Escape
- used in: DeliveryDetailDialog
- approved: grey border approved 2026-10-31 (human Q1). Bottom sheet with spring and drag-to-close requested 2026-10-31; awaiting the human's look on a real phone.
