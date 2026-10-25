# Two-day strength and off-season training

The program alternates A–B–A and B–A–B. Only the first two strength sessions are
required. Lower-body movements come first, followed by the familiar upper-body
lifts. Strength B has a DB-row alternative for home training and plank/dead-bug
options. Kettlebell deadlifts occupy weeks 1–3; swings become available in week 4
with deadlifts retained as an alternative.

Monday includes strength and a technique/aerobic swim; Tuesday is Z2 bike;
Wednesday is strength; Thursday includes the CSS/threshold swim and easy run;
Friday's strength is optional; Saturday alternates long bike/run; Sunday is
mobility/recovery. PlanWeek can move sessions within the week. Train has a
session selector on days with two sessions and logs each to its own plan entry.

Weeks 1–2 flag squat/RDL/lunge as technique work with light-load guidance. Every
fifth program week uses two sets at about 70% of the last working load. Other
weeks add 5 lb after all planned sets hit the top of the rep range; lateral raises
add 2.5 lb. New logs retain planned set counts even if fewer sets were completed;
legacy logs retain their prior interpretation. Bodyweight/time exercises do not
automatically receive a weight increase.

New logged exercises retain their technique/deload phase. Progression uses the
latest normal working load when available, so a reduced week does not reset the
working weight. With only reduced-load history, it uses that load without reducing
it again. History and PR readers are unchanged. The new plan's bench range is
6–10; the shared library and legacy plans retain their previous 8–12 range.

Plan fields keep typed edits locally and commit on blur (or Enter). Save failures
show a message and retain the typed value. Zone 2 selects the bike session; new
strength blocks use the viewed week's A/B order and phase.

Optional sessions never increase required weekly strength above two and never
count as missed. An optional-only day without activity is neutral for the move
streak (it neither adds to nor breaks it). Completed optional sessions still count
as real training. Existing weekly activity streaks continue to count four sessions.

## Release gate and saved weeks

The actual merge date cannot be known in a draft branch. Before the separately
authorized production release, set the **non-secret** Vercel Production variable
`VITE_TRAINING_TEMPLATE_EFFECTIVE_DATE` to the actual merge date (`YYYY-MM-DD`).
Keep that original date for later builds; Vite embeds it at build time. Unset,
invalid, or future dates keep the legacy template active. No production setting
is changed by this PR.

Only Monday week starts on/after that date use the new template. A midweek merge
therefore starts with the next Monday. Program week 1 is that first eligible
Monday; phases follow calendar weeks. A plan already saved as v2 is not regenerated
on every visit.

The policy is checked against a fresh Firestore transaction snapshot. **Any done
session preserves the entire week**, even if it is a future week; past weeks are
never written. An existing pre-rollout current week is kept unchanged. Eligible,
unstarted old-template weeks migrate when opened; week-level notes are retained.
Manual regeneration uses the same protection. The old template remains in source
for pre-rollout current weeks that have not previously been saved.
Regeneration is disabled with an explanation for pre-rollout weeks. Migration of
an eligible unstarted legacy week replaces its day-level edits (including skips,
exercise additions and changed session types); week-level notes remain. A week
with any completed session is always preserved in full.

## Triathlon

When no tri plan covers today, Triathlon shows Off-season base: two swims, one
bike, one run and two strength sessions per week, plus the long day and recovery.
The next-race form saves name/date/distance under `mikesfitness/training-settings`,
not the shared couple plan. Wrightsville remains in the expandable history.
An active current triathlon plan still opens normally, including plans other than
Wrightsville.

## Verification

```sh
npm test
TZ=America/New_York npm test
npm run lint
npm run build
git diff --check
```

`tests/preview/index.html` is an isolated Vite development entry. It uses the actual
PlanWeek, Train and Triathlon components with synthetic in-memory stores and never
imports Firebase. Browser checks cover desktop/phone overflow, session selection,
exercise substitution, optional skips, race save, the history accordion, and
saving a swim without completing the strength session on the same date.
Screenshots in `docs/screenshots/` use only this fixture. Live Firestore/authentication
and a production deployment are not exercised by the draft PR.

After review and release, the vault's training/program.md can become a pointer to
the live app. It remains unchanged while this PR is a draft.
