// The weekly program template. With work down to 2 days/week the default is
// 3 strength days + 2-3 endurance days + 1 long day + daily mobility — the
// highest-leverage mix for strength, VO2max, body comp, and durability at 59.
// Weeks are SEEDED from this template into Firestore (fitnessPlans/{weekStart})
// and are fully editable there; this file is only the starting point.
import { EXERCISE_MAP } from './exercises';
import { addDays } from '../utils/training';

const block = (exerciseId, sets, note) => {
  const ex = EXERCISE_MAP[exerciseId];
  return {
    exerciseId,
    name: ex?.name || exerciseId,
    sets,
    repRange: ex?.repRange || [8, 12],
    unit: ex?.unit || 'reps',
    weight: null, // filled by progression from history
    note: note || null,
  };
};

// Strength A — lower emphasis
const STRENGTH_A = [
  block('goblet-squat', 3),
  block('rdl', 3),
  block('bench', 3),
  block('row', 3),
  block('farmer-carry', 3),
  block('plank', 3),
];
// Strength B — upper emphasis
const STRENGTH_B = [
  block('ohp', 3),
  block('latpull', 3),
  block('incline-db-press', 3),
  block('db-row', 3),
  block('stepup', 3),
  block('side-plank', 3),
];
// Strength C — full body / power & carries
const STRENGTH_C = [
  block('trapbar-deadlift', 3, 'Leave 2 reps in the tank on every set'),
  block('split-squat', 3),
  block('machine-chest-press', 3),
  block('assisted-pullup', 3),
  block('face-pull', 2),
  block('pallof-press', 2),
];

export const WEEK_TEMPLATE = [
  { dow: 0, day: 'Monday', type: 'strength', emoji: '💪', title: 'Strength A — Lower focus', blocks: STRENGTH_A, targetMin: 55 },
  { dow: 1, day: 'Tuesday', type: 'cardio', emoji: '🚴', title: 'Zone 2 — bike / run / elliptical', detail: '40-50 min conversational pace. You can talk in sentences but not sing.', targetMin: 45 },
  { dow: 2, day: 'Wednesday', type: 'strength', emoji: '💪', title: 'Strength B — Upper focus', blocks: STRENGTH_B, targetMin: 55 },
  { dow: 3, day: 'Thursday', type: 'intervals', emoji: '🫀', title: 'VO2max intervals or swim', detail: 'Warm up 5 min → 4 × (4 min hard / 3 min easy) → cool down. Or swim: 8-10 × 100m fast / 50m easy.', targetMin: 40 },
  { dow: 4, day: 'Friday', type: 'strength', emoji: '💪', title: 'Strength C — Full body', blocks: STRENGTH_C, targetMin: 55 },
  { dow: 5, day: 'Saturday', type: 'long', emoji: '🌄', title: 'Long day — ride, run, hike, swim', detail: '75-120 min easy effort. Fun counts: golf walk, long hike with Adam, open-water swim.', targetMin: 90 },
  { dow: 6, day: 'Sunday', type: 'mobility', emoji: '🧘', title: 'Recovery — walk + full mobility', detail: '30 min walk + the full mobility routine, unhurried.', targetMin: 45 },
];

// Build a fresh week document from the template. `progressionFn(block)` may
// return { weight, note } to pre-fill suggested loads from history.
export function buildWeekFromTemplate(weekStart, progressionFn) {
  const days = WEEK_TEMPLATE.map((t) => ({
    day: t.day,
    date: addDays(weekStart, t.dow),
    type: t.type,
    emoji: t.emoji,
    title: t.title,
    detail: t.detail || null,
    targetMin: t.targetMin,
    blocks: (t.blocks || []).map(b => {
      const prog = progressionFn ? progressionFn(b) : null;
      return { ...b, weight: prog?.weight ?? b.weight, note: prog?.note ?? b.note };
    }),
    status: 'planned', // planned | done | skipped
    sessionId: null,
  }));
  return {
    weekStart,
    days,
    focus: null,
    generatedBy: 'template',
    createdAt: new Date().toISOString(),
  };
}
