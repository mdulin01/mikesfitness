# Mike's Fitness

## Overview

Mike's personal fitness and performance app: weekly training plans, set-by-set logging,
progression, PRs, readiness, Apple Health metrics, and triathlon planning. Mike-only
training belongs here; mikeandadam remains the home for joint plans.

Read this file, then the newest entry in docs/HANDOFF.md. The training rollout and
verification instructions are in [docs/training-template.md](docs/training-template.md).

Mike's cross-project notes are in his vault at `~/Dropbox (Personal)/Vault`. When asked
about priorities or what Mike decided, read `01-Week/` (newest note) and `05-Health/NOW.md`
there. This repo may hold Mike's own health data; that is appropriate here. Use synthetic
data in tests and screenshots, and never copy his health data into unrelated repos.

## URLs and stack

- Live site: https://mikesfitness.vercel.app
- GitHub: https://github.com/mdulin01/mikesfitness
- React 19, Vite 8, Tailwind 4, Firebase Auth and Firestore; deployed on Vercel.
- Firebase project: `trip-planner-5cc84` (shared with mikeandadam).
- Storage bucket: `gs://trip-planner-5cc84.firebasestorage.app`.
- Google sign-in is restricted to Mike's authorized account.
- Never commit credentials or environment files. Never ask for secret values; point
  Mike to the relevant Vercel or Firebase settings.

## Project structure

```text
src/
  App.jsx                    Authentication and page routing
  pages/
    Dashboard.jsx            Readiness, today's sessions, weekly totals, streaks, PRs
    Train.jsx                Strength/cardio/mobility loggers and in-progress drafts
    PlanWeek.jsx             Editable weekly plans, exercise swaps, protected regeneration
    Progress.jsx             Exercise trends, pillar minutes, body composition
    Triathlon.jsx            Current tri plan, off-season base, next race, history
  data/
    programTemplate.js       Two required strength sessions + optional third and endurance
    legacyProgramTemplate.js Pre-rollout template for earlier weeks
    exercises.js             Stable exercise IDs, rep ranges, units and increments
    triathlonPlan.js          Wrightsville plan (preserved)
  hooks/
    useTraining.js           Plan/session transactions, progression, next-race settings
    useHealthData.js         Existing health, metrics and shared fitness subscriptions
  utils/
    training.js              Pure history, progression, summaries and streaks
    planRollout.js            Merge-date gate and transaction write policy
    triathlon.js              Active-plan selection and next-race validation
    dateUtils.js             Local-calendar helpers
functions/                   Existing Apple Health ingest (separate deployment)
tests/                       Synthetic unit tests and isolated browser fixture
```

## Data and safety

- `fitnessPlans/{weekStart}`: saved weekly plans. Multiple sessions can share a date;
  array indexes and stable session IDs link logs to the correct session.
- `fitnessSessions`: logged strength/cardio/mobility sessions. Historical data and
  legacy `exerciseLog` continue to feed progression and PRs without migration.
- `mikesfitness/training-settings`: Mike-only next race (`name`, `date`, `distance`).
- `mikesfitness/coach`: Rupert's note; `mikesfitness/mike-health`: existing health data.
- `tripData/fitness`: shared events and archived tri plans; preserve Wrightsville history.
- Use local calendar dates (`toLocalDateStr`), never a UTC timestamp slice for “today”.
- Plan seeding/re-seeding checks fresh data inside a Firestore transaction. A completed
  day protects the **entire week**; past weeks are never seeded or regenerated.
- At release set `VITE_TRAINING_TEMPLATE_EFFECTIVE_DATE` to the actual merge date
  (`YYYY-MM-DD`) in Vercel Production. Without a valid date the old template remains
  active. Keep this date fixed across later builds. Only weeks starting on/after it
  can receive the new template; never rewrite a started week.
- Draft PR only for issue #1. Claude reviews before a separately authorized merge or
  deployment. Automatic Git deployments are disabled for `codex/two-day-training`.

## Commands

```sh
npm ci
npm test
npm run lint
npm run build
npm run dev -- --host 127.0.0.1
```

The development fixture at `/tests/preview/index.html` renders real pages with
synthetic in-memory data; it is not included in the production build.

## Cross-project learning log

Read `../learning.md` if present; add concise implementation lessons before finishing.

## File scope

Work inside this repository. The referenced vault training program/template and
shared learning log are authorized context for this task. Do not modify sibling apps.
