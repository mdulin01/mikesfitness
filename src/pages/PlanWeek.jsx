import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { toLocalDateStr } from '../utils/dateUtils';
import { addDays, shortDate } from '../utils/training';
import { EXERCISES, EXERCISE_MAP, EXERCISE_CATEGORIES } from '../data/exercises';
import { buildWeekFromTemplate, dayTemplateForType } from '../data/programTemplate';
import { buildWeekFromTemplate as buildLegacyWeek } from '../data/legacyProgramTemplate';
import { hasCompletedDay, canUseNewTemplate } from '../utils/planRollout';
import PlanField from '../components/PlanField';
import { editPlanBlock } from '../utils/planEdits';

const DAY_TYPES = [
  { id: 'strength', label: '💪 Strength' },
  { id: 'cardio', label: '🚴 Zone 2' },
  { id: 'intervals', label: '🫀 Intervals' },
  { id: 'long', label: '🌄 Long day' },
  { id: 'mobility', label: '🧘 Recovery' },
  { id: 'rest', label: '😴 Rest' },
];

export default function PlanWeek({ training }) {
  const toast = useToast();
  const { plans, ensureWeek, regenerateWeek, saveDay, currentWeekStart, coach, effectiveDate, progressionFor } = training;
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = addDays(currentWeekStart, weekOffset * 7);
  const todayStr = toLocalDateStr();

  // Seed current + viewed week (only current/future weeks get seeded).
  useEffect(() => { ensureWeek(currentWeekStart); }, [ensureWeek, currentWeekStart]);
  useEffect(() => { if (weekOffset >= 0) ensureWeek(weekStart); }, [ensureWeek, weekStart, weekOffset]);

  const plan = plans[weekStart];
  const [expanded, setExpanded] = useState(null);
  const [picker, setPicker] = useState(null); // dayIdx when open
  const [pickerCat, setPickerCat] = useState('legs');
  const eligible = canUseNewTemplate(weekStart, todayStr, effectiveDate);

  const commitDay = async (dayIdx, updates) => {
    try { await saveDay(weekStart, dayIdx, updates); return true; }
    catch { toast('Could not save this edit. Reload the week if it changed, then try again.', 'error'); return false; }
  };

  const updateBlock = (dayIdx, bi, field, val) => {
    const expected = plan.days[dayIdx].blocks[bi];
    return commitDay(dayIdx, day => editPlanBlock(day, expected, bi,
      (blocks, actualIndex) => blocks.map((b, i) => i === actualIndex ? { ...b, [field]: val } : b)));
  };
  const removeBlockAt = (dayIdx, bi) => {
    const expected = plan.days[dayIdx].blocks[bi];
    commitDay(dayIdx, day => editPlanBlock(day, expected, bi,
      (blocks, actualIndex) => blocks.filter((_, i) => i !== actualIndex)));
  };
  const addBlockTo = (dayIdx, ex) => {
    const nb = { id: crypto.randomUUID(), exerciseId: ex.id, name: ex.name, sets: 3, repRange: ex.repRange, unit: ex.unit || 'reps', weight: null, note: null };
    commitDay(dayIdx, day => ({ blocks: [...(day.blocks || []), nb] }));
    setPicker(null);
  };
  const swapExercise = (dayIdx, bi, exerciseId) => {
    const expected = plan.days[dayIdx].blocks[bi];
    const ex = EXERCISE_MAP[exerciseId];
    commitDay(dayIdx, day => editPlanBlock(day, expected, bi,
      (blocks, actualIndex) => blocks.map((b, i) => i === actualIndex ? { ...b, exerciseId, name: ex.name, repRange: ex.repRange,
        unit: ex.unit || 'reps', weight: null, note: ex.cue, alternatives: [b.exerciseId] } : b)));
  };
  const changeDayType = (dayIdx, type) => {
    const day = plan.days[dayIdx];
    if (type === 'strength' && day.type === 'strength') return;
    const templates = plan.templateVersion
      ? buildWeekFromTemplate(weekStart, progressionFor, { effectiveDate: plan.effectiveDate })
      : buildLegacyWeek(weekStart, progressionFor);
    const t = dayTemplateForType(templates, type, day.date);
    commitDay(dayIdx, {
      type,
      cardioType: t?.cardioType || null,
      optional: type === 'strength' && day.optional === true,
      emoji: t?.emoji || '😴',
      title: type === 'rest' ? 'Rest day' : (t?.title || day.title),
      detail: type === 'rest' ? 'Full rest — walking is still encouraged.' : (t?.detail || null),
      blocks: type === 'strength' ? (day.blocks?.length ? day.blocks : (t?.blocks || [])) : [],
      targetMin: t?.targetMin ?? 0,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-4">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setWeekOffset(o => o - 1)} className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300">←</button>
        <div className="text-center">
          <div className="font-semibold text-slate-100">Week of {shortDate(weekStart)}</div>
          <div className="text-xs text-slate-500">{weekOffset === 0 ? 'current week' : weekOffset === 1 ? 'next week' : weekOffset === -1 ? 'last week' : `${Math.abs(weekOffset)} weeks ${weekOffset > 0 ? 'ahead' : 'ago'}`}</div>
        </div>
        <button onClick={() => setWeekOffset(o => o + 1)} className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-300">→</button>
      </div>

      <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/30 p-4">
        <h1 className="font-semibold text-emerald-200">Strength + off-season base</h1>
        <p className="mt-1 text-sm text-slate-400">2 strength sessions · 2 swims · bike · easy run · rotating long day · recovery</p>
        <p className="mt-2 text-xs text-emerald-300">The third strength session is optional. Skip it without a missed day.</p>
        {plan?.programWeek && <p className="mt-2 text-xs text-amber-300">Program week {plan.programWeek}{plan.deload ? ' · Deload: 2 sets at ~70% load' : plan.programWeek <= 2 ? ' · Technique weeks: light squat, RDL and lunge' : ''}</p>}
        {!effectiveDate && <p className="mt-2 text-xs text-slate-400">Your saved plan stays in place until the new program is released.</p>}
      </div>

      {/* Coach note for the week */}
      {coach?.weekNote && weekOffset === 0 && (
        <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-2xl p-4 text-sm text-emerald-200">
          🦚 <span className="font-semibold">Rupert:</span> {coach.weekNote}
        </div>
      )}

      {!plan && <div className="text-center text-slate-500 py-8">{weekOffset < 0 ? 'No plan was saved for this week.' : 'Seeding week…'}</div>}

      {plan?.days?.map((d, di) => {
        const isToday = d.date === todayStr;
        const isExpanded = expanded === di;
        return (
          <div key={`${weekStart}:${d.id || di}`} className={`bg-slate-800 rounded-2xl overflow-hidden ${isToday ? 'ring-1 ring-blue-500/60' : ''}`}>
            <button onClick={() => setExpanded(isExpanded ? null : di)} className="w-full flex items-center gap-3 p-4 text-left">
              <span className="text-2xl">{d.status === 'done' ? '✅' : d.status === 'skipped' ? '⏭️' : d.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-100">
                  {d.day} <span className="text-slate-500 font-normal">· {shortDate(d.date)}</span>
                  {isToday && <span className="ml-2 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">TODAY</span>}
                </div>
                <div className="text-sm text-slate-400">{d.title}</div>
                {d.optional && <span className="text-[10px] font-semibold text-emerald-300">OPTIONAL · no missed day if skipped</span>}
              </div>
              <span className="text-slate-600 text-xs">{d.targetMin ? `${d.targetMin}m` : ''} {isExpanded ? '▲' : '▼'}</span>
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-700/60 pt-3">
                {d.detail && <p className="text-sm text-slate-400">{d.detail}</p>}
                {d.status !== 'done' && <label className="flex items-center gap-2 text-xs text-slate-400">Session date
                  <PlanField type="date" required aria-label={`Date for ${d.title}`} min={weekStart} max={addDays(weekStart, 6)} value={d.date}
                    onCommit={date => commitDay(di, { date, day: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }) })}
                    className="rounded bg-slate-900 border border-slate-700 px-2 py-1 text-slate-200" />
                </label>}
                {d.type === 'strength' && (
                  <div className="space-y-2">
                    {(d.blocks || []).map((b, bi) => (
                      <div key={`${b.id || bi}:${b.exerciseId}`} className="flex flex-wrap items-center gap-2 text-sm bg-slate-900/50 rounded-xl px-3 py-2">
                        <div className="flex-1 min-w-40">
                          <div className="text-slate-200">{b.name}</div>
                          {b.note && <div className="text-[10px] text-amber-400">{b.note}</div>}
                          {b.alternatives?.map(id => <button key={id} onClick={() => swapExercise(di, bi, id)} className="block text-xs text-blue-300 mt-1">Use {EXERCISE_MAP[id]?.name}</button>)}
                        </div>
                        <PlanField type="number" min="1" step="1" required value={b.sets} onCommit={value => updateBlock(di, bi, 'sets', Number(value))}
                          className="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-1 text-center text-slate-300 text-xs" title="sets" />
                        <span className="text-slate-600 text-xs">× {b.repRange?.[0]}-{b.repRange?.[1]} {b.unit}</span>
                        <PlanField type="number" min="0" step="any" value={b.weight ?? ''} placeholder="lb" onCommit={value => updateBlock(di, bi, 'weight', value === '' ? null : Number(value))}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-1 py-1 text-center text-slate-300 text-xs" title="suggested weight" />
                        <button onClick={() => removeBlockAt(di, bi)} className="text-slate-600 hover:text-red-400">✕</button>
                      </div>
                    ))}
                    <button onClick={() => { setPicker(di); }} className="text-xs text-blue-400">+ add exercise</button>
                  </div>
                )}
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {DAY_TYPES.map(t => (
                    <button key={t.id} onClick={() => changeDayType(di, t.id)}
                      className={`px-2 py-1 rounded-lg text-[11px] ${d.type === t.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>{t.label}</button>
                  ))}
                  {d.status !== 'done' && (
                    <button onClick={() => commitDay(di, { status: d.status === 'skipped' ? 'planned' : 'skipped' })}
                      className="px-2 py-1 rounded-lg text-[11px] bg-slate-700 text-slate-400 ml-auto">
                      {d.status === 'skipped' ? 'restore' : 'skip'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {plan && weekOffset >= 0 && (
        <button
          disabled={hasCompletedDay(plan) || !eligible}
          onClick={async () => { try { const changed = await regenerateWeek(weekStart); toast(changed ? 'Week regenerated with latest progression' : 'This week is protected; the saved plan was kept', changed ? 'success' : 'error'); } catch { toast('Could not regenerate this week', 'error'); } }}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-2xl py-3 text-sm disabled:opacity-50">
          ⟳ Regenerate week (template + progression from your logs)
        </button>
      )}

      {hasCompletedDay(plan) && <p className="text-xs text-slate-400">This week has a completed session. Regeneration is locked to protect the whole week.</p>}
      {plan && !hasCompletedDay(plan) && !eligible && <p className="text-xs text-slate-400">This week uses the previous program. Regeneration is available for eligible weeks after the new program is released.</p>}

      {/* Program rationale */}
      <div className="bg-slate-800/60 rounded-2xl p-4 text-xs text-slate-500 leading-relaxed">
        <span className="text-slate-400 font-semibold">The formula:</span> alternate A–B–A and B–A–B, with the third strength session optional.
        Lower-body lifts come first. Reach the top of the rep range on every set before adding 5 lb (2.5 lb for lateral raises).
        Start with two technique weeks; every fifth week is a deload with 2 sets at about 70% of your last load.
        You can move the two-a-day swim/run sessions to fit your schedule.
      </div>

      {/* Exercise picker */}
      {picker != null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center" onClick={() => setPicker(null)}>
          <div className="bg-slate-800 rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[75vh] overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="flex gap-1.5 flex-wrap mb-3">
              {EXERCISE_CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setPickerCat(c.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs ${pickerCat === c.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{c.emoji} {c.label}</button>
              ))}
            </div>
            {EXERCISES.filter(e => e.category === pickerCat).map(ex => (
              <button key={ex.id} onClick={() => addBlockTo(picker, ex)} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-700 text-slate-200 text-sm flex justify-between">
                <span>{ex.name}</span>
                <span className="text-slate-500 text-xs">{EXERCISE_MAP[ex.id].repRange[0]}-{EXERCISE_MAP[ex.id].repRange[1]} {ex.unit || 'reps'}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
