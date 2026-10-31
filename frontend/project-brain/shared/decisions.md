# Decisions (authoritative)

- D-FE-01 2026-10-31 [user]: /cocina keeps the dark app line; the light cream reference is not adopted. Rejected: light cream palette with serif headings.
- D-FE-02 2026-10-31 [user]: Kitchen columns are Nuevos | En curso | Listos | Entregados y cobrados.
- D-FE-03 2026-10-31 [user]: Four columns from 2xl (1536 px); mobile-first.
- D-FE-04 2026-10-31 [user]: Order cards: min height 24rem, grow with content, no inner scroll, buttons full width stacked.
- D-FE-05 2026-10-31 [user]: Delivered orders: compact green card; details in a pop-up (React portal, no new library).
- D-FE-06 2026-10-31 [user]: Consola en vivo is unchanged; /cocina is a separate screen.
- D-FE-07 2026-10-31 [user]: Session survives reloads (sessionStorage) in the mock.
- D-FE-08 2026-10-31 [user]: Kai's brain stays separate at frontend/project-brain/ (not shared with the PM brain).
- D-FE-09 2026-10-31 [user request]: Design standard written at frontend/docs/design-standard.md; it is the reference for colours, buttons, type, shapes, sizes and motion.
- D-FE-10 2026-10-31 [user request]: Pop-up opens with motion (first version: fade and scale 0.96).
- D-FE-11 2026-10-31 [user]: Pop-up border is grey (neutral-700). Q1 answered.
- D-FE-13 2026-10-31 [user Q1]: Muted text is neutral-400; neutral-500 text removed (fails AA).
- D-FE-16 2026-10-31 [user Q1]: Listos and the "Entregado y cobrado" button are sky (not blue, not green). successButton renamed deliverButton.
- D-FE-15 2026-10-31 [user]: Listos cards are sky (not blue, not green). Delivered cards are grey with a green border; only the total card is fully green.
- D-FE-14 2026-10-31 [user Q2]: Visible focus ring: neutral-100, 2px, global on :focus-visible.
- D-FE-12 2026-10-31 [user request]: Pop-up becomes a phone bottom sheet: spring rise, grab handle, drag down to close (120 px or 600 px/s); centred from md.
