import { useState, useMemo } from 'react';
import TrendChart from '../components/TrendChart';
import { appleSeries } from '../utils/appleHealth';
import { toLocalDateStr } from '../utils/dateUtils';
import { addDays, weekStartOf, weekDates, weeklyPillarSummary, shortDate } from '../utils/training';
import { fitnessPlan } from '../data/fitnessPlan';

export default function Progress({ training, dailyMetricsByDate, data }) {
  const { sessions, prMap } = training;
  const todayStr = toLocalDateStr();

  // ---- Exercise strength trends ----
  const exercisesWithHistory = useMemo(() =>
    Object.entries(prMap)
      .filter(([, v]) => v.history.length >= 1)
      .sort((a, b) => b[1].history[b[1].history.length - 1].date.localeCompare(a[1].history[a[1].history.length - 1].date)),
    [prMap]);
  const [selectedEx, setSelectedEx] = useState(null);
  const activeEx = selectedEx || exercisesWithHistory[0]?.[0] || null;
  const exSeries = activeEx && prMap[activeEx]
    ? prMap[activeEx].history.map(h => ({ label: shortDate(h.date), value: h.e1RM }))
    : [];

  // ---- Weekly pillar volume, last 8 weeks ----
  const weeks = useMemo(() => {
    const out = [];
    let ws = weekStartOf(todayStr);
    for (let i = 0; i < 8; i++) {
      const dates = weekDates(ws);
      const sum = weeklyPillarSummary(sessions, dates);
      // add Apple Health workouts not logged in-app? Keep in-app truth for now.
      out.unshift({ weekStart: ws, ...sum });
      ws = addDays(ws, -7);
    }
    return out;
  }, [sessions, todayStr]);
  const maxMin = Math.max(60, ...weeks.map(w => w.strengthMin + w.enduranceMin + w.mobilityMin));

  // ---- Body comp ----
  const manualWeights = (data?.weightEntries || []).map(w => ({ date: w.date, value: Number(w.weight) })).filter(w => w.value > 0);
  const appleWeights = appleSeries(dailyMetricsByDate, 'vitals.weightLbs', 365);
  const weightSeries = useMemo(() => {
    const byDate = {};
    for (const w of [...manualWeights, ...appleWeights]) byDate[w.date] = w.value;
    return Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ label: shortDate(date), value: Math.round(value * 10) / 10 })).slice(-60);
  }, [manualWeights, appleWeights]);
  const bfSeries = appleSeries(dailyMetricsByDate, 'vitals.bodyFatPct', 365)
    .map(p => ({ label: shortDate(p.date), value: Math.round((p.value <= 1 ? p.value * 100 : p.value) * 10) / 10 })).slice(-60);
  const leanSeries = appleSeries(dailyMetricsByDate, 'vitals.leanBodyMassLbs', 365)
    .map(p => ({ label: shortDate(p.date), value: Math.round(p.value * 10) / 10 })).slice(-60);
  const vo2 = appleSeries(dailyMetricsByDate, 'fitness.vo2max', 730);

  const prBoard = useMemo(() =>
    Object.entries(prMap)
      .sort((a, b) => b[1].e1RM - a[1].e1RM)
      .slice(0, 12),
    [prMap]);

  const [bodyTab, setBodyTab] = useState('weight');
  const bodySeries = bodyTab === 'weight' ? weightSeries : bodyTab === 'bf' ? bfSeries : leanSeries;
  const bodyGoal = bodyTab === 'weight' ? fitnessPlan.weightGoals.target : bodyTab === 'bf' ? fitnessPlan.weightGoals.bodyFatTarget : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-5">
      {/* Strength: e1RM trend */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <div className="text-sm font-semibold text-slate-300 mb-2">💪 Strength — estimated 1-rep max</div>
        {exercisesWithHistory.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">Log your first strength session on the Train tab and trends appear here.</p>
        ) : (
          <>
            <div className="flex gap-1.5 flex-wrap mb-3">
              {exercisesWithHistory.slice(0, 10).map(([id, v]) => (
                <button key={id} onClick={() => setSelectedEx(id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs ${activeEx === id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {v.name}
                </button>
              ))}
            </div>
            <TrendChart data={exSeries} color="#60a5fa" label={prMap[activeEx]?.name} unit="lb e1RM" />
            {prMap[activeEx] && (
              <div className="text-xs text-slate-500 mt-1 text-center">
                Best: {prMap[activeEx].weight} lb × {prMap[activeEx].reps} on {prMap[activeEx].date} (e1RM {prMap[activeEx].e1RM})
              </div>
            )}
          </>
        )}
      </div>

      {/* PR board */}
      {prBoard.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="text-sm font-semibold text-slate-300 mb-2">🏆 PR board</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {prBoard.map(([id, v]) => (
              <div key={id} className="bg-slate-900/50 rounded-xl px-3 py-2">
                <div className="text-xs text-slate-400 truncate">{v.name}</div>
                <div className="text-slate-100 font-bold">{v.e1RM} <span className="text-[10px] text-slate-500 font-normal">e1RM</span></div>
                <div className="text-[10px] text-slate-600">{v.weight}×{v.reps} · {shortDate(v.date)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly volume by pillar */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <div className="text-sm font-semibold text-slate-300 mb-1">📊 Weekly training minutes</div>
        <div className="text-[10px] text-slate-600 mb-3">
          <span className="text-blue-400">■</span> strength · <span className="text-emerald-400">■</span> endurance · <span className="text-purple-400">■</span> mobility
          &nbsp;— target {fitnessPlan.exerciseTargets.cardioMinutes}+ cardio min, {fitnessPlan.exerciseTargets.strengthDays} strength days
        </div>
        <div className="flex items-end gap-1.5 h-32">
          {weeks.map((w) => {
            const total = w.strengthMin + w.enduranceMin + w.mobilityMin;
            return (
              <div key={w.weekStart} className="flex-1 flex flex-col justify-end items-stretch gap-px" title={`${shortDate(w.weekStart)}: ${total} min, ${w.sessions} sessions`}>
                {w.mobilityMin > 0 && <div className="bg-purple-400/80 rounded-sm" style={{ height: `${(w.mobilityMin / maxMin) * 100}%` }} />}
                {w.enduranceMin > 0 && <div className="bg-emerald-400/80 rounded-sm" style={{ height: `${(w.enduranceMin / maxMin) * 100}%` }} />}
                {w.strengthMin > 0 && <div className="bg-blue-400/80 rounded-sm" style={{ height: `${(w.strengthMin / maxMin) * 100}%` }} />}
                {total === 0 && <div className="bg-slate-700 rounded-sm h-1" />}
              </div>
            );
          })}
        </div>
        <div className="flex gap-1.5 mt-1">
          {weeks.map(w => <div key={w.weekStart} className="flex-1 text-center text-[9px] text-slate-600">{shortDate(w.weekStart)}</div>)}
        </div>
      </div>

      {/* Body composition */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold text-slate-300">⚖️ Body composition</div>
          <div className="flex gap-1">
            {[['weight', 'Weight'], ['bf', 'Body fat %'], ['lean', 'Lean mass']].map(([id, label]) => (
              <button key={id} onClick={() => setBodyTab(id)}
                className={`px-2 py-1 rounded-lg text-[11px] ${bodyTab === id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>{label}</button>
            ))}
          </div>
        </div>
        <TrendChart data={bodySeries} goalValue={bodyGoal} color="#34d399" unit={bodyTab === 'bf' ? '%' : 'lb'} label="" />
      </div>

      {/* Engine: VO2max */}
      {vo2.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="text-sm font-semibold text-slate-300 mb-2">🫀 VO₂max (Apple Watch estimate)</div>
          <TrendChart data={vo2.map(p => ({ label: shortDate(p.date), value: p.value })).slice(-40)} color="#f472b6" unit="ml/kg/min" label="" />
          <div className="text-[10px] text-slate-600 mt-1 text-center">The single best-correlated number with longevity. Intervals on Thursdays move it.</div>
        </div>
      )}
    </div>
  );
}
