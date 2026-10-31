---
id: RULE-FE-0001
title: Check responsive layout before declaring a visual change done
category: responsive
scope: role
owner: Kai
status: active
priority: 80
created: 2026-10-31
supersedes: null
applies_to: [frontend]
---

## Statement
Every visual change is checked at 390, 1024, 1500 and 1920 px before it is reported done: no horizontal page overflow, no element outside its card or column, and no button label broken across lines.

## Rationale
Earlier phone overflow was missed because overflow was hidden by a container (see memory/failed-attempts.md, ATTEMPT-0004). The 1920 px spill and the 1280–1535 px wrapping were found only in the browser (2026-10-31).

## Check
- kind: command
  run: `npm test` (src/design-guidelines.test.ts and screen tests)
- kind: assertion
  verify: "No element is wider than its parent card; button labels are one line"
- kind: manual
  verify: "Open /cocina at 390, 1024, 1500 and 1920 px; measure with getBoundingClientRect; record the widths and the result in the report"

## Exceptions
Screens with no visual change.

## Related
[[RULE-FE-0002]]
