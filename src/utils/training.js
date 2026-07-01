// Pure helpers for the training engine: PRs, progression, readiness, streaks.
import { toLocalDateStr, offsetDateStr } from './dateUtils';

// Estimated 1-rep max (Epley). reps===1 returns the weight itself.
export const epleyE1RM = (weight, reps) => {
  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  if (w <= 0 || r <= 0) return 0;
  return Math.round(w * (1 + (r - 1) / 30));
};

// Monday-based week start for a YYYY-MM-DD string.
export function weekStartOf(dateStr = toLocalDateStr()) {
  const d = new Date(dateStr + 'T12:00:00');
  const dow = d.getDay(); // 0 Sun .. 6 Sat
  const back = dow === 0 ? 6 : dow - 1;
  return offsetDateStr(dateStr, -back);
}

export const addDays = offsetDateStr;

export function weekDates(weekStart) {
  return Array.from({ length: 7 }, (_, i) => offsetDateStr(weekStart, i));
}

export const shortDate = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

// ---------- PRs ----------
// Build a PR map from logged sessions (new system) plus the legacy
// exerciseLog from the mike-health doc so history carries over.
// Returns { [exerciseId]: { name, e1RM, weight, reps, date, history: [{date, e1RM, weight, reps}] } }
export function computePRs(sessions = [], legacyExerciseLog = {}) {
  const map = {};
  const feed = (exerciseId, name, weight, reps, date) => {
    const e1RM = epleyE1RM(weight, reps);
    if (!exerciseId || e1RM <= 0) return;
    if (!map[exerciseId]) map[exerciseId] = { name, e1RM: 0, weight: 0, reps: 0, date: null, history: [] };
    const rec = map[exerciseId];
    // history keeps the best e1RM per date
    const existing = rec.history.find(h => h.date === date);
    if (!existing) rec.history.push({ date, e1RM, weight, reps });
    else if (e1RM > existing.e1RM) Object.assign(existing, { e1RM, weight, reps });
    if (e1RM > rec.e1RM) Object.assign(rec, { e1RM, weight, reps, date, name });
  };

  // Legacy: { '2026-04-04': [{ exerciseId, exerciseName, sets: [{weight, reps}] }] }
  for (const [date, entries] of Object.entries(legacyExerciseLog || {})) {
    for (const e of entries || []) {
      for (const s of e.sets || []) feed(e.exerciseId || slugify(e.exerciseName), e.exerciseName || e.exerciseId, s.weight, s.reps, date);
    }
  }
  // New sessions: { date, exercises: [{ id, name, sets: [{weight, reps, done}] }] }
  for (const sess of sessions) {
    for (const e of sess.exercises || []) {
      for (const s of e.sets || []) {
        if (s.done === false) continue;
        feed(e.id || slugify(e.name), e.name, s.weight, s.reps, sess.date);
      }
    }
  }
  for (const rec of Object.values(map)) rec.history.sort((a, b) => a.date.localeCompare(b.date));
  return map;
}

export const slugify = (name = '') => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Detect PRs in a session against an existing PR map (call BEFORE merging the session in).
export function detectPRs(session, prMap) {
  const prs = [];
  for (const e of session.exercises || []) {
    const id = e.id || slugify(e.name);
    let best = { e1RM: 0 };
    for (const s of e.sets || []) {
      if (s.done === false) continue;
      const e1RM = epleyE1RM(s.weight, s.reps);
      if (e1RM > best.e1RM) best = { e1RM, weight: Number(s.weight), reps: Number(s.reps) };
    }
    const prev = prMap[id]?.e1RM || 0;
    if (best.e1RM > 0 && best.e1RM > prev) {
      prs.push({ exerciseId: id, name: e.name, e1RM: best.e1RM, weight: best.weight, reps: best.reps, prevE1RM: prev });
    }
  }
  return prs;
}

// ---------- Progression ----------
// Double progression: work within the rep range at a fixed weight; once every
// planned set hits the TOP of the range, add load (5 lb upper / 10 lb lower).
// If badly missed, back off ~5-10%.
export function suggestNextLoad(exercise, lastPerf) {
  // exercise: library entry { id, lowerBody, repRange: [lo, hi], increment }
  // lastPerf: { weight, sets: [{reps, done}] } from most recent session containing it
  if (!lastPerf || !lastPerf.weight) return { weight: null, note: 'Pick a comfortable starting weight — you should have 2-3 reps left in the tank.' };
  const [, hi] = exercise.repRange || [8, 12];
  const doneSets = (lastPerf.sets || []).filter(s => s.done !== false && Number(s.reps) > 0);
  if (doneSets.length === 0) return { weight: lastPerf.weight, note: null };
  const allAtTop = doneSets.length >= (lastPerf.plannedSets || doneSets.length) && doneSets.every(s => Number(s.reps) >= hi);
  const badlyMissed = doneSets.filter(s => Number(s.reps) < (exercise.repRange?.[0] || 8) - 1).length >= 2;
  const inc = exercise.increment || (exercise.lowerBody ? 10 : 5);
  if (allAtTop) return { weight: Number(lastPerf.weight) + inc, note: `⬆ +${inc} lb — you hit ${hi} reps on every set last time` };
  if (badlyMissed) {
    const down = Math.max(5, Math.round(Number(lastPerf.weight) * 0.07 / 5) * 5);
    return { weight: Number(lastPerf.weight) - down, note: `⬇ backing off ${down} lb — missed reps last time` };
  }
  return { weight: Number(lastPerf.weight), note: 'Same weight — add a rep per set until you hit the top of the range' };
}

