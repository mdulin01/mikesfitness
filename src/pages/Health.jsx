import { useState } from 'react';
import { healthPlan } from '../data/healthPlan';
import { LAB_CATEGORIES } from '../constants';

export default function Health({ data, addWeight, addLabResult }) {
  const [view, setView] = useState('overview'); // 'overview' | 'weight' | 'labs' | 'meds'
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [weightForm, setWeightForm] = useState({ date: new Date().toISOString().split('T')[0], weight: '', waist: '', notes: '' });
  const [labForm, setLabForm] = useState({ date: new Date().toISOString().split('T')[0], marker: '', value: '', unit: '', notes: '' });

  const latestWeight = (data?.weightEntries || [])[0];

  const submitWeight = (e) => {
    e.preventDefault();
    if (!weightForm.weight) return;
    addWeight({ ...weightForm, weight: parseFloat(weightForm.weight), waist: weightForm.waist ? parseFloat(weightForm.waist) : null });
    setWeightForm({ date: new Date().toISOString().split('T')[0], weight: '', waist: '', notes: '' });
    setShowWeightModal(false);
  };

  const submitLab = (e) => {
    e.preventDefault();
    if (!labForm.marker || !labForm.value) return;
    addLabResult({ ...labForm, value: parseFloat(labForm.value) });
    setLabForm({ date: new Date().toISOString().split('T')[0], marker: '', value: '', unit: '', notes: '' });
    setShowLabModal(false);
  };

  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-gray-900">Health Metrics</h1>

      {/* Tab bar */}
      <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
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
              view === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'overview' && (
        <div className="space-y-4">
          {/* Weight summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Weight</h3>
              <button onClick={() => { setView('weight'); setShowWeightModal(true); }} className="text-sm text-blue-600">+ Log</button>
            </div>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">{latestWeight?.weight || '—'}</div>
                <div className="text-xs text-gray-500">lbs {latestWeight && `(${formatDate(latestWeight.date)})`}</div>
              </div>
              <div className="text-sm text-gray-500">
                Target: <span className="font-medium text-green-600">{healthPlan.weightGoals.target} lbs</span>
              </div>
            </div>
            {latestWeight && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{healthPlan.weightGoals.target}</span>
                  <span>{latestWeight.weight}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 rounded-full h-2 transition-all" style={{
                    width: `${Math.max(0, Math.min(100, ((latestWeight.weight - healthPlan.weightGoals.target) / (200 - healthPlan.weightGoals.target)) * 100))}%`
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Recent labs */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Recent Lab Results</h3>
              <button onClick={() => { setView('labs'); setShowLabModal(true); }} className="text-sm text-blue-600">+ Add</button>
            </div>
            {(data?.labResults || []).length === 0 ? (
              <p className="text-sm text-gray-400">No lab results recorded yet</p>
            ) : (
              <div className="space-y-2">
                {(data?.labResults || []).slice(0, 5).map(r => (
                  <div key={r.id} className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                    <span className="font-medium">{r.marker}</span>
                    <span>{r.value} {r.unit} · {formatDate(r.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medication stack */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Prevention Stack</h3>
            <div className="space-y-2">
              {healthPlan.medications.map(med => (
                <div key={med.name} className="flex items-start gap-3 p-2 bg-gray-50 rounded text-sm">
                  <span className="text-lg">💊</span>
                  <div>
                    <div className="font-medium">{med.name}</div>
                    <div className="text-xs text-gray-500">{med.why}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">Discuss with your physician before starting any medications.</p>
          </div>

          {/* Sleep */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-2">😴 Sleep Goals</h3>
            <div className="text-sm text-gray-600">
              <div className="font-medium">{healthPlan.sleepGoals.hours}+ hours per night</div>
              <ul className="mt-2 space-y-1">
                {healthPlan.sleepGoals.notes.map(n => (
                  <li key={n} className="text-gray-500">• {n}</li>
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
          {(data?.weightEntries || []).length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-2">⚖️</div>
              <p className="text-gray-500">No weight entries yet. Start logging!</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium text-gray-600">Date</th>
                    <th className="text-right p-3 font-medium text-gray-600">Weight</th>
                    <th className="text-right p-3 font-medium text-gray-600">Waist</th>
                    <th className="text-left p-3 font-medium text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.weightEntries || []).map(e => (
                    <tr key={e.id} className="border-t border-gray-100">
                      <td className="p-3">{formatDate(e.date)}</td>
                      <td className="p-3 text-right font-medium">{e.weight} lbs</td>
                      <td className="p-3 text-right">{e.waist ? `${e.waist}"` : '—'}</td>
                      <td className="p-3 text-gray-500">{e.notes || '—'}</td>
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
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Lab Schedule</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-700 mb-1">Every 6 Months</div>
                <div className="flex flex-wrap gap-1">
                  {healthPlan.labSchedule.every6Months.map(l => (
                    <span key={l} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{l}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700 mb-1">Crohn's Monitoring</div>
                <div className="flex flex-wrap gap-1">
                  {healthPlan.labSchedule.crohns.map(l => (
                    <span key={l} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results history */}
          {(data?.labResults || []).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Results History</h3>
              <div className="space-y-2">
                {(data?.labResults || []).map(r => (
                  <div key={r.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <div className="font-medium">{r.marker}</div>
                      <div className="text-xs text-gray-500">{formatDate(r.date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{r.value} {r.unit}</div>
                      {r.notes && <div className="text-xs text-gray-500">{r.notes}</div>}
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
          {healthPlan.medications.map(med => (
            <div key={med.name} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💊</span>
                <div>
                  <div className="font-medium text-gray-900">{med.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{med.why}</div>
                  <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{med.category}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            ⚠️ This is a common longevity medicine stack. Always discuss with your physician.
          </div>
        </div>
      )}

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowWeightModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Log Weight</h3>
            <form onSubmit={submitWeight} className="space-y-3">
              <input type="date" value={weightForm.date} onChange={e => setWeightForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" />
              <input type="number" step="0.1" placeholder="Weight (lbs)" value={weightForm.weight}
                onChange={e => setWeightForm(f => ({ ...f, weight: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" required />
              <input type="number" step="0.1" placeholder="Waist (inches, optional)" value={weightForm.waist}
                onChange={e => setWeightForm(f => ({ ...f, waist: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" />
              <input type="text" placeholder="Notes (optional)" value={weightForm.notes}
                onChange={e => setWeightForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowWeightModal(false)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lab Modal */}
      {showLabModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowLabModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Add Lab Result</h3>
            <form onSubmit={submitLab} className="space-y-3">
              <input type="date" value={labForm.date} onChange={e => setLabForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" />
              <select value={labForm.marker} onChange={e => setLabForm(f => ({ ...f, marker: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" required>
                <option value="">Select marker...</option>
                {LAB_CATEGORIES.flatMap(c => c.markers).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input type="number" step="0.01" placeholder="Value" value={labForm.value}
                onChange={e => setLabForm(f => ({ ...f, value: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" required />
              <input type="text" placeholder="Unit (e.g., mg/dL)" value={labForm.unit}
                onChange={e => setLabForm(f => ({ ...f, unit: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" />
              <input type="text" placeholder="Notes (optional)" value={labForm.notes}
                onChange={e => setLabForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowLabModal(false)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
