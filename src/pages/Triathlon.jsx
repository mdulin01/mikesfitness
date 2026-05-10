import { useState, useMemo, useEffect } from 'react';
import { toLocalDateStr } from '../utils/dateUtils';
import { wrightsvilleTriPlan } from '../data/triathlonPlan';

// Triathlon training page — full multi-week view of Mike's plan.
// Reads from sharedFitness (tripData/fitness) so check-offs and reflections
// persist to Firestore and stay in sync across devices/sessions.
//
// The plan stores ONLY bike + swim. Running workouts (from the active mikeandadam
// running plan) are also overlaid in each week so Mike sees the complete picture.

const PHASE_LABEL = {
  base: { label: 'Base', color: 'bg-blue-900/40 text-blue-300 border-blue-700/40' },
  build: { label: 'Build', color: 'bg-purple-900/40 text-purple-300 border-purple-700/40' },
  peak: { label: 'Peak', color: 'bg-orange-900/40 text-orange-300 border-orange-700/40' },
  taper: { label: 'Taper', color: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40' },
};

function ReflectionEditor({ week, onSave }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    wentWell: week.reflection?.wentWell || '',
    feeling: week.reflection?.feeling || '',
    notes: week.reflection?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const has = week.reflection?.wentWell || week.reflection?.feeling || week.reflection?.notes;

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(draft); } finally { setSaving(false); setOpen(false); }
  };

  return (
    <div className="mt-3 border-t border-slate-700/50 pt-3">
      <button onClick={() => setOpen(o => !o)}
        className="w-full text-left text-xs font-semibold text-slate-400 uppercase tracking-wide hover:text-slate-200 flex items-center justify-between">
        <span>📝 Weekly Reflection {has && <span className="text-emerald-400">·  saved</span>}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open ? (
        <div className="mt-2 space-y-2">
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wide">What went well?</label>
            <textarea value={draft.wentWell} onChange={e => setDraft(d => ({ ...d, wentWell: e.target.value }))}
              placeholder="The Saturday brick felt strong. Open water sighting clicked."
              rows={2}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-500 resize-none" />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wide">How are you feeling?</label>
            <textarea value={draft.feeling} onChange={e => setDraft(d => ({ ...d, feeling: e.target.value }))}
              placeholder="Tired but recovering well. Sleep quality has been good."
              rows={2}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-500 resize-none" />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wide">Other notes</label>
            <textarea value={draft.notes} onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
              placeholder="Skipped Tuesday swim — pool was closed. Made it up Wednesday."
              rows={2}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-500 resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="text-xs text-slate-400 px-3 py-1.5">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-medium disabled:opacity-50">
              {saving ? 'Saving…' : 'Save reflection'}
            </button>
          </div>
        </div>
      ) : has ? (
        <div className="mt-2 text-xs text-slate-400 space-y-1">
          {week.reflection.wentWell && <div><span className="text-emerald-400">✓</span> {week.reflection.wentWell}</div>}
          {week.reflection.feeling && <div><span className="text-blue-400">💭</span> {week.reflection.feeling}</div>}
          {week.reflection.notes && <div><span className="text-slate-500">📝</span> {week.reflection.notes}</div>}
        </div>
      ) : null}
    </div>
  );
}

function WorkoutRow({ workout, type, onToggle }) {
  const done = !!workout.mike;
  const emoji = type === 'bikes' ? '🚴' : type === 'swims' ? '🏊' : type === 'runs' ? '🏃' : '💪';
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg text-sm transition ${
      done ? 'bg-emerald-900/30 border border-emerald-700/40' : 'bg-slate-700/40 border border-slate-700'
    }`}>
      <button onClick={onToggle}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
          done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 hover:border-slate-300'
        }`}>
        {done && <span className="text-white text-xs font-bold">✓</span>}
      </button>
      <span className="text-base">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className={`font-medium truncate ${done ? 'text-emerald-300 line-through' : 'text-white'}`}>{workout.label}</div>
        {(workout.distance || workout.duration) && (
          <div className="text-[11px] text-slate-400">
            {workout.distance}{workout.duration ? ` · ${workout.duration}` : ''}
          </div>
        )}
        {workout.notes && <div className="text-[11px] text-slate-500 mt-0.5">{workout.notes}</div>}
      </div>
    </div>
  );
}

