import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toLocalDateStr } from '../utils/dateUtils';
import { motivationalQuotes } from '../data/exercisePlan';
import { fitnessPlan } from '../data/fitnessPlan';
import PhysicalMetrics from '../components/PhysicalMetrics';
import {
  readinessFrom, weekDates, weeklyPillarSummary, computeStreaks, shortDate, addDays,
} from '../utils/training';

export default function Dashboard(props) {
  const {
    data, toggleDailyItem, dailyMetricsByDate, lastDailyMetricsSync,
    sharedFitness, training,
  } = props;
  const { plans, sessions, coach, currentWeekStart } = training;
  const todayStr = toLocalDateStr();

  const readiness = useMemo(() => readinessFrom(dailyMetricsByDate, todayStr), [dailyMetricsByDate, todayStr]);
  const weekPlan = plans[currentWeekStart];
  const todayPlan = weekPlan?.days?.find(d => d.date === todayStr);
  const dates = weekDates(currentWeekStart);
  const pillars = useMemo(() => weeklyPillarSummary(sessions, dates), [sessions, dates]);
  const streaks = useMemo(() => computeStreaks(sessions, dailyMetricsByDate, todayStr), [sessions, dailyMetricsByDate, todayStr]);

  const quote = useMemo(() => {
    const dayNum = Math.floor(new Date(todayStr + 'T12:00:00').getTime() / 86400000);
    return motivationalQuotes[dayNum % motivationalQuotes.length];
  }, [todayStr]);

  // Recent PRs (14 days)
  const recentPRs = useMemo(() => {
    const cutoff = addDays(todayStr, -14);
    const out = [];
    for (const s of sessions) {
      if (s.date < cutoff) break;
      for (const p of s.prs || []) out.push({ ...p, date: s.date });
    }
    return out.slice(0, 4);
  }, [sessions, todayStr]);

  // Upcoming races: local fitness appointments + shared events (dedupe by date)
  const races = useMemo(() => {
    const local = (data?.appointments || [])
      .filter(a => a.category === 'fitness' && a.date && a.date >= todayStr && a.status !== 'cancelled')
      .map(a => ({ id: a.id, name: a.notes || a.type, date: a.date, emoji: '🏅', location: a.location }));
    const shared = (sharedFitness?.events || [])
      .filter(e => e.date && e.date >= todayStr)
      .map(e => ({ id: e.id, name: e.name, date: e.date, emoji: e.emoji || '🏊', location: e.location }));
    const seen = new Set();
    return [...shared, ...local]
      .filter(r => { const k = r.date; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  }, [data?.appointments, sharedFitness, todayStr]);

  const checks = data?.dailyChecklist?.[todayStr] || {};
  const habits = [
    { key: 'mobility', label: '🧘 Mobility 10 min' },
    { key: 'steps', label: `🚶 ${(fitnessPlan.exerciseTargets.stepsPerDay / 1000)}k steps` },
    { key: 'protein', label: `🥩 ${fitnessPlan.proteinTargetG}g protein` },
    { key: 'sleep', label: '😴 7+ hrs sleep' },
  ];
  const stepsToday = dailyMetricsByDate?.[todayStr]?.activity?.steps;

  const daysUntil = (dateStr) => Math.round((new Date(dateStr + 'T12:00:00') - new Date(todayStr + 'T12:00:00')) / 86400000);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-5">
      {/* Hero: readiness + today */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-800/60 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            {todayPlan ? (
              <>
                <div className="text-xl font-bold text-slate-100 mt-1 truncate">{todayPlan.emoji} {todayPlan.title}</div>
                {todayPlan.status === 'done'
                  ? <div className="text-emerald-400 text-sm mt-1 font-semibold">✓ Done — nice work</div>
                  : <Link to="/train" className="inline-block mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl">▶ Start session</Link>}
              </>
            ) : (
              <div className="text-slate-300 mt-1">Plan seeds when you open <Link to="/train" className="text-blue-400">Train</Link></div>
            )}
          </div>
          <div className="text-center shrink-0">
            <div className={`text-3xl font-bold ${readiness.score == null ? 'text-slate-600' : readiness.score >= 80 ? 'text-emerald-400' : readiness.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
              {readiness.score ?? '–'}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">readiness</div>
          </div>
        </div>
        {readiness.score != null && <div className="text-xs text-slate-500 mt-2">{readiness.detail}</div>}
      </div>

      {/* Rupert coach note */}
      {coach?.note && (
        <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-2xl p-4 text-sm text-emerald-200">
          🦚 <span className="font-semibold">Coach:</span> {coach.note}
          {coach.updatedAt && <span className="text-[10px] text-emerald-500/70 ml-2">{String(coach.updatedAt).slice(0, 10)}</span>}
        </div>
      )}

      {/* Week at a glance */}
      {weekPlan && (
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-slate-300">This week</div>
            <Link to="/plan" className="text-xs text-blue-400">Edit plan →</Link>
          </div>
          <div className="flex gap-1.5">
            {weekPlan.days.map((d, i) => {
              const isToday = d.date === todayStr;
              const past = d.date < todayStr;
              return (
                <div key={i} className={`flex-1 rounded-xl py-2 text-center ${isToday ? 'ring-1 ring-blue-500/60 bg-slate-700/50' : 'bg-slate-900/40'}`}>
                  <div className="text-[9px] text-slate-500">{d.day.slice(0, 3)}</div>
                  <div className="text-base">{d.status === 'done' ? '✅' : d.status === 'skipped' ? '⏭️' : past ? '·' : d.emoji}</div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-3 text-xs text-slate-500">
            <span>💪 {pillars.strengthSessions}/{fitnessPlan.exerciseTargets.strengthDays} strength</span>
            <span>🫀 {pillars.enduranceMin}/{fitnessPlan.exerciseTargets.cardioMinutes} cardio min</span>
            <span>🧘 {pillars.mobilityMin}/{fitnessPlan.exerciseTargets.mobilityMinutes} mobility min</span>
          </div>
        </div>
      )}

      {/* Streaks + PRs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-500 mb-1">Streaks</div>
          <div className="text-slate-100 font-bold text-lg">🔥 {streaks.moveStreak} <span className="text-xs font-normal text-slate-500">day move streak</span></div>
          <div className="text-slate-300 text-sm mt-1">📆 {streaks.weekStreak} <span className="text-xs text-slate-500">weeks at 4+ sessions</span></div>
        </div>
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-500 mb-1">Recent PRs</div>
          {recentPRs.length === 0
            ? <div className="text-sm text-slate-500">None in 14 days — the next lift day is a chance 😉</div>
            : recentPRs.map((p, i) => (
              <div key={i} className="text-sm text-slate-200 truncate">🏆 {p.name} <span className="text-slate-500 text-xs">{p.weight}×{p.reps}</span></div>
            ))}
        </div>
      </div>

      {/* Daily habits */}
      <div className="bg-slate-800 rounded-2xl p-4">
        <div className="text-sm font-semibold text-slate-300 mb-2">Today's anchors {stepsToday != null && <span className="text-xs text-slate-500 font-normal">· {stepsToday.toLocaleString()} steps so far</span>}</div>
        <div className="grid grid-cols-2 gap-2">
          {habits.map(h => (
            <button key={h.key} onClick={() => toggleDailyItem(todayStr, h.key)}
              className={`px-3 py-2.5 rounded-xl text-sm text-left ${checks[h.key] ? 'bg-emerald-900/40 text-emerald-300' : 'bg-slate-700/50 text-slate-300'}`}>
              {checks[h.key] ? '✓ ' : ''}{h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body metrics (Apple Health + manual, existing component) */}
      <PhysicalMetrics data={data} dailyMetricsByDate={dailyMetricsByDate} lastDailyMetricsSync={lastDailyMetricsSync} />

      {/* Upcoming races */}
      {races.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-4">
          <div className="text-sm font-semibold text-slate-300 mb-2">🏁 On the calendar</div>
          {races.map(r => (
            <div key={r.id} className="flex justify-between items-center text-sm py-1.5">
              <span className="text-slate-200">{r.emoji} {r.name}</span>
              <span className="text-slate-500 text-xs">{shortDate(r.date)} · {daysUntil(r.date)}d</span>
            </div>
          ))}
        </div>
      )}

      {/* North star + quote */}
      <div className="bg-slate-800/60 rounded-2xl p-4">
        <div className="flex gap-2 flex-wrap">
          {fitnessPlan.northStar.map(t => (
            <span key={t.label} className="text-[11px] bg-slate-900/60 text-slate-400 px-2 py-1 rounded-lg">{t.label}: <span className="text-slate-300">{t.value}</span></span>
          ))}
        </div>
        <p className="text-xs text-slate-500 italic mt-3">"{quote.text}"{quote.author ? ` — ${quote.author}` : ''}</p>
      </div>

      {/* Federated apps */}
      <div className="flex justify-center gap-4 text-xs text-slate-600">
        <a href="https://mikesnutrition.app" target="_blank" rel="noreferrer" className="hover:text-slate-400">🥗 Nutrition →</a>
        <a href="https://mikeshealth.app" target="_blank" rel="noreferrer" className="hover:text-slate-400">❤️ Health →</a>
      </div>
    </div>
  );
}
