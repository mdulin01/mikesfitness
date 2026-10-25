import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWeekFromTemplate, WEEK_TEMPLATE, TEMPLATE_VERSION } from '../src/data/programTemplate.js';
import { EXERCISE_MAP } from '../src/data/exercises.js';
import { suggestNextLoad, weeklyPillarSummary, computeStreaks, weekDates, lastPerformance, computePRs } from '../src/utils/training.js';
import { planForWrite, validEffectiveDate, writePlanTransaction } from '../src/utils/planRollout.js';
import { activeTriPlan, normalizeNextRace } from '../src/utils/triathlon.js';

const effectiveDate = '2026-10-25';
const weekStart = '2026-10-26';
const build = date => buildWeekFromTemplate(date, undefined, { effectiveDate });
const options = { weekStart, today: '2026-10-25', effectiveDate };
const performance = { weight: 100, plannedSets: 3, sets: Array.from({ length: 3 }, () => ({ reps: 12, done: true })) };

test('exactly two required and one optional strength session; all endurance sessions fit in seven dates', () => {
  const week = build(weekStart);
  assert.equal(week.days.filter(d => d.type === 'strength' && !d.optional).length, 2);
  assert.equal(week.days.filter(d => d.type === 'strength' && d.optional).length, 1);
  assert.equal(new Set(week.days.map(d => d.date)).size, 7);
  assert.equal(week.days.filter(d => d.cardioType === 'swim').length, 2);
  assert.equal(week.days.filter(d => d.cardioType === 'bike' && d.type !== 'long').length, 1);
  assert.equal(week.days.filter(d => d.cardioType === 'run' && d.type !== 'long').length, 1);
  assert.equal(week.days.filter(d => d.type === 'mobility').length, 1);
  assert.equal(week.days.filter(d => d.type === 'long').length, 1);
});

test('A-B-A alternates with B-A-B and long bike alternates with long run', () => {
  assert.deepEqual(build(weekStart).days.filter(d => d.type === 'strength').map(d => d.title.slice(0, 10)), ['Strength A', 'Strength B', 'Strength A']);
  assert.deepEqual(build('2026-11-02').days.filter(d => d.type === 'strength').map(d => d.title.slice(0, 10)), ['Strength B', 'Strength A', 'Strength B']);
  assert.equal(build(weekStart).days.find(d => d.type === 'long').cardioType, 'bike');
  assert.equal(build('2026-11-02').days.find(d => d.type === 'long').cardioType, 'run');
});

test('all lower-body blocks come before upper-body blocks in A and B', () => {
  for (const day of WEEK_TEMPLATE.filter(d => d.type === 'strength')) {
    let upperStarted = false;
    for (const block of day.blocks) {
      if (!EXERCISE_MAP[block.exerciseId].lowerBody) upperStarted = true;
      else assert.equal(upperStarted, false, block.exerciseId);
    }
  }
});

test('new exercise IDs and all template alternatives resolve with correct dose units', () => {
  for (const [id, range, unit] of [
    ['lateral-raise', [12, 15], 'reps'], ['wood-chopper', [10, 10], 'reps/side'],
    ['kb-deadlift', [10, 15], 'reps'], ['kb-swing', [15, 20], 'reps'], ['reverse-lunge', [8, 10], 'reps/leg'],
  ]) {
    assert.deepEqual(EXERCISE_MAP[id].repRange, range);
    assert.equal(EXERCISE_MAP[id].unit, unit);
  }
  for (const day of build('2026-11-16').days) for (const block of day.blocks) {
    assert.ok(EXERCISE_MAP[block.exerciseId]);
    for (const id of block.alternatives) assert.ok(EXERCISE_MAP[id]);
  }
});

test('technique weeks apply to squat, RDL and lunge only, then stop in week three', () => {
  for (const date of [weekStart, '2026-11-02']) {
    const blocks = build(date).days.flatMap(d => d.blocks);
    for (const id of ['goblet-squat', 'rdl', 'reverse-lunge']) {
      assert.match(blocks.find(b => b.exerciseId === id).note, /Technique week/);
    }
    assert.doesNotMatch(blocks.find(b => b.exerciseId === 'bench').note || '', /Technique week/);
  }
  assert.equal(build('2026-11-09').days.flatMap(d => d.blocks).some(b => b.note?.includes('Technique week')), false);
  assert.equal(suggestNextLoad(EXERCISE_MAP.rdl, performance, { technique: true }).weight, 50);
  assert.equal(suggestNextLoad(EXERCISE_MAP['reverse-lunge'], performance, { technique: true }).weight, 0);
});