export default function Triathlon({ sharedFitness, toggleSharedWorkout, saveTriReflection, triEventId, ...rest }) {
  const tri = sharedFitness?.events?.find(e => e.id === triEventId);
  const plan = sharedFitness?.trainingPlans?.[triEventId] || wrightsvilleTriPlan;
  const todayStr = toLocalDateStr();

  const currentWeekIdx = useMemo(() => plan.findIndex(w => w.startDate <= todayStr && w.endDate >= todayStr), [plan, todayStr]);
  const [expandedWeek, setExpandedWeek] = useState(currentWeekIdx >= 0 ? plan[currentWeekIdx]?.id : null);

  // Re-anchor expansion to current week if it changes
  useEffect(() => {
    if (currentWeekIdx >= 0 && !expandedWeek) setExpandedWeek(plan[currentWeekIdx]?.id);
  }, [currentWeekIdx, plan, expandedWeek]);

  // Race countdown
  const raceDate = tri?.date ? new Date(tri.date + 'T12:00:00') : null;
  const daysToRace = raceDate ? Math.ceil((raceDate - new Date()) / 86400000) : null;
  const weeksToRace = daysToRace != null ? Math.ceil(daysToRace / 7) : null;

  // Plan-wide stats
  const planStats = useMemo(() => {
    let totalWorkouts = 0, doneWorkouts = 0, totalSwimYds = 0, totalBikeMi = 0;
    let doneSwimYds = 0, doneBikeMi = 0;
    for (const week of plan) {
      for (const b of (week.bikes || [])) {
        totalWorkouts++;
        const mi = parseFloat(String(b.distance || '').match(/[\d.]+/)?.[0] || 0);
        totalBikeMi += mi;
        if (b.mike) { doneWorkouts++; doneBikeMi += mi; }
      }
      for (const s of (week.swims || [])) {
        totalWorkouts++;
        const yds = parseFloat(String(s.distance || '').match(/[\d.]+/)?.[0] || 0);
        totalSwimYds += yds;
        if (s.mike) { doneWorkouts++; doneSwimYds += yds; }
      }
    }
    return { totalWorkouts, doneWorkouts, totalSwimYds, totalBikeMi, doneSwimYds, doneBikeMi };
  }, [plan]);

  // Pull running workouts from mikeandadam plans for the same week date range
  const runsForWeek = (week) => {
    const out = [];
    for (const event of (sharedFitness?.events || [])) {
      if (event.id === triEventId) continue; // skip own plan
      const runPlan = sharedFitness?.trainingPlans?.[event.id];
      if (!runPlan) continue;
      const matching = runPlan.find(w => w.startDate === week.startDate || (w.startDate <= week.startDate && w.endDate >= week.endDate));
      if (matching?.runs) {
        for (const r of matching.runs) {
          out.push({ ...r, _eventId: event.id, _weekId: matching.id, _eventName: event.name });
        }
      }
    }
    return out;
  };

  const onToggleTriWorkout = (week, type, workout) => toggleSharedWorkout(triEventId, week.id, type, workout.id, 'mike');
  const onToggleRun = (run) => toggleSharedWorkout(run._eventId, run._weekId, 'runs', run.id, 'mike');

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5 pb-24 md:pb-6">
      {/* Hero */}
      <div className={`rounded-2xl bg-gradient-to-br ${tri?.color || 'from-blue-400 to-cyan-500'} p-5`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-white/80 text-xs uppercase tracking-widest">Training For</div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{tri?.name || 'Wrightsville Beach Sprint Tri'}</h1>
            <p className="text-white/80 text-sm">📍 {tri?.location || 'Wrightsville Beach, NC'} · {tri?.date ? new Date(tri.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}</p>
            <div className="text-white/70 text-xs mt-1">🏊 {tri?.swim || '1500m ocean'} · 🚴 {tri?.bike || '~12 mi'} · 🏃 {tri?.run || '5K'}</div>
          </div>
          {daysToRace != null && (
            <div className="text-right text-white">
              <div className="text-3xl font-bold leading-none">{daysToRace > 0 ? daysToRace : 0}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/80">days to go</div>
              {weeksToRace != null && weeksToRace > 0 && <div className="text-[10px] text-white/60 mt-0.5">≈ {weeksToRace} weeks</div>}
            </div>
          )}
        </div>
      </div>

      {/* Plan-wide stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
          <div className="text-xs text-slate-400">Workouts done</div>
          <div className="text-xl font-bold text-white">{planStats.doneWorkouts}<span className="text-sm text-slate-500">/{planStats.totalWorkouts}</span></div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
          <div className="text-xs text-slate-400">Swim yards</div>
          <div className="text-xl font-bold text-cyan-400">{planStats.doneSwimYds.toLocaleString()}<span className="text-sm text-slate-500">/{planStats.totalSwimYds.toLocaleString()}</span></div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
          <div className="text-xs text-slate-400">Bike miles</div>
          <div className="text-xl font-bold text-orange-400">{planStats.doneBikeMi.toLocaleString()}<span className="text-sm text-slate-500">/{planStats.totalBikeMi.toLocaleString()}</span></div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
          <div className="text-xs text-slate-400">Plan length</div>
          <div className="text-xl font-bold text-white">{plan.length} <span className="text-sm text-slate-500">weeks</span></div>
        </div>
      </div>

      {/* Weekly accordion */}
      <div className="space-y-2">
        {plan.map((week, idx) => {
          const isExpanded = expandedWeek === week.id;
          const isCurrent = idx === currentWeekIdx;
          const isPast = week.endDate < todayStr;
          const phase = PHASE_LABEL[week.phase] || PHASE_LABEL.base;
          const weekRuns = runsForWeek(week);
          const allWorkouts = [
            ...(week.bikes || []),
            ...(week.swims || []),
            ...weekRuns,
          ];
          const doneCount = allWorkouts.filter(w => w.mike).length;
          const totalCount = allWorkouts.length;
          const doneRatio = totalCount > 0 ? doneCount / totalCount : 0;

          return (
            <div key={week.id} className={`rounded-xl border overflow-hidden transition-all ${
              isCurrent ? 'bg-blue-900/20 border-blue-700' :
              isPast ? 'bg-slate-800/50 border-slate-700' :
              'bg-slate-800 border-slate-700'
            }`}>
              <button onClick={() => setExpandedWeek(isExpanded ? null : week.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-700/30 transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold ${isCurrent ? 'text-blue-300' : isPast ? 'text-slate-400' : 'text-white'}`}>Week {week.weekNumber}</span>
                    <span className="text-xs text-slate-500">{week.startDate} → {week.endDate}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${phase.color}`}>{phase.label}</span>
                    {isCurrent && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">THIS WEEK</span>}
                    {week.isRaceWeek && <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded-full font-semibold">🏁 RACE</span>}
                  </div>
                  {week.weekNotes && <div className="text-xs text-slate-400 mt-1 truncate">{week.weekNotes}</div>}
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">{doneCount}/{totalCount}</div>
                  <div className="w-16 h-1 bg-slate-700 rounded-full mt-1">
                    <div className="h-1 bg-emerald-500 rounded-full transition-all" style={{ width: `${doneRatio * 100}%` }} />
                  </div>
                </div>
                <span className="text-slate-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 border-t border-slate-700/50 pt-3 space-y-3">
                  {weekRuns.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">🏃 Runs <span className="text-slate-600 font-normal">(from {weekRuns[0]?._eventName || 'running plan'})</span></h4>
                      <div className="space-y-1.5">
                        {weekRuns.map(r => (
                          <WorkoutRow key={`${r._eventId}-${r.id}`} workout={r} type="runs" onToggle={() => onToggleRun(r)} />
                        ))}
                      </div>
                    </div>
                  )}
                  {(week.bikes || []).length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">🚴 Bike</h4>
                      <div className="space-y-1.5">
                        {week.bikes.map(b => (
                          <WorkoutRow key={b.id} workout={b} type="bikes" onToggle={() => onToggleTriWorkout(week, 'bikes', b)} />
                        ))}
                      </div>
                    </div>
                  )}
                  {(week.swims || []).length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">🏊 Swim</h4>
                      <div className="space-y-1.5">
                        {week.swims.map(s => (
                          <WorkoutRow key={s.id} workout={s} type="swims" onToggle={() => onToggleTriWorkout(week, 'swims', s)} />
                        ))}
                      </div>
                    </div>
                  )}
                  <ReflectionEditor week={week} onSave={(r) => saveTriReflection(triEventId, week.id, r)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
