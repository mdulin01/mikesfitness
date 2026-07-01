import { useState, useEffect, useMemo } from 'react';
import { useToast } from '../components/Toast';
import { toLocalDateStr } from '../utils/dateUtils';
import { readinessFrom, shortDate, epleyE1RM, lastPerformance } from '../utils/training';
import { EXERCISES, EXERCISE_MAP, EXERCISE_CATEGORIES, MOBILITY_ROUTINE } from '../data/exercises';

const CARDIO_TYPES = [
  { id: 'bike', label: 'Bike', emoji: '🚴' },
  { id: 'run', label: 'Run', emoji: '🏃' },
  { id: 'swim', label: 'Swim', emoji: '🏊' },
  { id: 'walk', label: 'Walk/Hike', emoji: '🚶' },
  { id: 'row', label: 'Row/Elliptical', emoji: '🚣' },
];
const EFFORTS = ['😌 Easy', '🙂 Steady', '😤 Moderate', '🥵 Hard', '💀 Max'];

const draftKey = (date) => `trainDraft-${date}`;

export default function Train({ training, dailyMetricsByDate, data }) {
  const toast = useToast();
  const todayStr = toLocalDateStr();
  const { plans, sessions, ensureWeek, logSession, deleteSession, saveDay, currentWeekStart, prMap } = training;

  useEffect(() => { ensureWeek(currentWeekStart); }, [ensureWeek, currentWeekStart]);

  const weekPlan = plans[currentWeekStart];
  const todayIdx = weekPlan?.days?.findIndex(d => d.date === todayStr) ?? -1;
  const todayPlan = todayIdx >= 0 ? weekPlan.days[todayIdx] : null;

  const readiness = useMemo(() => readinessFrom(dailyMetricsByDate, todayStr), [dailyMetricsByDate, todayStr]);

  const [mode, setMode] = useState(null); // null | 'strength' | 'cardio' | 'mobility'
  const [work, setWork] = useState(null); // strength working state
  const [cardio, setCardio] = useState({ type: 'bike', durationMin: '', distance: '', avgHR: '', effort: 2, notes: '' });
  const [mobilityDone, setMobilityDone] = useState({});
  const [effort, setEffort] = useState(2);
  const [notes, setNotes] = useState('');
  const [startedAt, setStartedAt] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerCat, setPickerCat] = useState('legs');

  // Restore an in-progress draft (phone locked at the gym, PWA reloaded…)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey(todayStr));
      if (raw) {
        const d = JSON.parse(raw);
        if (d.mode) { setMode(d.mode); setWork(d.work); setCardio(d.cardio || cardio); setMobilityDone(d.mobilityDone || {}); setEffort(d.effort ?? 2); setNotes(d.notes || ''); setStartedAt(d.startedAt); }
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayStr]);
  useEffect(() => {
    if (!mode) return;
    try { localStorage.setItem(draftKey(todayStr), JSON.stringify({ mode, work, cardio, mobilityDone, effort, notes, startedAt })); } catch { /* ignore */ }
  }, [mode, work, cardio, mobilityDone, effort, notes, startedAt, todayStr]);
  const clearDraft = () => { try { localStorage.removeItem(draftKey(todayStr)); } catch { /* ignore */ } };

  const startStrength = (blocks) => {
    setWork({
      blocks: (blocks?.length ? blocks : []).map(b => ({
        exerciseId: b.exerciseId, name: b.name,
        repRange: b.repRange || EXERCISE_MAP[b.exerciseId]?.repRange || [8, 12],
        unit: b.unit || EXERCISE_MAP[b.exerciseId]?.unit || 'reps',
        note: b.note,
        sets: Array.from({ length: b.sets || 3 }, () => ({ weight: b.weight ?? '', reps: '', done: false })),
      })),
    });
    setMode('strength');
    setStartedAt(Date.now());
  };
  const startCardio = (type) => { setCardio(c => ({ ...c, type: type || 'bike' })); setMode('cardio'); setStartedAt(Date.now()); };
  const startMobility = () => { setMode('mobility'); setStartedAt(Date.now()); };

  const startToday = () => {
    if (!todayPlan) return startCardio();
    if (todayPlan.type === 'strength') return startStrength(todayPlan.blocks);
    if (todayPlan.type === 'mobility') return startMobility();
    return startCardio(todayPlan.type === 'intervals' ? 'bike' : todayPlan.type === 'long' ? 'bike' : 'bike');
  };

  const setSetVal = (bi, si, field, val) => {
    setWork(w => {
      const blocks = w.blocks.map((b, i) => i !== bi ? b : {
        ...b,
        sets: b.sets.map((s, j) => j !== si ? s : { ...s, [field]: val }),
      });
      return { ...w, blocks };
    });
  };
  const toggleSetDone = (bi, si) => {
    setWork(w => {
      const blocks = w.blocks.map((b, i) => {
        if (i !== bi) return b;
        const sets = b.sets.map((s, j) => {
          if (j !== si) return s;
          // marking done with empty reps → prefill with bottom of range
          const reps = s.reps === '' && !s.done ? String(b.repRange[0]) : s.reps;
          return { ...s, reps, done: !s.done };
        });
        return { ...b, sets };
      });
      return { ...w, blocks };
    });
  };
  const addSet = (bi) => setWork(w => ({
    ...w,
    blocks: w.blocks.map((b, i) => i === bi ? { ...b, sets: [...b.sets, { ...b.sets[b.sets.length - 1], done: false }] } : b),
  }));
  const removeBlock = (bi) => setWork(w => ({ ...w, blocks: w.blocks.filter((_, i) => i !== bi) }));
  const addBlock = (ex) => {
    const last = lastPerformance(ex.id, sessions);
    setWork(w => ({
      ...w,
      blocks: [...w.blocks, {
        exerciseId: ex.id, name: ex.name, repRange: ex.repRange, unit: ex.unit || 'reps', note: null,
        sets: Array.from({ length: 3 }, () => ({ weight: last?.weight ?? '', reps: '', done: false })),
      }],
    }));
    setShowPicker(false);
  };

  const finish = async () => {
    const durationMin = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 60000)) : null;
    let session;
    if (mode === 'strength') {
      const exercises = work.blocks
        .map(b => ({ id: b.exerciseId, name: b.name, sets: b.sets.filter(s => s.done && Number(s.reps) > 0).map(s => ({ weight: Number(s.weight) || 0, reps: Number(s.reps) || 0, done: true })) }))
        .filter(e => e.sets.length > 0);
      if (exercises.length === 0) { toast('Nothing logged yet — check off at least one set', 'error'); return; }
      session = { date: todayStr, type: 'strength', title: todayPlan?.type === 'strength' ? todayPlan.title : 'Strength', exercises, durationMin, effort: effort + 1, notes };
    } else if (mode === 'cardio') {
      if (!cardio.durationMin) { toast('Add a duration', 'error'); return; }
      session = {
        date: todayStr, type: cardio.type, title: CARDIO_TYPES.find(t => t.id === cardio.type)?.label || 'Cardio',
        durationMin: Number(cardio.durationMin), distance: cardio.distance ? Number(cardio.distance) : null,
        avgHR: cardio.avgHR ? Number(cardio.avgHR) : null, effort: cardio.effort + 1, notes: cardio.notes,
      };
    } else {
      const doneItems = MOBILITY_ROUTINE.filter(m => mobilityDone[m.id]).map(m => m.name);
      session = { date: todayStr, type: 'mobility', title: 'Mobility & recovery', durationMin: durationMin || 15, items: doneItems, effort: 1, notes };
    }
    if (todayPlan && ((mode === 'strength' && todayPlan.type === 'strength') || (mode !== 'strength' && todayPlan.type !== 'strength'))) {
      session.planWeek = currentWeekStart;
      session.planDay = todayIdx;
    }
    try {
      const { prs } = await logSession(session);
      clearDraft();
      setMode(null); setWork(null); setNotes(''); setEffort(2); setMobilityDone({});
      setCardio({ type: 'bike', durationMin: '', distance: '', avgHR: '', effort: 2, notes: '' });
      if (prs?.length) toast(`🎉 New PR! ${prs.map(p => `${p.name}: ${p.weight}×${p.reps} (e1RM ${p.e1RM})`).join(' · ')}`, 'success');
      else toast('Session saved 💪', 'success');
    } catch (e) { console.error(e); toast('Save failed — try again', 'error'); }
  };

  const recent = sessions.slice(0, 8);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-5">
      {/* Readiness */}
      <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4">
        <ReadinessRing readiness={readiness} />
        <div className="flex-1 min-w-0">
          <div className="text-slate-200 font-semibold">{readiness.score != null ? readiness.detail : 'Readiness'}</div>
          <div className="text-xs text-slate-400 mt-1">
            {readiness.score == null ? readiness.detail : [
              readiness.sleepHrs != null && `😴 ${readiness.sleepHrs.toFixed(1)}h`,
              readiness.rhr != null && `❤️ ${Math.round(readiness.rhr)} bpm${readiness.rhrBase ? ` (avg ${Math.round(readiness.rhrBase)})` : ''}`,
              readiness.hrv != null && `📶 HRV ${Math.round(readiness.hrv)}`,
            ].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>

      {/* Today */}
      {!mode && (
        <div className="bg-slate-800 rounded-2xl p-5">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Today · {shortDate(todayStr)}</div>
          {todayPlan ? (
            <>
              <div className="text-xl font-bold text-slate-100">{todayPlan.emoji} {todayPlan.title}</div>
              {todayPlan.detail && <p className="text-sm text-slate-400 mt-1">{todayPlan.detail}</p>}
              {todayPlan.blocks?.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {todayPlan.blocks.map((b, i) => (
                    <li key={i} className="text-sm text-slate-300 flex justify-between">
                      <span>{b.name}</span>
                      <span className="text-slate-500">{b.sets}×{b.repRange?.[0]}-{b.repRange?.[1]}{b.weight ? ` @ ${b.weight}` : ''}</span>
                    </li>
                  ))}
                </ul>
              )}
              {todayPlan.status === 'done' ? (
                <div className="mt-4 text-emerald-400 font-semibold">✓ Done — nice work</div>
              ) : (
                <div className="mt-4 flex gap-2 flex-wrap">
                  <button onClick={startToday} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl">▶ Start session</button>
                  <button onClick={() => saveDay(currentWeekStart, todayIdx, { status: todayPlan.status === 'skipped' ? 'planned' : 'skipped' })} className="text-slate-400 hover:text-slate-200 px-3 py-2.5 text-sm">
                    {todayPlan.status === 'skipped' ? 'Un-skip' : 'Skip today'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-400 text-sm">No plan for today yet — it'll seed when the week loads, or log freestyle below.</div>
          )}
          <div className="mt-4 pt-3 border-t border-slate-700 flex gap-2 flex-wrap text-sm">
            <span className="text-slate-500 py-1.5">Freestyle:</span>
            <button onClick={() => startStrength(todayPlan?.type === 'strength' ? todayPlan.blocks : [])} className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg">💪 Lift</button>
            <button onClick={() => startCardio()} className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg">🚴 Cardio</button>
            <button onClick={startMobility} className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg">🧘 Mobility</button>
          </div>
        </div>
      )}

      {/* ===== Strength logger ===== */}
      {mode === 'strength' && work && (
        <div className="space-y-4">
          {work.blocks.map((b, bi) => {
            const pr = prMap[b.exerciseId];
            const cue = EXERCISE_MAP[b.exerciseId]?.cue;
            return (
              <div key={bi} className="bg-slate-800 rounded-2xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-100">{b.name}</div>
                    <div className="text-xs text-slate-500">{b.repRange[0]}-{b.repRange[1]} {b.unit}{pr ? ` · best e1RM ${pr.e1RM}` : ''}</div>
                    {b.note && <div className="text-xs text-amber-400 mt-0.5">{b.note}</div>}
                  </div>
                  <button onClick={() => removeBlock(bi)} className="text-slate-600 hover:text-red-400 text-sm px-1">✕</button>
                </div>
                {cue && <div className="text-xs text-slate-500 italic mt-1">{cue}</div>}
                <div className="mt-3 space-y-2">
                  {b.sets.map((s, si) => (
                    <div key={si} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-8">#{si + 1}</span>
                      <input type="number" inputMode="decimal" placeholder="lb" value={s.weight}
                        onChange={e => setSetVal(bi, si, 'weight', e.target.value)}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-slate-200 text-center" />
                      <span className="text-slate-600 text-xs">×</span>
                      <input type="number" inputMode="numeric" placeholder={b.unit === 'reps' ? 'reps' : b.unit} value={s.reps}
                        onChange={e => setSetVal(bi, si, 'reps', e.target.value)}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-slate-200 text-center" />
                      {Number(s.weight) > 0 && Number(s.reps) > 0 && b.unit === 'reps' && (
                        <span className="text-[10px] text-slate-600">e1RM {epleyE1RM(s.weight, s.reps)}</span>
                      )}
                      <button onClick={() => toggleSetDone(bi, si)}
                        className={`ml-auto w-10 h-10 rounded-xl font-bold ${s.done ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}>✓</button>
                    </div>
                  ))}
                </div>
                <button onClick={() => addSet(bi)} className="mt-2 text-xs text-blue-400">+ add set</button>
              </div>
            );
          })}
          <button onClick={() => setShowPicker(true)} className="w-full bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 text-slate-400 rounded-2xl py-3">+ Add exercise</button>
          <FinishBar effort={effort} setEffort={setEffort} notes={notes} setNotes={setNotes} onFinish={finish} onCancel={() => { clearDraft(); setMode(null); setWork(null); }} />
        </div>
      )}

      {/* ===== Cardio logger ===== */}
      {mode === 'cardio' && (
        <div className="bg-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {CARDIO_TYPES.map(t => (
              <button key={t.id} onClick={() => setCardio(c => ({ ...c, type: t.id }))}
                className={`px-3 py-2 rounded-xl text-sm ${cardio.type === t.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label className="text-xs text-slate-400">Minutes
              <input type="number" inputMode="numeric" value={cardio.durationMin} onChange={e => setCardio(c => ({ ...c, durationMin: e.target.value }))}
                className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-slate-200" />
            </label>
            <label className="text-xs text-slate-400">{cardio.type === 'swim' ? 'Meters' : 'Miles'}
              <input type="number" inputMode="decimal" value={cardio.distance} onChange={e => setCardio(c => ({ ...c, distance: e.target.value }))}
                className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-slate-200" />
            </label>
            <label className="text-xs text-slate-400">Avg HR
              <input type="number" inputMode="numeric" value={cardio.avgHR} onChange={e => setCardio(c => ({ ...c, avgHR: e.target.value }))}
                className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-slate-200" />
            </label>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Effort</div>
            <div className="flex gap-1.5 flex-wrap">
              {EFFORTS.map((e, i) => (
                <button key={i} onClick={() => setCardio(c => ({ ...c, effort: i }))}
                  className={`px-2.5 py-1.5 rounded-lg text-xs ${cardio.effort === i ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{e}</button>
              ))}
            </div>
            <div className="text-[10px] text-slate-600 mt-1">Zone 2 = "Steady" — you can talk in sentences but can't sing.</div>
          </div>
          <textarea placeholder="Notes…" value={cardio.notes} onChange={e => setCardio(c => ({ ...c, notes: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm" rows={2} />
          <div className="flex gap-2">
            <button onClick={finish} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl">Save session</button>
            <button onClick={() => { clearDraft(); setMode(null); }} className="px-4 text-slate-400">Cancel</button>
          </div>
        </div>
      )}

      {/* ===== Mobility logger ===== */}
      {mode === 'mobility' && (
        <div className="bg-slate-800 rounded-2xl p-5 space-y-3">
          {MOBILITY_ROUTINE.map(m => (
            <button key={m.id} onClick={() => setMobilityDone(d => ({ ...d, [m.id]: !d[m.id] }))}
              className={`w-full flex justify-between items-center px-3 py-2.5 rounded-xl text-sm ${mobilityDone[m.id] ? 'bg-emerald-900/40 text-emerald-300' : 'bg-slate-700/50 text-slate-300'}`}>
              <span>{mobilityDone[m.id] ? '✓ ' : ''}{m.name}</span>
              <span className="text-xs text-slate-500">{m.dose}</span>
            </button>
          ))}
          <FinishBar effort={effort} setEffort={setEffort} notes={notes} setNotes={setNotes} onFinish={finish} onCancel={() => { clearDraft(); setMode(null); }} hideEffort />
        </div>
      )}

      {/* Exercise picker */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center" onClick={() => setShowPicker(false)}>
          <div className="bg-slate-800 rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[75vh] overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="flex gap-1.5 flex-wrap mb-3">
              {EXERCISE_CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setPickerCat(c.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs ${pickerCat === c.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{c.emoji} {c.label}</button>
              ))}
            </div>
            {EXERCISES.filter(e => e.category === pickerCat).map(ex => (
              <button key={ex.id} onClick={() => addBlock(ex)} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-700 text-slate-200 text-sm flex justify-between">
                <span>{ex.name}</span>
                <span className="text-slate-500 text-xs">{ex.repRange[0]}-{ex.repRange[1]} {ex.unit || 'reps'}{prMap[ex.id] ? ` · PR ${prMap[ex.id].e1RM}` : ''}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {!mode && recent.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="text-sm font-semibold text-slate-300 mb-2">Recent sessions</div>
          <div className="space-y-2">
            {recent.map(s => (
              <div key={s.id} className="flex items-center justify-between text-sm bg-slate-900/50 rounded-xl px-3 py-2">
                <div className="min-w-0">
                  <span className="text-slate-200">{shortDate(s.date)} · {s.title || s.type}</span>
                  <span className="text-slate-500 text-xs ml-2">
                    {s.type === 'strength'
                      ? `${(s.exercises || []).length} exercises`
                      : `${s.durationMin || '?'} min${s.distance ? ` · ${s.distance}${s.type === 'swim' ? 'm' : 'mi'}` : ''}`}
                    {s.prs?.length ? ` · 🏆 ${s.prs.length} PR` : ''}
                  </span>
                </div>
                <button onClick={() => { if (confirm('Delete this session?')) deleteSession(s.id); }} className="text-slate-600 hover:text-red-400 px-1">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily habits (from the legacy checklist so history is preserved) */}
      {!mode && <DailyHabits data={data} />}
    </div>
  );
}

function ReadinessRing({ readiness }) {
  const score = readiness.score;
  const color = score == null ? '#475569' : score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171';
  const pct = score == null ? 0 : score / 100;
  const r = 26; const c = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1e293b" strokeWidth="7" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90 36 36)" />
      <text x="36" y="41" textAnchor="middle" fill={color} fontSize="18" fontWeight="700">{score ?? '–'}</text>
    </svg>
  );
}

function FinishBar({ effort, setEffort, notes, setNotes, onFinish, onCancel, hideEffort }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
      {!hideEffort && (
        <div className="flex gap-1.5 flex-wrap">
          {EFFORTS.map((e, i) => (
            <button key={i} onClick={() => setEffort(i)}
              className={`px-2.5 py-1.5 rounded-lg text-xs ${effort === i ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{e}</button>
          ))}
        </div>
      )}
      <textarea placeholder="How did it feel? Any tweaks for next time…" value={notes} onChange={e => setNotes(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm" rows={2} />
      <div className="flex gap-2">
        <button onClick={onFinish} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl">Finish & save</button>
        <button onClick={onCancel} className="px-4 text-slate-400">Discard</button>
      </div>
    </div>
  );
}

function DailyHabits({ data }) {
  // lightweight anchor habits; writes go through the page above via props if
  // needed later — for now this is read-only glanceable state from the legacy doc.
  const todayStr = toLocalDateStr();
  const checks = data?.dailyChecklist?.[todayStr] || {};
  const items = [
    { key: 'mobility', label: '🧘 10-min mobility' },
    { key: 'steps', label: '🚶 Steps target' },
    { key: 'sleep', label: '😴 7+ hrs sleep' },
  ];
  const done = items.filter(i => checks[i.key]).length;
  if (done === 0) return null;
  return (
    <div className="text-xs text-slate-500 text-center">Daily habits: {done}/{items.length} from the Dashboard checklist</div>
  );
}
