# Handoff

## 2026-10-25 — Issue #1: strength + off-season training

Implemented two required alternating A/B sessions, optional third strength, the
endurance schedule, technique/deload progression, optional-day accounting, and
protected transactional re-seeding. PlanWeek and Train support multiple sessions
on a date. Triathlon now has an off-season state, a next-race form saved to Mike's
own settings, and the preserved Wrightsville archive.

Release setting: `VITE_TRAINING_TEMPLATE_EFFECTIVE_DATE` must be the actual merge
date in Vercel Production and must remain fixed afterward. Without it, seeding
uses the old template. No production data/settings were changed.

Validation: 20 unit tests, 16 desktop/phone browser checks, lint, build, and
`git diff --check` pass. The four screenshots use synthetic data. No live Firebase
writes or deployment were performed. Vite still reports the existing large-bundle warning.

Claude review is pending: the read-only Claude Code review attempt failed with
"OAuth session expired and could not be refreshed". Run `claude auth login`
locally, then have Claude review the branch before merge. Do not share tokens.

Draft PR only. See training-template.md for behavior and verification.
The vault source program is not replaced with an app pointer before release.
