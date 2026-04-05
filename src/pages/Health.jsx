import { useState, useMemo } from 'react';
import { healthPlan } from '../data/healthPlan';
import { LAB_CATEGORIES } from '../constants';
import { toLocalDateStr } from '../utils/dateUtils';

// Simple SVG line chart component
function TrendChart({ entries, dataKey, goalValue, color, label, unit, height = 180 }) {
  if (entries.length < 2) return null;

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const values = sorted.map(e => e[dataKey]).filter(v => v != null);
  if (values.length < 2) return null;

  const dates = sorted.filter(e => e[dataKey] != null);
  const padding = { top: 20, right: 15, bottom: 30, left: 45 };
  const width = 400;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minVal = Math.min(...values, goalValue) - 2;
  const maxVal = Math.max(...values, goalValue) + 2;
  const range = maxVal - minVal || 1;

  const scaleX = (i) => padding.left + (i / (dates.length - 1)) * chartW;
  const scaleY = (v) => padding.top + chartH - ((v - minVal) / range) * chartH;

  const points = dates.map((e, i) => `${scaleX(i)},${scaleY(e[dataKey])}`).join(' ');
  const goalY = scaleY(goalValue);

  // Show ~5 date labels
  const labelInterval = Math.max(1, Math.floor(dates.length / 5));

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-2">{label} Trend</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = padding.top + chartH * (1 - pct);
          const val = (minVal + range * pct).toFixed(1);
          return (
            <g key={pct}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#334155" strokeWidth="0.5" />
              <text x={padding.left - 5} y={y + 3} textAnchor="end" fill="#64748b" fontSize="9">{val}</text>
            </g>
          );
        })}

        {/* Goal line */}
        <line x1={padding.left} y1={goalY} x2={width - padding.right} y2={goalY}
          stroke="#22c55e" strokeWidth="1" strokeDasharray="4 3" />
        <text x={width - padding.right + 2} y={goalY + 3} fill="#22c55e" fontSize="8">Goal</text>

        {/* Data line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {dates.map((e, i) => (
          <circle key={i} cx={scaleX(i)} cy={scaleY(e[dataKey])} r="3" fill={color} stroke="#1e293b" strokeWidth="1.5" />
        ))}

        {/* Date labels */}
        {dates.map((e, i) => {
          if (i % labelInterval !== 0 && i !== dates.length - 1) return null;
          const d = new Date(e.date + 'T12:00:00');
          const lbl = `${d.getMonth() + 1}/${d.getDate()}`;
          return (
            <text key={i} x={scaleX(i)} y={height - 5} textAnchor="middle" fill="#64748b" fontSize="8">{lbl}</text>
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>Latest: <span className="text-white font-medium">{values[values.length - 1]}{unit}</span></span>
        <span>Goal: <span className="text-green-400 font-medium">{goalValue}{unit}</span></span>
      </div>
    </div>
  );
}

export default function Health({ data, addWeight, addLabResult, ...rest }) {
  const [view, setView] = useState('overview'); // 'overview' | 'weight' | 'labs' | 'meds'
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [weightForm, setWeightForm] = useState({ date: toLocalDateStr(), weight: '', bodyFat: '', waist: '', notes: '' });
  const [labForm, setLabForm] = useState({ date: toLocalDateStr(), marker: '', value: '', unit: '', notes: '' });

  const weightEntries = data?.weightEntries || [];
  const latestWeight = weightEntries[0];

  // Compute change from first entry
  const weightChange = useMemo(() => {
    if (weightEntries.length < 2) return null;
    const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    return {
      weight: (last.weight - first.weight).toFixed(1),
      bodyFat: first.bodyFat != null && last.bodyFat != null ? (last.bodyFat - first.bodyFat).toFixed(1) : null,
    };
  }, [weightEntries]);

  const submitWeight = (e) => {
    e.preventDefault();
    if (!weightForm.weight) return;
    addWeight({
      ...weightForm,
      weight: parseFloat(weightForm.weight),
      bodyFat: weightForm.bodyFat ? parseFloat(weightForm.bodyFat) : null,
      waist: weightForm.waist ? parseFloat(weightForm.waist) : null,
    });
    setWeightForm({ date: toLocalDateStr(), weight: '', bodyFat: '', waist: '', notes: '' });
    setShowWeightModal(false);
  };

  const submitLab = (e) => {
    e.preventDefault();
    if (!labForm.marker || !labForm.value) return;
    addLabResult({ ...labForm, value: parseFloat(labForm.value) });
    setLabForm({ date: toLocalDateStr(), marker: '', value: '', unit: '', notes: '' });
    setShowLabModal(false);
  };

  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const goals = healthPlan.weightGoals;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-white">Health Metrics</h1>

      {/* Tab bar */}
      <div className="flex gap-2 bg-slate-700/50 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'weight', label: 'Weight' },
          { id: 'labs', label: 'Labs' },
          { id: 'meds', label: 'Medications' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              view === tab.id ? 'bg-slate-600 text-blue-400 shadow-sm' : 'text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'overview' && (
        <div className="space-y-4">
          {/* Weight + Body Fat summary side by side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Weight card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="text-xs text-slate-400 mb-1">Weight</div>
              <div className="text-2xl font-bold text-white">{latestWeight?.weight || '—'}<span className="text-sm text-slate-400 ml-1">lbs</span></div>
              <div className="text-xs text-slate-500">Goal: <span className="text-green-400">{goals.target} lbs</span></div>
              {latestWeight && (
                <div className="mt-2">
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-blue-500 rounded-full h-1.5 transition-all" style={{
                      width: `${Math.max(0, Math.min(100, ((latestWeight.weight - goals.target) / (goals.current - goals.target)) * 100))}%`
                    }} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {(latestWeight.weight - goals.target).toFixed(1)} lbs to go
                  </div>
                </div>
              )}
            </div>

            {/* Body Fat card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="text-xs text-slate-400 mb-1">Body Fat</div>
              <div className="text-2xl font-bold text-white">
                {latestWeight?.bodyFat != null ? latestWeight.bodyFat : '—'}<span className="text-sm text-slate-400 ml-1">%</span>
              </div>
              <div className="text-xs text-slate-500">Goal: <span className="text-green-400">{goals.bodyFatTarget}%</span></div>
              {latestWeight?.bodyFat != null && (
                <div className="mt-2">
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-purple-500 rounded-full h-1.5 transition-all" style={{
                      width: `${Math.max(0, Math.min(100, ((latestWeight.bodyFat - goals.bodyFatTarget) / (goals.bodyFatCurrent - goals.bodyFatTarget)) * 100))}%`
                    }} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {(latestWeight.bodyFat - goals.bodyFatTarget).toFixed(1)}% to go
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Log button */}
          <button onClick={() => { setView('weight'); setShowWeightModal(true); }}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-blue-500 transition-colors">
            + Log Weight & Body Fat
          </button>

          {/* Recent labs */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Recent Lab Results</h3>
              <button onClick={() => { setView('labs'); setShowLabModal(true); }} className="text-sm text-blue-400">+ Add</button>
            </div>
            {(data?.labResults || []).length === 0 ? (
              <p className="text-sm text-slate-500">No lab results recorded yet</p>
            ) : (
              <div className="space-y-2">
                {(data?.labResults || []).slice(0, 5).map(r => (
                  <div key={r.id} className="flex justify-between p-2 bg-slate-700/50 rounded text-sm">
                    <span className="font-medium text-white">{r.marker}</span>
                    <span className="text-slate-400">{r.value} {r.unit} · {formatDate(r.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medication stack */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-3">Prevention Stack</h3>
            <div className="space-y-2">
              {healthPlan.medications.map(med => (
                <div key={med.name} className="flex items-start gap-3 p-2 bg-slate-700/50 rounded text-sm">
                  <span className="text-lg">💊</span>
                  <div>
                    <div className="font-medium text-white">{med.name}</div>
                    <div className="text-xs text-slate-400">{med.why}</div>
                  </div>
                </div>
              ))}
              {healthPlan.supplements.map(sup => (
                <div key={sup.name} className="flex items-start gap-3 p-2 bg-slate-700/50 rounded text-sm">
                  <span className="text-lg">🧪</span>
                  <div>
                    <div className="font-medium text-white">{sup.name}</div>
                    <div className="text-xs text-slate-400">{sup.why}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">Discuss with your physician before starting any medications.</p>
          </div>

          {/* Sleep */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-2">😴 Sleep Goals</h3>
            <div className="text-sm text-slate-300">
              <div className="font-medium">{healthPlan.sleepGoals.hours}+ hours per night</div>
              <ul className="mt-2 space-y-1">
                {healthPlan.sleepGoals.notes.map(n => (
                  <li key={n} className="text-slate-400">• {n}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {view === 'weight' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowWeightModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              + Log Weight
            </button>
          </div>

          {/* Goal summary cards */}
          {latestWeight && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
                <div className="text-xs text-slate-400">Current</div>
                <div className="text-xl font-bold text-white">{latestWeight.weight}<span className="text-xs text-slate-400"> lbs</span></div>
                {latestWeight.bodyFat != null && (
                  <div className="text-sm text-purple-400">{latestWeight.bodyFat}% BF</div>
                )}
              </div>
              <div className="bg-slate-800 rounded-xl border border-green-800/50 p-4 text-center">
                <div className="text-xs text-slate-400">Goal</div>
                <div className="text-xl font-bold text-green-400">{goals.target}<span className="text-xs text-slate-400"> lbs</span></div>
                <div className="text-sm text-green-400">{goals.bodyFatTarget}% BF</div>
              </div>
            </div>
          )}

          {/* Change indicator */}
          {weightChange && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 flex items-center justify-center gap-4 text-sm">
              <span className="text-slate-400">Change:</span>
              <span className={`font-medium ${parseFloat(weightChange.weight) <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(weightChange.weight) > 0 ? '+' : ''}{weightChange.weight} lbs
              </span>
              {weightChange.bodyFat && (
                <span className={`font-medium ${parseFloat(weightChange.bodyFat) <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {parseFloat(weightChange.bodyFat) > 0 ? '+' : ''}{weightChange.bodyFat}% BF
                </span>
              )}
            </div>
          )}

          {/* Weight trend chart */}
          <TrendChart
            entries={weightEntries}
            dataKey="weight"
            goalValue={goals.target}
            color="#3b82f6"
            label="Weight"
            unit=" lbs"
          />

          {/* Body fat trend chart */}
          <TrendChart
            entries={weightEntries}
            dataKey="bodyFat"
            goalValue={goals.bodyFatTarget}
            color="#a855f7"
            label="Body Fat %"
            unit="%"
          />

          {/* Data table */}
          {weightEntries.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
              <div className="text-4xl mb-2">⚖️</div>
              <p className="text-slate-400">No weight entries yet. Start logging!</p>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-slate-300">Date</th>
                    <th className="text-right p-3 font-medium text-slate-300">Weight</th>
                    <th className="text-right p-3 font-medium text-slate-300">Body Fat</th>
                    <th className="text-right p-3 font-medium text-slate-300">Waist</th>
                    <th className="text-left p-3 font-medium text-slate-300">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {weightEntries.map(e => (
                    <tr key={e.id} className="border-t border-slate-700">
                      <td className="p-3 text-slate-300">{formatDate(e.date)}</td>
                      <td className="p-3 text-right font-medium text-white">{e.weight} lbs</td>
                      <td className="p-3 text-right text-purple-400">{e.bodyFat != null ? `${e.bodyFat}%` : '—'}</td>
                      <td className="p-3 text-right text-slate-300">{e.waist ? `${e.waist}"` : '—'}</td>
                      <td className="p-3 text-slate-400">{e.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === 'labs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowLabModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              + Add Lab Result
            </button>
          </div>

          {/* Lab schedule */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-3">Lab Schedule</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-slate-300 mb-1">Every 6 Months</div>
                <div className="flex flex-wrap gap-1">
                  {healthPlan.labSchedule.every6Months.map(l => (
                    <span key={l} className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded text-xs">{l}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-medium text-slate-300 mb-1">Crohn's Monitoring</div>
                <div className="flex flex-wrap gap-1">
                  {healthPlan.labSchedule.crohns.map(l => (
                    <span key={l} className="bg-purple-900/40 text-purple-300 px-2 py-1 rounded text-xs">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results history */}
          {(data?.labResults || []).length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h3 className="font-semibold text-white mb-3">Results History</h3>
              <div className="space-y-2">
                {(data?.labResults || []).map(r => (
                  <div key={r.id} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg text-sm">
                    <div>
                      <div className="font-medium text-white">{r.marker}</div>
                      <div className="text-xs text-slate-400">{formatDate(r.date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white">{r.value} {r.unit}</div>
                      {r.notes && <div className="text-xs text-slate-400">{r.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'meds' && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Medications</h3>
          {healthPlan.medications.map(med => (
            <div key={med.name} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💊</span>
                <div>
                  <div className="font-medium text-white">{med.name}</div>
                  <div className="text-sm text-slate-400 mt-1">{med.why}</div>
                  <span className="inline-block mt-2 text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{med.category}</span>
                </div>
              </div>
            </div>
          ))}
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide pt-2">Supplements</h3>
          {healthPlan.supplements.map(sup => (
            <div key={sup.name} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🧪</span>
                <div>
                  <div className="font-medium text-white">{sup.name}</div>
                  <div className="text-sm text-slate-400 mt-1">{sup.why}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-4 text-sm text-amber-300">
            ⚠️ This is a common longevity medicine stack. Always discuss with your physician.
          </div>
        </div>
      )}

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowWeightModal(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Log Weight</h3>
            <form onSubmit={submitWeight} className="space-y-3">
              <input type="date" value={weightForm.date} onChange={e => setWeightForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" step="0.1" placeholder="Weight (lbs)" value={weightForm.weight}
                  onChange={e => setWeightForm(f => ({ ...f, weight: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" required />
                <input type="number" step="0.1" placeholder="Body Fat %" value={weightForm.bodyFat}
                  onChange={e => setWeightForm(f => ({ ...f, bodyFat: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              </div>
              <input type="number" step="0.1" placeholder="Waist (inches, optional)" value={weightForm.waist}
                onChange={e => setWeightForm(f => ({ ...f, waist: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <input type="text" placeholder="Notes (optional)" value={weightForm.notes}
                onChange={e => setWeightForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowWeightModal(false)} className="flex-1 py-2 border border-slate-600 rounded-lg text-sm text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lab Modal */}
      {showLabModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowLabModal(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Add Lab Result</h3>
            <form onSubmit={submitLab} className="space-y-3">
              <input type="date" value={labForm.date} onChange={e => setLabForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
              <select value={labForm.marker} onChange={e => setLabForm(f => ({ ...f, marker: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" required>
                <option value="">Select marker...</option>
                {LAB_CATEGORIES.flatMap(c => c.markers).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input type="number" step="0.01" placeholder="Value" value={labForm.value}
                onChange={e => setLabForm(f => ({ ...f, value: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" required />
              <input type="text" placeholder="Unit (e.g., mg/dL)" value={labForm.unit}
                onChange={e => setLabForm(f => ({ ...f, unit: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <input type="text" placeholder="Notes (optional)" value={labForm.notes}
                onChange={e => setLabForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowLabModal(false)} className="flex-1 py-2 border border-slate-600 rounded-lg text-sm text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
