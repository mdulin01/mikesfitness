// Wrightsville Beach Sprint Triathlon training plan (Mike-only).
// Race: Sunday 2026-09-27 — 1500m ocean swim + ~12 mi sprint bike + 5K run.
// Note: 1500m is technically Olympic-distance swim; this plan handles it as such.
//
// This plan stores ONLY bike + swim sessions. Running workouts come from
// whichever shared running plan (Cary 10K, Greensboro Half) is active by date —
// rendered together with this plan in the Dashboard's "This Week" widget.
//
// Phases:
//   Phase 1 — Base       (Weeks 1-6,  May 10 → Jun 20):  form + base aerobic
//   Phase 2 — Build      (Weeks 7-12, Jun 21 → Aug 1):   add intensity, longer rides
//   Phase 3 — Peak       (Weeks 13-18, Aug 2 → Sep 12):  race-distance work + open water
//   Phase 4 — Taper      (Weeks 19-20, Sep 13 → Sep 27): cut volume, race
//
// Workout shape (consistent with mikeandadam's plan structure):
//   { id, label, distance, mike: false, notes }
// Marked done by toggling `mike: true` and persisted to Firestore via the
// shared `tripData/fitness` doc.

export const wrightsvilleTriPlan = [
  // ============================================================================
  // PHASE 1 — BASE (Weeks 1-6)
  // Re-introduce swim/bike after the Indy Half. Easy aerobic + form work.
  // ============================================================================
  { weekNumber: 1, startDate: '2026-05-10', endDate: '2026-05-16', phase: 'base',
    bikes: [
      { id: 1, label: 'Easy Bike', distance: '8 mi', duration: '30 min', mike: false, notes: 'Spin, Z2 effort, get the legs back' },
    ],
    swims: [
      { id: 1, label: 'Form Swim', distance: '800 yds', mike: false, notes: 'Drills: catch-up, fingertip drag, bilateral breathing' },
      { id: 2, label: 'Endurance Swim', distance: '1000 yds', mike: false, notes: 'Continuous, comfortable pace' },
    ],
    totalSwimYds: 1800, totalBikeMi: 8,
    weekNotes: '🏊 Phase 1 begins — base + form. Recovery from Indy Half is priority.',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 2, startDate: '2026-05-17', endDate: '2026-05-23', phase: 'base',
    bikes: [
      { id: 1, label: 'Easy Bike', distance: '10 mi', duration: '40 min', mike: false, notes: 'Z2' },
      { id: 2, label: 'Spin Class or Indoor', distance: '8 mi', duration: '30 min', mike: false, notes: 'Optional cross' },
    ],
    swims: [
      { id: 1, label: 'Form Swim', distance: '1000 yds', mike: false, notes: '' },
      { id: 2, label: 'Endurance Swim', distance: '1200 yds', mike: false, notes: '' },
    ],
    totalSwimYds: 2200, totalBikeMi: 18,
    weekNotes: '',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 3, startDate: '2026-05-24', endDate: '2026-05-30', phase: 'base',
    bikes: [
      { id: 1, label: 'Easy Bike', distance: '12 mi', duration: '45 min', mike: false, notes: 'Add some rolling hills' },
      { id: 2, label: 'Tempo Bike', distance: '10 mi', duration: '35 min', mike: false, notes: '5 × 1min hard / 2min easy intervals' },
    ],
    swims: [
      { id: 1, label: 'Form Swim', distance: '1000 yds', mike: false, notes: '' },
      { id: 2, label: 'Endurance Swim', distance: '1200 yds', mike: false, notes: '' },
      { id: 3, label: 'Long Swim', distance: '1500 yds', mike: false, notes: 'Hit race distance once' },
    ],
    totalSwimYds: 3700, totalBikeMi: 22,
    weekNotes: '',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 4, startDate: '2026-05-31', endDate: '2026-06-06', phase: 'base',
    bikes: [
      { id: 1, label: 'Easy Bike', distance: '12 mi', duration: '45 min', mike: false, notes: '' },
      { id: 2, label: 'Long Bike', distance: '15 mi', duration: '60 min', mike: false, notes: 'Steady Z2' },
    ],
    swims: [
      { id: 1, label: 'Form + Drill Swim', distance: '1000 yds', mike: false, notes: '' },
      { id: 2, label: 'Threshold Swim', distance: '1200 yds', mike: false, notes: '4 × 100yd hard / 30s rest' },
      { id: 3, label: 'Long Swim', distance: '1500 yds', mike: false, notes: '' },
    ],
    totalSwimYds: 3700, totalBikeMi: 27,
    weekNotes: '',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 5, startDate: '2026-06-07', endDate: '2026-06-13', phase: 'base',
    bikes: [
      { id: 1, label: 'Tempo Bike', distance: '12 mi', duration: '45 min', mike: false, notes: '6 × 1min hard / 2min easy' },
      { id: 2, label: 'Long Bike', distance: '18 mi', duration: '70 min', mike: false, notes: '' },
    ],
    swims: [
      { id: 1, label: 'Form Swim', distance: '1000 yds', mike: false, notes: '' },
      { id: 2, label: 'Threshold Swim', distance: '1500 yds', mike: false, notes: '5 × 200yd at race pace' },
      { id: 3, label: 'Long Swim', distance: '1800 yds', mike: false, notes: 'Past race distance' },
    ],
    totalSwimYds: 4300, totalBikeMi: 30,
    weekNotes: '',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 6, startDate: '2026-06-14', endDate: '2026-06-20', phase: 'base',
    bikes: [
      { id: 1, label: 'Easy Bike', distance: '12 mi', duration: '45 min', mike: false, notes: 'Recovery week — keep effort low' },
      { id: 2, label: 'Brick (Bike + Run)', distance: '10 mi bike + 1 mi run', duration: '50 min', mike: false, notes: 'First brick! Run off the bike — legs will feel weird, that\'s the point' },
    ],
    swims: [
      { id: 1, label: 'Form Swim', distance: '1000 yds', mike: false, notes: '' },
      { id: 2, label: 'Endurance Swim', distance: '1500 yds', mike: false, notes: '' },
    ],
    totalSwimYds: 2500, totalBikeMi: 22,
    weekNotes: '🟢 Recovery week — drop volume, then build into Phase 2',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  // ============================================================================
  // PHASE 2 — BUILD (Weeks 7-12, Jun 21 → Aug 1)
  // Add intensity, longer rides, brick sessions weekly. Cary 10K is week 9 (July 11).
  // ============================================================================
  { weekNumber: 7, startDate: '2026-06-21', endDate: '2026-06-27', phase: 'build',
    bikes: [
      { id: 1, label: 'Tempo Bike', distance: '15 mi', duration: '55 min', mike: false, notes: '8 × 1min hard / 2min easy' },
      { id: 2, label: 'Long Bike', distance: '20 mi', duration: '75 min', mike: false, notes: '' },
      { id: 3, label: 'Brick (Bike + Run)', distance: '12 mi bike + 1.5 mi run', duration: '60 min', mike: false, notes: '' },
    ],
    swims: [
      { id: 1, label: 'Threshold Swim', distance: '1500 yds', mike: false, notes: '6 × 200yd at race pace' },
      { id: 2, label: 'Long Swim', distance: '2000 yds', mike: false, notes: '' },
    ],
    totalSwimYds: 3500, totalBikeMi: 47,
    weekNotes: '🚴 Phase 2 begins — building intensity',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 8, startDate: '2026-06-28', endDate: '2026-07-04', phase: 'build',
    bikes: [
      { id: 1, label: 'Bike Intervals', distance: '15 mi', duration: '55 min', mike: false, notes: '5 × 3min hard / 2min easy' },
      { id: 2, label: 'Long Bike', distance: '22 mi', duration: '80 min', mike: false, notes: '' },
    ],
    swims: [
      { id: 1, label: 'Threshold Swim', distance: '1500 yds', mike: false, notes: '' },
      { id: 2, label: 'Long Swim', distance: '2000 yds', mike: false, notes: 'Open water if possible' },
      { id: 3, label: 'Recovery Swim', distance: '1000 yds', mike: false, notes: 'Easy form work' },
    ],
    totalSwimYds: 4500, totalBikeMi: 37,
    weekNotes: '🏖️ Cary 10K is next Saturday — keep tri volume modest',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 9, startDate: '2026-07-05', endDate: '2026-07-11', phase: 'build',
    bikes: [
      { id: 1, label: 'Easy Bike', distance: '10 mi', duration: '40 min', mike: false, notes: 'Light week — race Saturday' },
    ],
    swims: [
      { id: 1, label: 'Easy Swim', distance: '1000 yds', mike: false, notes: '' },
      { id: 2, label: 'Form Swim', distance: '1200 yds', mike: false, notes: '' },
    ],
    totalSwimYds: 2200, totalBikeMi: 10,
    weekNotes: '🏁 CARY 10K Saturday! Tri volume light all week',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 10, startDate: '2026-07-12', endDate: '2026-07-18', phase: 'build',
    bikes: [
      { id: 1, label: 'Easy Bike', distance: '15 mi', duration: '55 min', mike: false, notes: 'Recovery from 10K' },
      { id: 2, label: 'Long Bike', distance: '22 mi', duration: '80 min', mike: false, notes: '' },
      { id: 3, label: 'Brick (Bike + Run)', distance: '15 mi bike + 2 mi run', duration: '75 min', mike: false, notes: '' },
    ],
    swims: [
      { id: 1, label: 'Threshold Swim', distance: '1500 yds', mike: false, notes: '' },
      { id: 2, label: 'Long Swim', distance: '2200 yds', mike: false, notes: '' },
    ],
    totalSwimYds: 3700, totalBikeMi: 52,
    weekNotes: '',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 11, startDate: '2026-07-19', endDate: '2026-07-25', phase: 'build',
    bikes: [
      { id: 1, label: 'Bike Intervals', distance: '18 mi', duration: '70 min', mike: false, notes: '4 × 5min at threshold / 3min easy' },
      { id: 2, label: 'Long Bike', distance: '25 mi', duration: '95 min', mike: false, notes: '' },
      { id: 3, label: 'Brick (Bike + Run)', distance: '15 mi bike + 2.5 mi run', duration: '80 min', mike: false, notes: '' },
    ],
    swims: [
      { id: 1, label: 'Threshold Swim', distance: '1800 yds', mike: false, notes: '' },
      { id: 2, label: 'Open Water (if possible)', distance: '2000 yds', mike: false, notes: '🌊 Try lake or ocean swim — sighting practice' },
    ],
    totalSwimYds: 3800, totalBikeMi: 58,
    weekNotes: '',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 12, startDate: '2026-07-26', endDate: '2026-08-01', phase: 'build',
    bikes: [
      { id: 1, label: 'Easy Bike', distance: '12 mi', duration: '45 min', mike: false, notes: 'Recovery week' },
      { id: 2, label: 'Long Bike', distance: '20 mi', duration: '75 min', mike: false, notes: '' },
    ],
    swims: [
      { id: 1, label: 'Easy Swim', distance: '1500 yds', mike: false, notes: '' },
      { id: 2, label: 'Form Swim', distance: '1500 yds', mike: false, notes: '' },
    ],
    totalSwimYds: 3000, totalBikeMi: 32,
    weekNotes: '🟢 Recovery week — Phase 3 (peak) starts next week',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  // ============================================================================
  // PHASE 3 — PEAK (Weeks 13-18, Aug 2 → Sep 12)
  // Race-distance work + open water swims. Half marathon plan also starts now.
  // ============================================================================
  { weekNumber: 13, startDate: '2026-08-02', endDate: '2026-08-08', phase: 'peak',
    bikes: [
      { id: 1, label: 'Bike Intervals', distance: '20 mi', duration: '75 min', mike: false, notes: '5 × 4min at threshold' },
      { id: 2, label: 'Long Bike', distance: '28 mi', duration: '110 min', mike: false, notes: '' },
      { id: 3, label: 'Brick (Bike + Run)', distance: '15 mi bike + 3 mi run', duration: '90 min', mike: false, notes: '' },
    ],
    swims: [
      { id: 1, label: 'Threshold Swim', distance: '2000 yds', mike: false, notes: '' },
      { id: 2, label: 'Open Water', distance: '2000 yds', mike: false, notes: '🌊 Sighting + buoy turns practice' },
      { id: 3, label: 'Race-Pace Swim', distance: '1500 yds', mike: false, notes: 'Hit at race pace, time it' },
    ],
    totalSwimYds: 5500, totalBikeMi: 63,
    weekNotes: '⛰️ Phase 3 begins — peak training. Half marathon plan also starts.',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 14, startDate: '2026-08-09', endDate: '2026-08-15', phase: 'peak',
    bikes: [
      { id: 1, label: 'Bike Intervals', distance: '20 mi', duration: '75 min', mike: false, notes: '' },
      { id: 2, label: 'Long Bike', distance: '30 mi', duration: '120 min', mike: false, notes: '' },
      { id: 3, label: 'Brick (Bike + Run)', distance: '15 mi bike + 3 mi run', duration: '90 min', mike: false, notes: '' },
    ],
    swims: [
      { id: 1, label: 'Threshold Swim', distance: '2000 yds', mike: false, notes: '' },
      { id: 2, label: 'Open Water', distance: '2200 yds', mike: false, notes: '🌊' },
    ],
    totalSwimYds: 4200, totalBikeMi: 65,
    weekNotes: '',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 15, startDate: '2026-08-16', endDate: '2026-08-22', phase: 'peak',
    bikes: [
      { id: 1, label: 'Bike Intervals', distance: '22 mi', duration: '85 min', mike: false, notes: '' },
      { id: 2, label: 'Long Bike', distance: '32 mi', duration: '130 min', mike: false, notes: '' },
      { id: 3, label: 'Brick (Bike + Run)', distance: '18 mi bike + 3 mi run', duration: '100 min', mike: false, notes: '' },
    ],
    swims: [
      { id: 1, label: 'Threshold Swim', distance: '2000 yds', mike: false, notes: '' },
      { id: 2, label: 'Open Water — Race Sim', distance: '1500 yds', mike: false, notes: '🌊 Time it at race pace' },
      { id: 3, label: 'Recovery Swim', distance: '1200 yds', mike: false, notes: '' },
    ],
    totalSwimYds: 4700, totalBikeMi: 72,
    weekNotes: '🔝 Peak week 1',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 16, startDate: '2026-08-23', endDate: '2026-08-29', phase: 'peak',
    bikes: [
      { id: 1, label: 'Bike Intervals', distance: '20 mi', duration: '75 min', mike: false, notes: '' },
      { id: 2, label: 'Long Bike', distance: '32 mi', duration: '130 min', mike: false, notes: '' },
      { id: 3, label: 'Brick (Bike + Run)', distance: '18 mi bike + 3 mi run', duration: '100 min', mike: false, notes: '' },
    ],
    swims: [
      { id: 1, label: 'Threshold Swim', distance: '2000 yds', mike: false, notes: '' },
      { id: 2, label: 'Open Water', distance: '2200 yds', mike: false, notes: '🌊' },
    ],
    totalSwimYds: 4200, totalBikeMi: 70,
    weekNotes: '🔝 Peak week 2',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 17, startDate: '2026-08-30', endDate: '2026-09-05', phase: 'peak',
    bikes: [
      { id: 1, label: 'Tempo Bike', distance: '18 mi', duration: '70 min', mike: false, notes: 'Recovery week — drop volume but keep intensity' },
      { id: 2, label: 'Long Bike', distance: '25 mi', duration: '95 min', mike: false, notes: '' },
    ],
    swims: [
      { id: 1, label: 'Form Swim', distance: '1500 yds', mike: false, notes: '' },
      { id: 2, label: 'Open Water — Race Sim', distance: '1500 yds', mike: false, notes: '🌊' },
    ],
    totalSwimYds: 3000, totalBikeMi: 43,
    weekNotes: '🟢 Recovery week before final peak',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 18, startDate: '2026-09-06', endDate: '2026-09-12', phase: 'peak',
    bikes: [
      { id: 1, label: 'Bike Intervals', distance: '20 mi', duration: '75 min', mike: false, notes: 'Final hard intervals' },
      { id: 2, label: 'Long Bike', distance: '30 mi', duration: '120 min', mike: false, notes: 'Last long ride' },
      { id: 3, label: 'Brick (Race Sim)', distance: '12 mi bike + 3.1 mi run', duration: '85 min', mike: false, notes: '🏁 Race-distance brick at race pace' },
    ],
    swims: [
      { id: 1, label: 'Threshold Swim', distance: '1800 yds', mike: false, notes: '' },
      { id: 2, label: 'Open Water — Race Sim', distance: '1500 yds', mike: false, notes: '🌊 Final race-pace OW swim' },
    ],
    totalSwimYds: 3300, totalBikeMi: 62,
    weekNotes: '🔝 Final peak — race sim brick this week',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  // ============================================================================
  // PHASE 4 — TAPER (Weeks 19-20, Sep 13 → Sep 27)
  // Cut volume sharply, maintain intensity, sharpen.
  // ============================================================================
  { weekNumber: 19, startDate: '2026-09-13', endDate: '2026-09-19', phase: 'taper',
    bikes: [
      { id: 1, label: 'Easy Bike', distance: '15 mi', duration: '55 min', mike: false, notes: 'Spin only' },
      { id: 2, label: 'Tempo Bike', distance: '12 mi', duration: '45 min', mike: false, notes: '3 × 3min at race pace' },
    ],
    swims: [
      { id: 1, label: 'Easy Swim', distance: '1200 yds', mike: false, notes: '' },
      { id: 2, label: 'Race-Pace Swim', distance: '1500 yds', mike: false, notes: 'Sharpen' },
    ],
    totalSwimYds: 2700, totalBikeMi: 27,
    weekNotes: '📉 Taper week 1 — volume drops 40%',
    reflection: { wentWell: '', feeling: '', notes: '' } },

  { weekNumber: 20, startDate: '2026-09-20', endDate: '2026-09-27', phase: 'taper',
    bikes: [
      { id: 1, label: 'Easy Spin', distance: '8 mi', duration: '30 min', mike: false, notes: 'Loose the legs' },
      { id: 2, label: 'Race Day Bike Check', distance: '5 mi', duration: '20 min', mike: false, notes: 'Day before — easy spin, gear check' },
    ],
    swims: [
      { id: 1, label: 'Race-Pace Sharpener', distance: '800 yds', mike: false, notes: 'Short, sharp, then rest' },
      { id: 2, label: 'Race Day Warm-up Swim', distance: 'TBD', mike: false, notes: '🌊 In the ocean before start' },
    ],
    totalSwimYds: 800, totalBikeMi: 13,
    weekNotes: '🏁 RACE WEEK! Wrightsville Beach Sprint Tri Sunday 9/27. Trust the training.',
    reflection: { wentWell: '', feeling: '', notes: '' },
    isRaceWeek: true },
].map(week => ({ ...week, id: `tri-wrightsville-2026-week-${week.weekNumber}` }));

// Helper: which week of the plan covers a given YYYY-MM-DD?
export function getCurrentTriWeek(planArr, todayYmd) {
  return planArr.find(w => w.startDate <= todayYmd && w.endDate >= todayYmd) || null;
}
