import { healthPlan } from '../data/healthPlan';
import { exercisePlan } from '../data/exercisePlan';

export default function Plan() {
  return (
    <div className="max-w-4xl mx-auto px-3 py-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-white">🎯 10-Year Health Plan</h1>
      <p className="text-slate-400">Age 59–69 · Built around <strong className="text-slate-300">cardio + muscle + brain + inflammation + cancer prevention</strong></p>

      {/* Risks */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-white mb-3">1. The Big Goals (What We're Preventing)</h2>
        <div className="space-y-2">
          {healthPlan.risks.map(r => (
            <div key={r.risk} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg text-sm">
              <span className="font-medium text-white">{r.risk}</span>
              <span className="text-slate-400">{r.why}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Medications & Supplements */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-white mb-3">2. Prevention Stack (Meds & Supplements)</h2>
        <p className="text-xs text-slate-400 mb-3">Common longevity medicine stack. Discuss with your physician.</p>
        <div className="space-y-2">
          {healthPlan.medications.map(m => (
            <div key={m.name} className="flex justify-between items-start p-3 bg-slate-700/50 rounded-lg text-sm">
              <div>
                <div className="font-medium text-white">💊 {m.name}</div>
                <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full">{m.category}</span>
              </div>
              <span className="text-slate-400 text-right">{m.why}</span>
            </div>
          ))}
          {healthPlan.supplements.map(s => (
            <div key={s.name} className="flex justify-between items-start p-3 bg-slate-700/50 rounded-lg text-sm">
              <div>
                <div className="font-medium text-white">🧪 {s.name}</div>
                <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full">supplement</span>
              </div>
              <span className="text-slate-400 text-right">{s.why}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lab Schedule */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-white mb-3">3. Lab Schedule</h2>
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">Every 6 Months</h3>
            <div className="flex flex-wrap gap-2">
              {healthPlan.labSchedule.every6Months.map(l => (
                <span key={l} className="bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">{l}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">Crohn's Monitoring</h3>
            <div className="flex flex-wrap gap-2">
              {healthPlan.labSchedule.crohns.map(l => (
                <span key={l} className="bg-purple-900/40 text-purple-300 px-3 py-1 rounded-full text-xs font-medium">{l}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">Every 3 Years</h3>
            <div className="flex flex-wrap gap-2">
              {healthPlan.labSchedule.every3Years.map(l => (
                <span key={l} className="bg-green-900/40 text-green-300 px-3 py-1 rounded-full text-xs font-medium">{l}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">Every 5 Years</h3>
            <div className="flex flex-wrap gap-2">
              {healthPlan.labSchedule.every5Years.map(l => (
                <span key={l} className="bg-amber-900/40 text-amber-300 px-3 py-1 rounded-full text-xs font-medium">{l}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">Yearly</h3>
            <div className="flex flex-wrap gap-2">
              {healthPlan.labSchedule.yearly.map(l => (
                <span key={l} className="bg-rose-900/40 text-rose-300 px-3 py-1 rounded-full text-xs font-medium">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exercise */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-white mb-3">5. Exercise (This Is Huge)</h2>
        <p className="text-sm text-slate-400 mb-3">The formula is actually simple: Lift heavy + get out of breath + walk a lot.</p>
        <div className="space-y-2">
          {exercisePlan.formula.map(f => (
            <div key={f} className="flex items-center gap-2 p-2 bg-green-900/30 rounded text-sm text-green-300">
              <span>✓</span> {f}
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm text-slate-400">
          Total: <strong className="text-slate-300">{exercisePlan.totalHoursPerWeek} hours/week</strong>
        </div>
      </div>

      {/* Weight */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-white mb-3">7. Weight</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-700/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{healthPlan.weightGoals.current}</div>
            <div className="text-xs text-slate-400">Current</div>
          </div>
          <div className="p-3 bg-green-900/30 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">{healthPlan.weightGoals.target}</div>
            <div className="text-xs text-slate-400">Target</div>
          </div>
          <div className="p-3 bg-blue-900/30 rounded-lg text-center">
            <div className="text-lg font-bold text-blue-400">{healthPlan.weightGoals.waistTarget}</div>
            <div className="text-xs text-slate-400">Waist</div>
          </div>
        </div>
      </div>

      {/* Sleep */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-white mb-3">10. Sleep</h2>
        <div className="text-sm">
          <div className="font-medium text-white mb-2">{healthPlan.sleepGoals.hours}+ hours per night</div>
          <ul className="space-y-1 text-slate-300">
            {healthPlan.sleepGoals.notes.map(n => <li key={n}>• {n}</li>)}
          </ul>
        </div>
      </div>

      {/* Outcomes */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white">
        <h2 className="font-semibold mb-3">At Age 69: The Goal</h2>
        <div className="space-y-2">
          {healthPlan.outcomes.atAge69.map(o => (
            <div key={o} className="flex items-center gap-2 text-sm">
              <span className="text-green-300">✓</span> {o}
            </div>
          ))}
        </div>
        <p className="text-sm text-blue-200 mt-3">That's the whole game.</p>
      </div>
    </div>
  );
}
