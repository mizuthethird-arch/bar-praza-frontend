# Failed attempts (read before proposing any approach)

## ATTEMPT-0001 — 2026-10-31
- Goal: restyle /cocina to the first reference image.
- Tried: light cream palette, custom hex values, serif headings, its own header.
- Why rejected: human, 2026-10-31: "not following the design guidelines of the rest of the app".
- Do not retry: custom hex colours or serif headings on any screen.
- What worked instead: palette classes and the shared Page layout with the sidebar.
- Related rule: RULE-FE-0002
- Stale: no

## ATTEMPT-0002 — earlier session (date UNKNOWN)
- Goal: an all-black background.
- Tried: pure black page.
- Why rejected: human: "Naaa, go back".
- Do not retry: all-black background.
- What worked instead: neutral-950 page with neutral-900 cards.
- Stale: no

## ATTEMPT-0003 — 2026-10-31
- Goal: a card with a colour on the shared shell.
- Tried: neutral border and background in the shell plus red or green tone classes.
- Why rejected: conflicting classes; the winner depends on CSS order (found in review).
- Do not retry: colour classes on the shared shell.
- What worked instead: neutral shell; tone classes per card.
- Stale: no

## ATTEMPT-0004 — earlier session (date UNKNOWN)
- Goal: keep the phone layout checks green.
- Tried: overflow-x-hidden on the content wrapper, then a check on scrollWidth.
- Why rejected: the hidden overflow never showed up, so the checks passed while the page overflowed.
- Do not retry: hiding overflow to pass a check.
- What worked instead: element-bounds check (every element's right edge against its card and the viewport).
- Related rule: RULE-FE-0001
- Stale: no

## ATTEMPT-0005 — 2026-10-31
- Goal: four kitchen columns from xl (1280 px).
- Tried: xl:grid-cols-4.
- Why rejected: at 1280–1535 px the buttons wrapped to three lines (seen at 1500 px).
- Do not retry: four columns below 1536 px.
- What worked instead: four columns from 2xl (human agreed, Q1 yes).
- Stale: no

## ATTEMPT-0006 — 2026-10-31
- Goal: fit two buttons side by side in order cards.
- Tried: nowrap buttons in a row inside 250 px cards.
- Why rejected: "Cancelar" overflowed the card at 1920 px.
- Do not retry: side-by-side buttons inside narrow cards.
- What worked instead: full-width buttons, stacked (human request, 2026-10-31).
- Stale: no

## ATTEMPT-0007 — 2026-10-31
- Goal: fixed-height cards with inner scroll.
- Tried: h-96 and overflow-y-auto on the item list.
- Why rejected: human asked for cards that grow with content, minimum height shared.
- Do not retry: fixed height with inner scroll.
- What worked instead: min-h-[24rem] h-auto.
- Stale: no

## ATTEMPT-0008 — 2026-10-31
- Goal: history as list rows.
- Tried: a list in a side panel.
- Why rejected: human asked for cards in the same format as the others.
- Do not retry: list rows for delivered orders.
- What worked instead: compact green cards (human request, 2026-10-31).
- Stale: no

## ATTEMPT-0009 — 2026-10-31
- Goal: equal-height cards with motion wrappers.
- Tried: motion wrapper divs without h-full.
- Why rejected (earlier session): broke equal-height grids.
- What worked instead: h-full [&>section]:h-full on the motion wrapper (Schedule page).
- Stale: no
