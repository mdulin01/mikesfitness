// Isolated development fixture: no auth, Firebase imports or network data writes.
import { useState, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import '../../src/index.css';
import { ToastProvider } from '../../src/components/Toast';
import PlanWeek from '../../src/pages/PlanWeek';
import Train from '../../src/pages/Train';
import Triathlon from '../../src/pages/Triathlon';
import { buildWeekFromTemplate } from '../../src/data/programTemplate';
import { planForWrite } from '../../src/utils/planRollout';
import { normalizeNextRace } from '../../src/utils/triathlon';

const currentWeekStart = '2026-10-26';
const effectiveDate = '2026-10-25';
const makeWeek = week => buildWeekFromTemplate(week, undefined, { effectiveDate });
export default function Preview() {
  const [plans, setPlans] = useState(() => ({ [currentWeekStart]: makeWeek(currentWeekStart) }));
  const [sessions, setSessions] = useState([]);
  const [nextRace, setNextRace] = useState(null);
  const ensureWeek = useCallback(week => setPlans(p => p[week] ? p : { ...p, [week]: makeWeek(week) }), []);
  const saveDay = useCallback(async (week, index, updates) => setPlans(p => ({ ...p, [week]: { ...p[week], days: p[week].days.map((d, i) => i === index ? { ...d, ...updates } : d) } })), []);
  const regenerateWeek = async week => {
    const fresh = planForWrite({ existing: plans[week], weekStart: week, today: currentWeekStart, effectiveDate, regenerate: true });
    if (fresh) setPlans(p => ({ ...p, [week]: fresh }));
    return !!fresh;
  };
  const logSession = async session => {
    const id = `synthetic-${sessions.length}`;
    setSessions(s => [{ ...session, id }, ...s]);
    if (session.planDay != null) await saveDay(session.planWeek, session.planDay, { status: 'done', sessionId: id });
    return { id, prs: [] };
  };
  const training = { plans, sessions, currentWeekStart, effectiveDate, ensureWeek, regenerateWeek, saveDay, logSession,
    deleteSession: async () => {}, prMap: {}, coach: null, nextRace,
    saveNextRace: async race => setNextRace(normalizeNextRace(race, currentWeekStart)) };
  const page = new URLSearchParams(window.location.search).get('page') || 'plan';
  return <BrowserRouter><ToastProvider><div className="min-h-screen bg-slate-900 text-slate-100">
    <header className="px-4 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 max-w-4xl mx-auto">
      <div><div className="font-semibold">💪 Mike's Fitness</div><div className="text-[10px] text-slate-500">Synthetic review preview</div></div>
      <nav className="flex gap-4 text-sm text-slate-400">{['plan', 'train', 'triathlon'].map(p => <a key={p} href={`?page=${p}`} className={page === p ? 'text-emerald-300' : ''}>{p === 'triathlon' ? 'Triathlon' : p === 'train' ? 'Train' : 'Plan'}</a>)}</nav>
    </header>
    {page === 'triathlon' ? <Triathlon sharedFitness={{ events: [], trainingPlans: {} }} training={training} toggleSharedWorkout={async () => {}} saveTriReflection={async () => {}} />
      : page === 'train' ? <Train training={training} data={{}} dailyMetricsByDate={{}} /> : <PlanWeek training={training} />}
  </div></ToastProvider></BrowserRouter>;
}
