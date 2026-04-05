import { useState, useMemo } from 'react';
import { healthPlan } from '../data/healthPlan';
import { LAB_CATEGORIES } from '../constants';
import { toLocalDateStr } from '../utils/dateUtils';
import { getTrend } from '../data/labData';
import TrendChart from '../components/TrendChart';

function ChartCard({ title, emoji, data, goalValue, color, unit }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-white mb-2">{emoji} {title}</h3>
      <TrendChart data={data} goalValue={goalValue} color={color} unit={unit} />
    </div>
  );
}

// Blood Pressure form
function BloodPressureForm({ save, currentEntries }) {
  const [date, setDate] = useState(toLocalDateStr());
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');

  const handleSave = () => {
    if (!systolic || !diastolic) return;
    save({ bpEntries: [...currentEntries, { id: Date.now(), date, systolic: parseInt(systolic), diastolic: parseInt(diastolic), value: parseInt(systolic) }] });
    setSystolic(''); setDiastolic('');
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-2">
      <h3 className="text-sm font-semibold text-white">Log Blood Pressure</h3>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input type="number" placeholder="Systolic" value={systolic} onChange={(e) => setSystolic(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
        <input type="number" placeholder="Diastolic" value={diastolic} onChange={(e) => setDiastolic(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
      </div>
      <button onClick={handleSave} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium">Save</button>
    </div>
  );
}

// Resting Heart Rate form
function RestingHeartRateForm({ save, currentEntries }) {
  const [date, setDate] = useState(toLocalDateStr());
  const [bpm, setBpm] = useState('');

  const handleSave = () => {
    if (!bpm) return;
    save({ hrEntries: [...currentEntries, { id: Date.now(), date, bpm: parseInt(bpm), value: parseInt(bpm) }] });
    setBpm('');
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-2">
      <h3 className="text-sm font-semibold text-white">Log Resting HR</h3>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
      <input type="number" placeholder="BPM" value={bpm} onChange={(e) => setBpm(e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
      <button onClick={handleSave} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium">Save</button>
    </div>
  );
}

// Run Pace form
function RunPaceForm({ save, currentEntries }) {
  const [date, setDate] = useState(toLocalDateStr());
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const handleSave = () => {
    if (!distance || !duration) return;
    const pace = parseFloat((parseFloat(duration) / parseFloat(distance)).toFixed(2));
    save({ runEntries: [...currentEntries, { id: Date.now(), date, distance: parseFloat(distance), duration: parseFloat(duration), pace }] });
    setDistance(''); setDuration('');
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-2">
      <h3 className="text-sm font-semibold text-white">Log Run</h3>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input type="number" placeholder="Distance (mi)" value={distance} onChange={(e) => setDistance(e.target.value)} step="0.1"
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
        <input type="number" placeholder="Duration (min)" value={duration} onChange={(e) => setDuration(e.target.value)} step="0.1"
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
      </div>
      <button onClick={handleSave} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium">Save</button>
    </div>
  );
}

// VO2 Max form
function VO2MaxForm({ save, currentEntries }) {
  const [date, setDate] = useState(toLocalDateStr());
  const [value, setValue] = useState('');

  const handleSave = () => {
    if (!value) return;
    save({ vo2Entries: [...currentEntries, { id: Date.now(), date, value: parseFloat(value) }] });
    setValue('');
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-2">
      <h3 className="text-sm font-semibold text-white">Log VO2 Max</h3>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
      <input type="number" placeholder="ml/kg/min" value={value} onChange={(e) => setValue(e.target.value)} step="0.1"
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
      <button onClick={handleSave} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium">Save</button>
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'weight', label: 'Weight' },
  { id: 'vitals', label: 'Vitals' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'lipids', label: 'Lipids' },
  { id: 'kidney', label: 'Kidney' },
  { id: 'other', label: 'Other' },
];

export default function Health({ data, addWeight, addLabResult, ...rest }) {
  const [view, setView] = useState('overview');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightForm, setWeightForm] = useState({ date: toLocalDateStr(), weight: '', bodyFat: '', waist: '', notes: '' });

  const weightEntries = data?.weightEntries || [];
  const latestWeight = weightEntries[0];
  const goals = healthPlan.weightGoals;

  const weightChange = useMemo(() => {
    if (weightEntries.length < 2) return null;
    const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0]; const last = sorted[sorted.length - 1];
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

  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Chart data
  const weightData = useMemo(() => (data?.weightEntries || []).filter(e => e.weight).sort((a, b) => a.date.localeCompare(b.date)).map(e => ({ date: e.date, value: e.weight })), [data?.weightEntries]);
  const bodyFatData = useMemo(() => (data?.weightEntries || []).filter(e => e.bodyFat).sort((a, b) => a.date.localeCompare(b.date)).map(e => ({ date: e.date, value: e.bodyFat })), [data?.weightEntries]);
  const waistData = useMemo(() => (data?.weightEntries || []).filter(e => e.waist).sort((a, b) => a.date.localeCompare(b.date)).map(e => ({ date: e.date, value: parseFloat(e.waist) })), [data?.weightEntries]);
  const bpData = useMemo(() => (data?.bpEntries || []).filter(e => e.systolic).sort((a, b) => a.date.localeCompare(b.date)).map(e => ({ date: e.date, value: e.systolic, diastolic: e.diastolic })), [data?.bpEntries]);
  const hrData = useMemo(() => (data?.hrEntries || []).filter(e => e.bpm).sort((a, b) => a.date.localeCompare(b.date)).map(e => ({ date: e.date, value: e.bpm })), [data?.hrEntries]);
  const runPaceData = useMemo(() => (data?.runEntries || []).filter(e => e.pace).sort((a, b) => a.date.localeCompare(b.date)).map(e => ({ date: e.date, value: e.pace })), [data?.runEntries]);
  const vo2Data = useMemo(() => (data?.vo2Entries || []).filter(e => e.value).sort((a, b) => a.date.localeCompare(b.date)).map(e => ({ date: e.date, value: e.value })), [data?.vo2Entries]);

  // Lab trends
  const apoBTrend = useMemo(() => getTrend('ApoB'), []);
  const ldlTrend = useMemo(() => getTrend('LDL-C'), []);
  const hdlTrend = useMemo(() => getTrend('HDL-C'), []);
  const trigTrend = useMemo(() => getTrend('Triglycerides'), []);
  const creatinineTrend = useMemo(() => getTrend('Creatinine'), []);
  const egfrTrend = useMemo(() => getTrend('eGFR'), []);
  const homocysteineTrend = useMemo(() => getTrend('Homocysteine'), []);
  const plateletsTrend = useMemo(() => getTrend('Platelets'), []);
  const vitDTrend = useMemo(() => getTrend('Vitamin D'), []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-white">Health & Trends</h1>

      {/* Tabs - scrollable on mobile */}
      <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)}
            className={`flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              view === tab.id ? 'bg-slate-600 text-blue-400 shadow-sm' : 'text-slate-400'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* === OVERVIEW === */}
      {view === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="text-xs text-slate-400 mb-1">Weight</div>
              <div className="text-2xl font-bold text-white">{latestWeight?.weight || '—'}<span className="text-sm text-slate-400 ml-1">lbs</span></div>
              <div className="text-xs text-slate-500">Goal: <span className="text-green-400">{goals.target} lbs</span></div>
              {latestWeight && (
                <div className="mt-2">
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-blue-500 rounded-full h-1.5 transition-all" style={{
                      width: `${Math.max(0, Math.min(100, ((goals.current - latestWeight.weight) / (goals.current - goals.target)) * 100))}%`
                    }} />
                  </div>
                </div>
              )}
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="text-xs text-slate-400 mb-1">Body Fat</div>
              <div className="text-2xl font-bold text-white">
                {latestWeight?.bodyFat != null ? latestWeight.bodyFat : '—'}<span className="text-sm text-slate-400 ml-1">%</span>
              </div>
              <div className="text-xs text-slate-500">Goal: <span className="text-green-400">{goals.bodyFatTarget}%</span></div>
            </div>
          </div>

          <button onClick={() => { setView('weight'); setShowWeightModal(true); }}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-blue-500 transition-colors">
            + Log Weight & Body Fat
          </button>

          {/* Quick lab snapshot */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="font-semibold text-white mb-3 text-sm">Key Lab Snapshot</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: 'ApoB', data: apoBTrend, goal: 70, unit: 'mg/dL', color: 'text-red-300' },
                { label: 'eGFR', data: egfrTrend, goal: 60, unit: 'mL/min', color: 'text-yellow-300' },
                { label: 'LDL-C', data: ldlTrend, goal: 70, unit: 'mg/dL', color: 'text-orange-300' },
                { label: 'Platelets', data: plateletsTrend, goal: 150, unit: 'K', color: 'text-purple-300' },
              ].map(item => {
                const latest = item.data.length > 0 ? item.data[item.data.length - 1] : null;
                return (
                  <div key={item.label} className="p-2 bg-slate-700/50 rounded-lg">
                    <div className="text-xs text-slate-400">{item.label}</div>
                    <div className={`font-bold ${item.color}`}>{latest?.value ?? '—'}</div>
                    <div className="text-xs text-slate-500">goal: {item.goal}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sleep */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="font-semibold text-white mb-2 text-sm">Sleep Goals</h3>
            <div className="text-sm text-slate-300">
              <div className="font-medium">{healthPlan.sleepGoals.hours}+ hours per night</div>
              <ul className="mt-1 space-y-0.5">
                {healthPlan.sleepGoals.notes.map(n => (
                  <li key={n} className="text-xs text-slate-400">• {n}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* === WEIGHT === */}
      {view === 'weight' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowWeightModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Log Weight</button>
          </div>

          {latestWeight && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
                <div className="text-xs text-slate-400">Current</div>
                <div className="text-xl font-bold text-white">{latestWeight.weight}<span className="text-xs text-slate-400"> lbs</span></div>
                {latestWeight.bodyFat != null && <div className="text-sm text-purple-400">{latestWeight.bodyFat}% BF</div>}
              </div>
              <div className="bg-slate-800 rounded-xl border border-green-800/50 p-4 text-center">
                <div className="text-xs text-slate-400">Goal</div>
                <div className="text-xl font-bold text-green-400">{goals.target}<span className="text-xs text-slate-400"> lbs</span></div>
                <div className="text-sm text-green-400">{goals.bodyFatTarget}% BF</div>
              </div>
            </div>
          )}

          {weightChange && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 flex items-center justify-center gap-4 text-sm">
              <span className="text-slate-400">Change:</span>
              <span className={`font-medium ${parseFloat(weightChange.weight) <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(weightChange.weight) > 0 ? '+' : ''}{weightChange.weight} lbs
              </span>
            </div>
          )}

          <ChartCard title="Weight" emoji="⚖️" data={weightData} goalValue={goals.target} color="#3b82f6" unit="lbs" />
          <ChartCard title="Body Fat %" emoji="📐" data={bodyFatData} goalValue={goals.bodyFatTarget} color="#a855f7" unit="%" />
          <ChartCard title="Waist" emoji="📏" data={waistData} goalValue={38} color="#8b5cf6" unit="in" />

          {weightEntries.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-slate-300">Date</th>
                    <th className="text-right p-3 font-medium text-slate-300">Weight</th>
                    <th className="text-right p-3 font-medium text-slate-300">BF%</th>
                    <th className="text-right p-3 font-medium text-slate-300">Waist</th>
                  </tr>
                </thead>
                <tbody>
                  {weightEntries.map(e => (
                    <tr key={e.id} className="border-t border-slate-700">
                      <td className="p-3 text-slate-300">{formatDate(e.date)}</td>
                      <td className="p-3 text-right font-medium text-white">{e.weight}</td>
                      <td className="p-3 text-right text-purple-400">{e.bodyFat != null ? `${e.bodyFat}%` : '—'}</td>
                      <td className="p-3 text-right text-slate-300">{e.waist ? `${e.waist}"` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* === VITALS === */}
      {view === 'vitals' && (
        <div className="space-y-4">
          <ChartCard title="Blood Pressure (Systolic)" emoji="❤️" data={bpData} goalValue={120} color="#ec4899" unit="mmHg" />
          <BloodPressureForm save={rest?.save || (() => {})} currentEntries={data?.bpEntries || []} />
          <ChartCard title="Resting Heart Rate" emoji="💓" data={hrData} goalValue={60} color="#f97316" unit="bpm" />
          <RestingHeartRateForm save={rest?.save || (() => {})} currentEntries={data?.hrEntries || []} />
        </div>
      )}

      {/* === FITNESS === */}
      {view === 'fitness' && (
        <div className="space-y-4">
          <ChartCard title="Run Pace" emoji="🏃" data={runPaceData} goalValue={9.0} color="#10b981" unit="min/mile" />
          <RunPaceForm save={rest?.save || (() => {})} currentEntries={data?.runEntries || []} />
          <ChartCard title="VO2 Max" emoji="💨" data={vo2Data} goalValue={40} color="#06b6d4" unit="ml/kg/min" />
          <VO2MaxForm save={rest?.save || (() => {})} currentEntries={data?.vo2Entries || []} />
        </div>
      )}

      {/* === LIPIDS === */}
      {view === 'lipids' && (
        <div className="space-y-4">
          <ChartCard title="ApoB" emoji="🔬" data={apoBTrend} goalValue={70} color="#ef4444" unit="mg/dL" />
          <ChartCard title="LDL-C" emoji="🩸" data={ldlTrend} goalValue={70} color="#f97316" unit="mg/dL" />
          <ChartCard title="HDL-C" emoji="💚" data={hdlTrend} goalValue={60} color="#22c55e" unit="mg/dL" />
          <ChartCard title="Triglycerides" emoji="📊" data={trigTrend} goalValue={150} color="#eab308" unit="mg/dL" />
        </div>
      )}

      {/* === KIDNEY === */}
      {view === 'kidney' && (() => {
        const latestEgfr = egfrTrend.length > 0 ? egfrTrend[egfrTrend.length - 1].value : null;
        const getStage = (val) => val >= 90 ? '1' : val >= 60 ? '2' : val >= 45 ? '3a' : val >= 30 ? '3b' : val >= 15 ? '4' : '5';
        const stage = latestEgfr ? getStage(latestEgfr) : null;
        return (
          <div className="space-y-4">
            <ChartCard title="Creatinine" emoji="🫘" data={creatinineTrend} goalValue={1.27} color="#f59e0b" unit="mg/dL" />
            <ChartCard title="eGFR" emoji="🔍" data={egfrTrend} goalValue={60} color="#3b82f6" unit="mL/min" />
            <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-amber-300 mb-1">eGFR Stages</h3>
              <div className="text-xs text-amber-200/80 space-y-1">
                {[['1', '≥90', 'Normal'], ['2', '60-89', 'Mild decrease'], ['3a', '45-59', 'Mild to moderate'], ['3b', '30-44', 'Moderate to severe'], ['4', '15-29', 'Severe'], ['5', '<15', 'Kidney failure']].map(([s, range, label]) => (
                  <p key={s} className={stage === s ? 'font-semibold' : ''}>Stage {s}: {range} ({label}){stage === s && ` ← Current (${latestEgfr})`}</p>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* === OTHER === */}
      {view === 'other' && (
        <div className="space-y-4">
          <ChartCard title="Homocysteine" emoji="⚠️" data={homocysteineTrend} goalValue={10} color="#ef4444" unit="umol/L" />
          <ChartCard title="Platelets" emoji="🩸" data={plateletsTrend} goalValue={150} color="#8b5cf6" unit="x10E3" />
          <ChartCard title="Vitamin D" emoji="☀️" data={vitDTrend} goalValue={50} color="#f59e0b" unit="ng/mL" />
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
              <input type="number" step="0.1" placeholder="Waist (inches)" value={weightForm.waist}
                onChange={e => setWeightForm(f => ({ ...f, waist: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <input type="text" placeholder="Notes" value={weightForm.notes}
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
    </div>
  );
}
