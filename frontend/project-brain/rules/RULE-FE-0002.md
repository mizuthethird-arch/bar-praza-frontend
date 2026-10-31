---
id: RULE-FE-0002
title: Use the app's palette, font and page layout on every screen
category: design
scope: project
owner: Kai (proposed; human approves)
status: draft
priority: 70
created: 2026-10-31
supersedes: null
applies_to: [frontend]
---

## Statement
Screens use Tailwind palette colours (neutral, red, emerald), the app font (no serif headings), and the shared Page layout with one h1.

## Rationale
The /cocina screen used custom hex colours and a serif font and was rejected by the human on 2026-10-31 (ATTEMPT-0001).

## Check
- kind: command
  run: `npm test` (src/design-guidelines.test.ts)
- kind: visual
  verify: "Screenshot compared with shared/design-map.md approved entries (not yet automated)"

## Exceptions
None recorded.

## Related
[[RULE-FE-0001]]
