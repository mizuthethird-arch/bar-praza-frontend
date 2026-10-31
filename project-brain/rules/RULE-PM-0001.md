---
id: RULE-PM-0001
title: Gate authorized only by the exact token [continue]
scope: role
owner: PM
status: active
priority: 10
created: 2026-10-31
supersedes: null
applies_to: [project-management, gates]
---

## Statement
A gate (G1–G4) is authorized only when the user's entire message is `[continue]` (lowercase, brackets included, surrounding whitespace allowed) and it replies to a message whose last line is a WAITING line naming that gate. Any other reply, including "ok", "yes" or "go ahead", is feedback.

## Rationale
Baselines, change approvals, phase changes and closure are commitments. A loose "yes" is not enough. Source: AGENTS.md R6 and L4.

## Check
Before acting on a gate, confirm: (a) the previous message's last line is `WAITING: G#`, and (b) the user's reply equals `[continue]` after trimming whitespace. If either fails, do not act; emit feedback.

## Exceptions
none

## Related
[[RULE-PM-0002]] (not yet created)
