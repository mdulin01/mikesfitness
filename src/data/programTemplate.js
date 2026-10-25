// Mike's two-day strength + triathlon base template. Saved weeks stay editable.
import { EXERCISE_MAP } from './exercises.js';
import { addDays, weekStartOf } from '../utils/training.js';

export const TEMPLATE_VERSION = 'strength-base-v2';
const TECHNIQUE_LIFTS = new Set(['goblet-squat', 'rdl', 'reverse-lunge']);
const block = (exerciseId, sets, note = null, alternatives = []) => {
  const ex = EXERCISE_MAP[exerciseId];
  return { exerciseId, name: ex.name, sets, repRange: ex.repRange, unit: ex.unit || 'reps', weight: null, note, alternatives };
};
const strengthA = () => [
  block('goblet-squat', 3), block('rdl', 3, 'Dumbbells; practice the hinge.'),
  { ...block('bench', 3), repRange: [6, 10] }, block('row', 3), block('lateral-raise', 2), block('wood-chopper', 2),
];
const strengthB = (week) => [
  block(week <= 3 ? 'kb-deadlift' : 'kb-swing', 3,
    week <= 3 ? 'Weeks 1–3: learn the deadlift before progressing to swings.' : 'Progress to swings only with a confident hinge; deadlift remains an option.',
    week <= 3 ? [] : ['kb-deadlift']),
  block('reverse-lunge', 3, 'Per leg; start with bodyweight.'),
  block('stepup', 2, 'Per leg; bodyweight or dumbbells.'),
  block('latpull', 3, 'At home, swap to a one-arm dumbbell row.', ['db-row']),
  block('ohp', 3, 'Dumbbells.'), block('plank', 2, 'Or use dead bugs.', ['deadbug']),
];

export function templateForWeek(programWeek = 1) {
  const aFirst = programWeek % 2 === 1;
  const strength = (letter) => ({
    type: 'strength', emoji: '💪', title: `Strength ${letter} — ${letter === 'A' ? 'YMCA · squat / push' : 'YMCA or home · hinge / pull'}`,
    blocks: letter === 'A' ? strengthA() : strengthB(programWeek), targetMin: 50,
    detail: 'Lower body first. Rest 90–120 seconds on squat, hinge and press; 60 seconds on other lifts.',
  });
  return [
    { id: 'strength-1', dow: 0, day: 'Monday', ...strength(aFirst ? 'A' : 'B') },
    { id: 'swim-technique', dow: 0, day: 'Monday', type: 'cardio', cardioType: 'swim', emoji: '🏊', title: 'Swim — technique / aerobic', detail: 'An easy technique and aerobic swim; separate from strength if that feels better.', targetMin: 30 },
    { id: 'bike-zone2', dow: 1, day: 'Tuesday', type: 'cardio', cardioType: 'bike', emoji: '🚴', title: 'Bike — Zone 2', detail: 'Conversational, steady effort.', targetMin: 45 },
    { id: 'strength-2', dow: 2, day: 'Wednesday', ...strength(aFirst ? 'B' : 'A') },
    { id: 'swim-threshold', dow: 3, day: 'Thursday', type: 'intervals', cardioType: 'swim', emoji: '🏊', title: 'Swim — CSS / threshold', detail: 'Warm up, swim controlled repeats near your current CSS pace with recovery, then cool down.', targetMin: 35 },
    { id: 'easy-run', dow: 3, day: 'Thursday', type: 'cardio', cardioType: 'run', emoji: '🏃', title: 'Run — easy', detail: 'Easy conversational run; move to another day as needed.', targetMin: 30 },
    { id: 'strength-optional', dow: 4, day: 'Friday', ...strength(aFirst ? 'A' : 'B'), optional: true, detail: 'Optional third session: A–B–A this week, B–A–B next week. Skipping it does not count as missed.' },
    { id: 'long-day', dow: 5, day: 'Saturday', type: 'long', cardioType: aFirst ? 'bike' : 'run', emoji: aFirst ? '🚴' : '🏃', title: `Long day — ${aFirst ? 'bike' : 'run'}`, detail: 'Easy endurance; build duration gradually. Bike and run alternate weekly.', targetMin: aFirst ? 90 : 60 },
    { id: 'recovery', dow: 6, day: 'Sunday', type: 'mobility', emoji: '🧘', title: 'Mobility / recovery', detail: 'Unhurried mobility and an easy walk.', targetMin: 30 },
  ];
}
export const WEEK_TEMPLATE = templateForWeek();
export function firstProgramWeek(effectiveDate) {
  const monday = weekStartOf(effectiveDate);
  return monday < effectiveDate ? addDays(monday, 7) : monday;
}
export function programWeekNumber(weekStart, effectiveDate) {
  return Math.max(1, Math.round((Date.parse(`${weekStart}T12:00:00Z`) - Date.parse(`${firstProgramWeek(effectiveDate)}T12:00:00Z`)) / 604800000) + 1);
}

export function buildWeekFromTemplate(weekStart, progressionFn, { effectiveDate = weekStart } = {}) {
  const programWeek = programWeekNumber(weekStart, effectiveDate);
  const deload = programWeek % 5 === 0;
  const days = templateForWeek(programWeek).map(t => ({
    ...t, date: addDays(weekStart, t.dow), optional: t.optional === true,
    detail: t.detail || null, cardioType: t.cardioType || null,
    blocks: (t.blocks || []).map(b => {
      const technique = programWeek <= 2 && TECHNIQUE_LIFTS.has(b.exerciseId);
      const prog = progressionFn?.(b, { technique, deload }) || {};
      const guidance = technique ? 'Technique week — use a light load; focus on form.' : deload ? 'Deload — 2 sets at about 70% load.' : null;
      return { ...b, id: `${t.id}:${b.exerciseId}`, trainingPhase: technique ? 'technique' : deload ? 'deload' : 'normal', sets: deload ? 2 : b.sets, weight: prog.weight ?? (technique && b.exerciseId === 'reverse-lunge' ? 0 : b.weight), note: [b.note, prog.note || guidance].filter(Boolean).join(' ') || null };
    }),
    status: 'planned', sessionId: null,
  }));
  return { weekStart, days, focus: null, generatedBy: 'template', templateVersion: TEMPLATE_VERSION,
    effectiveDate, programWeek, deload, createdAt: new Date().toISOString() };
}

// The Zone 2 button means bike, even though the template's first cardio is a
// swim. Prefer the date's A/B session, including the current week's phases.
export function dayTemplateForType(week, type, date) {
  const candidates = week.days.filter(day => day.type === type && (type !== 'cardio' || !day.cardioType || day.cardioType === 'bike'));
  return candidates.find(day => day.date === date) || candidates[0];
}
