# Shared facts (authoritative)

Each fact carries its source tag.

- Project: restaurant app with landing and menu, staff dashboard, and takeaway PWA. [user]
- MS-1 landing and menu page. Owner unknown (user). Date unknown (user). [user]
- MS-2 restaurant dashboard (insights, workers, stock and more). Owner unknown (user). Forecast 2027-02-05, whole dashboard. Not a baseline. [user]
- MS-3 takeaway delivery PWA. Owner unknown (user). Date unknown (user). [user]
- Login is staff-only. Owner account pre-defined in the database. [user]
- Login is reachable only via invitation link. [user]
- Invitation links expire after 7 days. [user]
- Login uses email and password. [user]
- WP-1 backend auth: owner Kai Backend. Date unknown. [user]
- WP-2 auth view page: owner Kai Frontend. Date unknown. [user]
- DEP-1: WP-2 depends on WP-1. [calc]
- WP-3 secure environment: owner DevOps, name unknown. [user]
- DBA owner: unknown (ISS-5). [user]
- Repo is not a git repository. [calc: no .git found in project folder]
- Full brief: [BRIEF.md](../../BRIEF.md)
