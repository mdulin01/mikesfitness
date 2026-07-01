import { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import { toLocalDateStr } from '../utils/dateUtils';
import { addDays, shortDate } from '../utils/training';
import { EXERCISES, EXERCISE_MAP, EXERCISE_CATEGORIES } from '../data/exercises';
import { WEEK_TEMPLATE } from '../data/programTemplate';

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
  const { plans, ensureWeek, regenerateWeek, saveDay, currentWeekStart, coach } = training;
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

  const updateBlock = (dayIdx, bi, field, val) => {
    const day = plan.days[dayIdx];
    const blocks = day.blocks.map((b, i) => i === bi ? { ...b, [field]: val } : b);
    saveDay(weekStart, dayIdx, { blocks });
  };
  const removeBlockAt = (dayIdx, bi) => {
    const day = plan.days[dayIdx];
    saveDay(weekStart, dayIdx, { blocks: day.blocks.filter((_, i) => i !== bi) });
  };
  const addBlockTo = (dayIdx, ex) => {
    const day = plan.days[dayIdx];
    const nb = { exerciseId: ex.id, name: ex.name, sets: 3, repRange: ex.repRange, unit: ex.unit || 'reps', weight: null, note: null };
    saveDay(weekStart, dayIdx, { blocks: [...(day.blocks || []), nb] });
    setPicker(null);
  };
  const changeDayType = (dayIdx, type) => {
    const t = WEEK_TEMPLATE.find(x => x.type === type);
    const day = plan.days[dayIdx];
    saveDay(weekStart, dayIdx, {
      type,
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
          <div key={di} className={`bg-slate-800 rounded-2xl overflow-hidden ${isToday ? 'ring-1 ring-blue-500/60' : ''}`}>
            <button onClick={() => setExpanded(isExpanded ? null : di)} className="w-full flex items-center gap-3 p-4 text-left">
              <span className="text-2xl">{d.status === 'done' ? '✅' : d.status === 'skipped' ? '⏭️' : d.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-100">
                  {d.day} <span className="text-slate-500 font-normal">· {shortDate(d.date)}</span>
                  {isToday && <span className="ml-2 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">TODAY</span>}
                </div>
                <div className="text-sm text-slate-400 truncate">{d.title}</div>
              </div>
              <span className="text-slate-600 text-xs">{d.targetMin ? `${d.targetMin}m` : ''} {isExpanded ? '▲' : '▼'}</span>
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-700/60 pt-3">
                {d.detail && <p className="text-sm text-slate-400">{d.detail}</p>}
                {d.type === 'strength' && (
                  <div className="space-y-2">
                    {(d.blocks || []).map((b, bi) => (
                      <div key={bi} className="flex items-center gap-2 text-sm bg-slate-900/50 rounded-xl px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-slate-200 truncate">{b.name}</div>
                          {b.note && <div className="text-[10px] text-amber-400">{b.note}</div>}
                        </div>
                        <input type="number" value={b.sets} onChange={e => updateBlock(di, bi, 'sets', Number(e.target.value) || 1)}
                          className="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-1 text-center text-slate-300 text-xs" title="sets" />
                        <span className="text-slate-600 text-xs">× {b.repRange?.[0]}-{b.repRange?.[1]}</span>
                        <input type="number" value={b.weight ?? ''} placeholder="lb" onChange={e => updateBlock(di, bi, 'weight', e.target.value === '' ? null : Number(e.target.value))}
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
                    <button onClick={() => saveDay(weekStart, di, { status: d.status === 'skipped' ? 'planned' : 'skipped' })}
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
          onClick={async () => { await regenerateWeek(weekStart); toast('Week regenerated with latest progression', 'success'); }}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-2xl py-3 text-sm">
          ⟳ Regenerate week (template + progression from your logs)
        </button>
      )}

      {/* Program rationale */}
      <div className="bg-slate-800/60 rounded-2xl p-4 text-xs text-slate-500 leading-relaxed">
        <span className="text-slate-400 font-semibold">The formula:</span> 3 strength days (all major patterns, 2× per week each),
        1 zone-2 day, 1 VO2max/interval day, 1 long fun day, 1 recovery day — plus 10 min of daily mobility and a steps target.
        Strength progresses by <span className="text-slate-400">double progression</span>: work 8→12 reps at a weight, then the app bumps the load.
        Suggested weights update automatically from what you actually lift.
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