test('deadlifts progress to swings in week four, with a deadlift alternative', () => {
  assert.ok(build('2026-11-09').days.flatMap(d => d.blocks).some(b => b.exerciseId === 'kb-deadlift'));
  assert.deepEqual(build('2026-11-16').days.flatMap(d => d.blocks).find(b => b.exerciseId === 'kb-swing').alternatives, ['kb-deadlift']);
});

test('every fifth program week deloads every lift to two sets and about 70% of last load', () => {
  const progression = (block, phase) => suggestNextLoad(EXERCISE_MAP[block.exerciseId], performance, phase);
  for (const date of ['2026-11-23', '2026-12-28']) {
    const week = buildWeekFromTemplate(date, progression, { effectiveDate });
    assert.equal(week.deload, true);
    for (const block of week.days.flatMap(d => d.blocks)) {
      assert.equal(block.sets, 2);
      assert.equal(block.weight, 70);
      assert.match(block.note, /Deload/);
    }
  }
});

test('all completed sets at the top add five pounds, except lateral raise adds 2.5', () => {
  for (const id of ['goblet-squat', 'rdl', 'row', 'latpull']) assert.equal(suggestNextLoad(EXERCISE_MAP[id], performance).weight, 105);
  const lateral = { ...performance, weight: 10, sets: performance.sets.map(s => ({ ...s, reps: 15 })) };
  assert.equal(suggestNextLoad(EXERCISE_MAP['lateral-raise'], lateral).weight, 12.5);
  assert.equal(suggestNextLoad(EXERCISE_MAP.rdl, { ...performance, plannedSets: 4 }).weight, 100);
  assert.equal(suggestNextLoad(EXERCISE_MAP.rdl, { ...performance, sets: [{ reps: 12 }, { reps: 10 }, { reps: 12 }] }).weight, 100);
  assert.equal(suggestNextLoad(EXERCISE_MAP.plank, { ...performance, sets: [{ reps: 60 }], plannedSets: 1 }).weight, 100);
});

test('skipping optional strength never adds a missed session or raises the required target', () => {
  const week = build(weekStart);
  week.days.forEach(d => { d.status = d.optional ? 'skipped' : 'done'; });
  const sessions = week.days.filter(d => d.type === 'strength' && !d.optional).map(d => ({ date: d.date, type: 'strength', durationMin: 45 }));
  const sum = weeklyPillarSummary(sessions, weekDates(weekStart), week.days, '2026-11-02');
  assert.equal(sum.strengthSessions, 2);
  assert.equal(sum.requiredStrengthSessions, 2);
  assert.equal(sum.missedSessions, 0);
});

test('optional-only gaps are neutral in move streaks; required missed days still break them', () => {
  const days = build(weekStart).days;
  const sessions = [{ date: '2026-10-29' }, { date: '2026-10-31' }];
  assert.equal(computeStreaks(sessions, {}, '2026-10-31', days).moveStreak, 2);
  assert.equal(computeStreaks(sessions, {}, '2026-10-31').moveStreak, 1);
  assert.equal(computeStreaks([{ date: '2026-10-30' }, { date: '2026-10-28' }], {}, '2026-10-30', days).moveStreak, 1);
});

test('merge-date gate keeps earlier weeks on the legacy template', () => {
  const current = planForWrite({ ...options, weekStart: '2026-10-19' });
  assert.equal(current.days.filter(d => d.type === 'strength').length, 3);
  assert.notEqual(current.templateVersion, TEMPLATE_VERSION);
  const next = planForWrite(options);
  assert.equal(next.templateVersion, TEMPLATE_VERSION);
  assert.equal(next.programWeek, 1);
});

test('unset, invalid and future merge dates fail closed', () => {
  for (const date of [undefined, '', 'wrong', '2026-02-30', '2026-99-99']) {
    assert.equal(validEffectiveDate(date), null);
    assert.notEqual(planForWrite({ ...options, effectiveDate: date }).templateVersion, TEMPLATE_VERSION);
  }
  assert.notEqual(planForWrite({ ...options, effectiveDate: '2026-11-01' }).templateVersion, TEMPLATE_VERSION);
});

