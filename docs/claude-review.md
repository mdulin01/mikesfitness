# Claude review — issue #1

Claude Code performed a read-only static review on 2026-10-25, initially reporting
no blocking findings, with three medium and five low observations. The review did
not run tests or authenticate to Firebase. Codex addressed the findings as follows:

1. Plan inputs buffer locally and save once on blur/Enter. Failed writes show a
   message and retain the draft; block field edits merge against fresh data.
2. New logs retain per-exercise technique/deload phases. Progression prefers the
   latest normal working load and avoids repeated reductions if no normal load
   exists. Historical display/PR readers keep their prior semantics.
3. Pre-rollout regeneration is disabled with a specific explanation. The guarded
   write policy still preserves existing legacy weeks until the release gate.
4. The handoff and rollout documentation now explicitly describe replacement of
   day-level edits in eligible unstarted legacy weeks.
5. The shared bench range is restored to 8–12; only the new program uses the 6–10
   range from the source program. Existing plan/history readers are unchanged.
6. Zone 2 selects the bike; strength selection respects the viewed week's A/B
   order and deload phase. Re-selecting Strength retains an existing strength day.
7. Wood chopper remains 10 per side, with +5 lb after every planned set reaches
   10, as requested by issue #1's fixed rep target and all-at-top progression rule.
   This observation does not require a different progression rule.
8. Saving a different cardio type reports it as an extra workout and explains
   that the selected planned session remains on the plan.

Validation after the fixes: 27 unit tests and 34 desktop/phone browser checks pass;
lint, build and diff checks pass. Browser coverage includes a delayed save, typing
135 without losing digits, a failed save retaining its draft, a date move, and the
disabled pre-release regenerate button. Live Firebase authorization is unverified.

Claude's first follow-up found no blocking or medium issues and four smaller
editing/history observations. Additional fixes give new blocks stable IDs, merge
all block mutations against fresh snapshots, reject edits to changed exercises,
key field buffers by week/exercise, keep successful drafts until the snapshot
catches up, and use normal working-load anchors for exercises added in Train.
Tests now cover both orders of concurrent weight/remove operations, stale block
identities, a failed draft across week navigation, and delayed snapshot delivery.
Final targeted static review: Claude reported, "I found nothing left to fix in
the reviewed changes." This is a source-review result, not a live verification.
Codex ran the tests/browser checks listed above. iOS Safari blur behavior and
live Firebase permissions/listener delivery remain unverified.