// Most recent performance of an exercise across sessions (sessions sorted date desc).
export function lastPerformance(exerciseId, sessions = []) {
  for (const sess of sessions) {
    for (const e of sess.exercises || []) {
      if ((e.id || slugify(e.name)) !== exerciseId) continue;
      const sets = (e.sets || []).filter(s => s.done !== false && Number(s.reps) > 0);
      if (sets.length === 0) continue;
      // use the heaviest working weight of that day
      const weight = Math.max(...sets.map(s => Number(s.weight) || 0));
      return { date: sess.date, weight, sets, plannedSets: (e.sets || []).length };
    }
  }
  return null;
}

// ---------- Readiness ----------
// 0-100 from last night's sleep, resting HR vs 30d baseline, HRV vs 30d
// baseline, and yesterday's training load. Weights redistribute when a
// signal is missing so a partial day still scores fairly.
export function readinessFrom(dailyMetricsByDate = {}, todayStr = toLocalDateStr()) {
  const today = dailyMetricsByDate[todayStr] || {};
  const yesterday = dailyMetricsByDate[addDays(todayStr, -1)] || {};

  // 30-day baselines (excluding today)
  const rhrVals = []; const hrvVals = [];
  for (let i = 1; i <= 30; i++) {
    const m = dailyMetricsByDate[addDays(todayStr, -i)];
    if (m?.vitals?.heartRateRest) rhrVals.push(m.vitals.heartRateRest);
    if (m?.vitals?.hrv) hrvVals.push(m.vitals.hrv);
  }
  const median = (arr) => { if (!arr.length) return null; const s = [...arr].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
  const rhrBase = median(rhrVals);
  const hrvBase = median(hrvVals);

  const parts = {}; const weights = {};
  const sleepHrs = today.sleep?.hoursTotal ?? null;
  if (sleepHrs != null) { parts.sleep = Math.min(1, sleepHrs / 7.5); weights.sleep = 40; }
  const rhr = today.vitals?.heartRateRest ?? yesterday.vitals?.heartRateRest ?? null;
  if (rhr != null && rhrBase) { parts.rhr = Math.min(1, Math.max(0.4, rhrBase / rhr)); weights.rhr = 25; }
  const hrv = today.vitals?.hrv ?? yesterday.vitals?.hrv ?? null;
  if (hrv != null && hrvBase) { parts.hrv = Math.min(1, Math.max(0.4, hrv / hrvBase)); weights.hrv = 15; }
  const yMin = yesterday.activity?.exerciseMinutes ?? null;
  if (yMin != null) { parts.load = yMin > 90 ? 0.6 : yMin > 60 ? 0.8 : 1; weights.load = 20; }

  const totalW = Object.values(weights).reduce((a, b) => a + b, 0);
  if (totalW === 0) return { score: null, band: 'unknown', parts: {}, detail: 'No Apple Health data yet today' };
  let score = 0;
  for (const k of Object.keys(parts)) score += parts[k] * (weights[k] / totalW) * 100;
  score = Math.round(score);
  const band = score >= 80 ? 'go' : score >= 60 ? 'steady' : 'easy';
  const detail = { go: 'Green light — a hard session will land well today', steady: 'Normal day — train as planned', easy: 'Recovery is lagging — keep it easy or move your hard day' }[band];
  return { score, band, parts, sleepHrs, rhr, rhrBase, hrv, hrvBase, detail };
}

// ---------- Weekly aggregates ----------
const STRENGTH_TYPES = new Set(['strength']);
const ENDURANCE_TYPES = new Set(['run', 'bike', 'swim', 'row', 'walk', 'hike', 'cardio', 'intervals']);
const MOBILITY_TYPES = new Set(['mobility', 'yoga', 'stretch']);

export function weeklyPillarSummary(sessions = [], dates = []) {
  const inWeek = sessions.filter(s => dates.includes(s.date));
  const sum = { strengthMin: 0, strengthSessions: 0, strengthSets: 0, enduranceMin: 0, zone2Min: 0, mobilityMin: 0, sessions: inWeek.length };
  for (const s of inWeek) {
    const mins = Number(s.durationMin) || 0;
    if (STRENGTH_TYPES.has(s.type)) {
      sum.strengthSessions++;
      sum.strengthMin += mins;
      sum.strengthSets += (s.exercises || []).reduce((a, e) => a + (e.sets || []).filter(x => x.done !== false).length, 0);
    } else if (ENDURANCE_TYPES.has(s.type)) {
      sum.enduranceMin += mins;
      if ((s.effort || 3) <= 3) sum.zone2Min += mins;
    } else if (MOBILITY_TYPES.has(s.type)) {
      sum.mobilityMin += mins;
    }
  }
  return sum;
}

// ---------- Streaks ----------
// moveStreak: consecutive days (ending today or yesterday) with a logged
// session OR >= 7500 steps. weekStreak: consecutive weeks (ending this or
// last week) with >= 4 sessions logged.
export function computeStreaks(sessions = [], dailyMetricsByDate = {}, todayStr = toLocalDateStr()) {
  const sessionDates = new Set(sessions.map(s => s.date));
  const active = (d) => sessionDates.has(d) || (dailyMetricsByDate[d]?.activity?.steps || 0) >= 7500;
  let moveStreak = 0;
  let cursor = active(todayStr) ? todayStr : addDays(todayStr, -1);
  while (active(cursor) && moveStreak < 400) { moveStreak++; cursor = addDays(cursor, -1); }

  const byWeek = {};
  for (const s of sessions) { const w = weekStartOf(s.date); byWeek[w] = (byWeek[w] || 0) + 1; }
  let weekStreak = 0;
  let wk = weekStartOf(todayStr);
  if ((byWeek[wk] || 0) < 4) wk = addDays(wk, -7); // current week may be in progress
  while ((byWeek[wk] || 0) >= 4 && weekStreak < 200) { weekStreak++; wk = addDays(wk, -7); }
  return { moveStreak, weekStreak };
}