test('past weeks are never seeded and all weeks with any completed day are untouched', () => {
  assert.equal(planForWrite({ ...options, weekStart: '2026-10-12' }), null);
  for (const week of ['2026-10-19', '2026-10-26', '2026-11-02']) for (const regenerate of [false, true]) {
    const existing = { weekStart: week, days: [{ status: 'planned' }, { status: 'done', sessionId: 'synthetic' }] };
    const before = structuredClone(existing);
    assert.equal(planForWrite({ ...options, weekStart: week, existing, regenerate }), null);
    assert.deepEqual(existing, before);
  }
});

test('transaction sees a concurrent done day and does not write even when caller thought the week was empty', async () => {
  let writes = 0;
  const transaction = { get: async () => ({ exists: () => true, data: () => ({ days: [{ status: 'done' }] }) }), set: () => { writes++; } };
  assert.equal(await writePlanTransaction(transaction, 'synthetic-ref', options), false);
  assert.equal(writes, 0);
});

test('eligible untouched old weeks migrate once, retaining notes', () => {
  const existing = { days: [{ status: 'planned' }], focus: 'Synthetic focus', reflection: { notes: 'Synthetic note' } };
  const fresh = planForWrite({ ...options, existing });
  assert.equal(fresh.templateVersion, TEMPLATE_VERSION);
  assert.equal(fresh.focus, existing.focus);
  assert.deepEqual(fresh.reflection, existing.reflection);
  assert.equal(planForWrite({ ...options, existing: fresh }), null);
});

test('historic session and legacy PR readers remain compatible and do not mutate history', () => {
  const sessions = [{ date: '2026-10-20', exercises: [{ id: 'rdl', name: 'RDL', sets: [{ weight: 50, reps: 10, done: true }] }] }];
  const legacy = { '2026-10-19': [{ exerciseId: 'bench', exerciseName: 'Bench', sets: [{ weight: 100, reps: 10 }] }] };
  const before = structuredClone({ sessions, legacy });
  assert.equal(lastPerformance('rdl', sessions).weight, 50);
  const prs = computePRs(sessions, legacy);
  assert.ok(prs.rdl.e1RM > 0 && prs.bench.e1RM > 0);
  assert.deepEqual({ sessions, legacy }, before);
});

test('triathlon falls back to off-season outside every plan without changing archived history', () => {
  const plan = [{ startDate: '2026-09-21', endDate: '2026-09-27', swims: [{ mike: true }] }];
  const shared = { events: [{ id: 'tri', type: 'triathlon' }], trainingPlans: { tri: plan } };
  const before = structuredClone(shared);
  assert.equal(activeTriPlan(shared, 'tri', plan, '2026-10-25'), null);
  assert.equal(activeTriPlan(shared, 'tri', plan, '2026-09-27').event.id, 'tri');
  assert.deepEqual(shared, before);
});

test('any current triathlon plan is selected, rather than always displaying Wrightsville', () => {
  const shared = { events: [{ id: 'next', type: 'triathlon' }], trainingPlans: { next: [{ startDate: '2026-10-19', endDate: '2026-10-25' }] } };
  assert.equal(activeTriPlan(shared, 'old', [], '2026-10-25').event.id, 'next');
});

test('next race validates and stores only its three editable fields', () => {
  assert.deepEqual(normalizeNextRace({ name: ' Example Tri ', date: '2027-04-10', distance: ' Sprint ', extra: 'discard' }, '2026-10-25'), { name: 'Example Tri', date: '2027-04-10', distance: 'Sprint' });
  assert.throws(() => normalizeNextRace({ name: 'Race', date: '2026-10-24', distance: 'Sprint' }, '2026-10-25'));
  assert.throws(() => normalizeNextRace({ name: 'Race', date: '2027-02-30', distance: 'Sprint' }, '2026-10-25'));
});

test('new logs preserve planned set counts so unfinished sessions cannot earn a load increase', () => {
  const sessions = [{ date: '2026-10-26', exercises: [{ id: 'rdl', plannedSets: 3, sets: [{ weight: 50, reps: 12, done: true }] }] }];
  const last = lastPerformance('rdl', sessions);
  assert.equal(last.plannedSets, 3);
  assert.equal(suggestNextLoad(EXERCISE_MAP.rdl, last).weight, 50);
});
