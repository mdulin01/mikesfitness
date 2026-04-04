# Mike's Fitness

## Overview

Personal health and fitness tracker for Mike. Dashboard with health metrics, workout tracking with weekly checkoffs, medical appointment management, lab results, medications, and a 10-year health plan reference. Shares fitness data with mikeandadam via the same Firebase project.

## Key URLs & Resources

| Resource | URL |
|----------|-----|
| **Live Site** | https://mikesfitness.app (not yet deployed) |
| **GitHub** | TBD (repo not yet created) |

## Technical Stack

- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Backend/Database:** Firebase (Firestore, Authentication) — shared project with mikeandadam
- **Deployment:** Vercel (planned)
- **Version Control:** GitHub (mdulin01, repo TBD)

## Infrastructure

- **Firebase Project ID:** trip-planner-5cc84 (shared with mikeandadam)
- **Firebase Storage Bucket:** `gs://trip-planner-5cc84.firebasestorage.app`
- **Firestore Collection:** `mikesfitness` (health-specific data)
- **Auth:** Google sign-in, restricted to mdulin@gmail.com

## Project Structure

```
mikesfitness/
├── src/
│   ├── App.jsx                  # Main app with auth + section routing
│   ├── main.jsx                 # Entry point
│   ├── index.css                # Tailwind + global styles
│   ├── constants.js             # Sections, appointment types, lab categories
│   ├── firebase-config.js       # Firebase init (shared project)
│   ├── components/
│   │   ├── LoginScreen.jsx      # Google auth login
│   │   └── Nav.jsx              # Desktop top nav + mobile bottom nav
│   ├── hooks/
│   │   ├── useAuth.js           # Auth state + Google sign-in
│   │   └── useHealthData.js     # Firestore CRUD for all health data
│   ├── pages/
│   │   ├── Dashboard.jsx        # Daily checklist, stats, weekly overview, upcoming appointments
│   │   ├── Training.jsx         # Weekly workout schedule, workout details, cardio plans
│   │   ├── Health.jsx           # Weight tracking, lab results, medications, sleep
│   │   ├── Appointments.jsx     # Medical appointments (scheduled, needs-scheduling, past)
│   │   └── Plan.jsx             # 10-year health plan reference
│   └── data/
│       ├── healthPlan.js        # 10-year plan: risks, meds, labs, goals
│       └── exercisePlan.js      # Weekly schedule, workouts A/B, cardio, targets
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## Key Features

- **Dashboard**: Daily checklist (workout, steps, mobility, water, sleep), weekly workout progress, upcoming appointments, race calendar
- **Training**: Weekly exercise schedule with day-by-day checkoffs, Workout A/B details, Zone 2 cardio and VO2 Max interval plans, race countdowns (half marathon, triathlon)
- **Health**: Weight/waist tracking, lab results with history, medication stack reference, sleep goals
- **Appointments**: Upcoming scheduled, needs-scheduling alerts (cardiology, dentist, dermatology), past appointments
- **10-Year Plan**: Full reference of the prevention plan (risks, meds, labs, exercise, diet, weight, sleep, outcomes)

## Data Model

Single Firestore document at `mikesfitness/mike-health` containing:
- `weightEntries[]` — date, weight, waist, notes
- `labResults[]` — date, marker, value, unit, notes
- `appointments[]` — type, doctor, date, time, location, status
- `trainingEvents[]` — race events (half marathon, triathlon)
- `weeklyCompletions{}` — `{ '2026-W14': { monday: true, ... } }`
- `dailyChecklist{}` — `{ '2026-04-04': { steps: true, mobility: true, ... } }`

## Important Notes

- Uses same Firebase project as mikeandadam (trip-planner-5cc84)
- All Firestore writes use `stripUndefined()` pattern (JSON round-trip) to avoid Firestore errors
- Auth restricted to `mdulin@gmail.com` only
- Pre-loaded with GI appointment (May 18) and Primary Care (Jul 17)
- Cardiology, dentist, and dermatology marked as "needs scheduling"

## Dev Commands

```bash
npm run dev      # Dev server (localhost:5174)
npm run build    # Production build
npm run preview  # Preview production build
```

## Cross-Project Learning Log

A shared learning file lives at `../learning.md` (one level up in the Coding-Projects root). **Read it at session start.** Write new learnings to it before session end, at compaction, and roughly every 30 minutes of active work. Entries should include date, project name, and a concise actionable lesson.

## File Scope Boundary

**CRITICAL: When working on this project, ONLY access files within the `mikesfitness/` directory.** Do not read, write, or reference files from any sibling project folder. If you need something from another project, stop and ask first.
