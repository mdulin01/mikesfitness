import { useState, useMemo } from 'react';
import { healthPlan } from '../data/healthPlan';
import { LAB_CATEGORIES } from '../constants';
import { toLocalDateStr } from '../utils/dateUtils';
import { appleSeries } from '../utils/appleHealth';
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
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const s = parseInt(systolic), d = parseInt(diastolic);
    if (!s || !d) { setError('Enter both values'); return; }
    if (s < 70 || s > 250) { setError('Systolic should be 70-250'); return; }
    if (d < 40 || d > 150) { setError('Diastolic should be 40-150'); return; }
    if (d >= s) { setError('Diastolic must be less than systolic'); return; }
    setError('');
    save({ bpEntries: [...currentEntries, { id: Date.now(), date, systolic: s, diastolic: d, value: s }] });
    setSystolic(''); setDiastolic(''); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-2">
      <h3 className="text-sm font-semibold text-white">Log Blood Pressure</h3>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input type="number" placeholder="Systolic" value={systolic} onChange={(e) => { setSystolic(e.target.value); setError(''); }}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
        <input type="number" placeholder="Diastolic" value={diastolic} onChange={(e) => { setDiastolic(e.target.value); setError(''); }}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button onClick={handleSave} className={`w-full py-2 rounded-lg text-white text-sm font-medium ${saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
        {saved ? '✓ Saved!' : 'Save'}
      </button>
    </div>
  );
}

// Resting Heart Rate form
function RestingHeartRateForm({ save, currentEntries }) {
  const [date, setDate] = useState(toLocalDateStr());
  const [bpm, setBpm] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const v = parseInt(bpm);
    if (!v) { setError('Enter a value'); return; }
    if (v < 30 || v > 200) { setError('RHR should be 30-200 bpm'); return; }
    setError('');
    save({ hrEntries: [...currentEntries, { id: Date.now(), date, bpm: v, hr: v, value: v }] });
    setBpm(''); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-2">
      <h3 className="text-sm font-semibold text-white">Log Resting HR</h3>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
      <input type="number" placeholder="BPM" value={bpm} onChange={(e) => { setBpm(e.target.value); setError(''); }}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button onClick={handleSave} className={`w-full py-2 rounded-lg text-white text-sm font-medium ${saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
        {saved ? '✓ Saved!' : 'Save'}
      </button>
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
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const v = parseFloat(value);
    if (!v) { setError('Enter a value'); return; }
    if (v < 10 || v > 90) { setError('VO2 Max should be 10-90 ml/kg/min'); return; }
    setError('');
    save({ vo2Entries: [...currentEntries, { id: Date.now(), date, vo2max: v, value: v }] });
    setValue(''); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-2">
      <h3 className="text-sm font-semibold text-white">Log VO2 Max</h3>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
      <input type="number" placeholder="ml/kg/min" value={value} onChange={(e) => { setValue(e.target.value); setError(''); }} step="0.1"
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button onClick={handleSave} className={`w-full py-2 rounded-lg text-white text-sm font-medium ${saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
        {saved ? '✓ Saved!' : 'Save'}
      </button>
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'weight', label: 'Weight' },
  { id: 'vitals', label: 'Vitals' },
  { id: 'activity', label: 'Activity' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'lipids', label: 'Lipids' },
  { id: 'kidney', label: 'Kidney' },
  { id: 'other', label: 'Other' },
];

// appleSeries() moved to ../utils/appleHealth.js so Dashboard + Health share one source.

export default function Health({ data, addWeight, addLabResult, dailyMetricsByDate, ...rest }) {
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

  const [weightError, setWeightError] = useState('');

  const submitWeight = (e) => {
    e.preventDefault();
    const w = parseFloat(weightForm.weight);
    if (!w) { setWeightError('Enter weight'); return; }
    if (w < 80 || w > 400) { setWeightError('Weight should be 80-400 lbs'); return; }
    const bf = weightForm.bodyFat ? parseFloat(weightForm.bodyFat) : null;
    if (bf !== null && (bf < 3 || bf > 60)) { setWeightError('Body fat should be 3-60%'); return; }
    setWeightError('');
    addWeight({
      ...weightForm,
      weight: w,
      bodyFat: bf,
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
  // Resting HR: prefer Apple Watch (vitals.heartRateRest) — far more accurate than manual entry.
  const hrApple = useMemo(() => appleSeries(dailyMetricsByDate, 'vitals.heartRateRest'), [dailyMetricsByDate]);
  const hrManual = useMemo(() => (data?.hrEntries || []).filter(e => e.bpm).sort((a, b) => a.date.localeCompare(b.date)).map(e => ({ date: e.date, value: e.bpm })), [data?.hrEntries]);
  const hrData = hrApple.length > 0 ? hrApple : hrManual;
  // VO2 max: prefer Apple Watch (vitals.vo2max), fall back to manual.
  const vo2Apple = useMemo(() => appleSeries(dailyMetricsByDate, 'fitness.vo2max'), [dailyMetricsByDate]);
  const vo2Manual = useMemo(() => (data?.vo2Entries || []).filter(e => e.value).sort((a, b) => a.date.localeCompare(b.date)).map(e => ({ date: e.date, value: e.value })), [data?.vo2Entries]);
  const vo2Data = vo2Apple.length > 0 ? vo2Apple : vo2Manual;
  const runPaceData = useMemo(() => (data?.runEntries || []).filter(e => e.pace).sort((a, b) => a.date.localeCompare(b.date)).map(e => ({ date: e.date, value: e.pace })), [data?.runEntries]);
  // Apple-only series (no manual fallback)
  const hrvData = useMemo(() => appleSeries(dailyMetricsByDate, 'vitals.hrv'), [dailyMetricsByDate]);
  const stepsData = useMemo(() => appleSeries(dailyMetricsByDate, 'activity.steps'), [dailyMetricsByDate]);
  const exerciseMinData = useMemo(() => appleSeries(dailyMetricsByDate, 'activity.exerciseMinutes'), [dailyMetricsByDate]);
  const distanceData = useMemo(() => appleSeries(dailyMetricsByDate, 'activity.distanceMiles'), [dailyMetricsByDate]);
  const activeKcalData = useMemo(() => appleSeries(dailyMetricsByDate, 'activity.activeEnergyKcal'), [dailyMetricsByDate]);
  const daylightData = useMemo(() => appleSeries(dailyMetricsByDate, 'activity.daylightMinutes'), [dailyMetricsByDate]);
  const spo2Data = useMemo(() => appleSeries(dailyMetricsByDate, 'vitals.spo2'), [dailyMetricsByDate]);
  const respData = useMemo(() => appleSeries(dailyMetricsByDate, 'vitals.respiratoryRate'), [dailyMetricsByDate]);

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
          <ChartCard title="Blood Pressure (Systolic) — manual" emoji="❤️" data={bpData} goalValue={120} color="#ec4899" unit="mmHg" />
          <BloodPressureForm save={rest?.save || (() => {})} currentEntries={data?.bpEntries || []} />
          <ChartCard title={`Resting Heart Rate${hrApple.length > 0 ? ' — ⌚ Apple Watch' : ' — manual'}`} emoji="💓" data={hrData} goalValue={60} color="#f97316" unit="bpm" />
          {hrApple.length === 0 && <RestingHeartRateForm save={rest?.save || (() => {})} currentEntries={data?.hrEntries || []} />}
          {hrvData.length > 0 && (
            <ChartCard title="Heart Rate Variability — ⌚ Apple Watch" emoji="💚" data={hrvData} goalValue={30} color="#10b981" unit=" ms" />
          )}
          {spo2Data.length > 0 && (
            <ChartCard title="Blood Oxygen (SpO₂) — ⌚ Apple Watch" emoji="🫁" data={spo2Data.map(d => ({ ...d, value: Math.round(d.value * 100) }))} goalValue={95} color="#3b82f6" unit="%" />
          )}
          {respData.length > 0 && (
            <ChartCard title="Respiratory Rate — ⌚ Apple Watch" emoji="🌬️" data={respData} goalValue={16} color="#06b6d4" unit=" /min" />
          )}
        </div>
      )}

      {/* === ACTIVITY (new tab — Apple Health only) === */}
      {view === 'activity' && (
        <div className="space-y-4">
          {stepsData.length === 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 text-center text-sm text-slate-400">
              No Apple Health activity synced yet. Run a sync from Health Auto Export and refresh.
            </div>
          )}
          {stepsData.length > 0 && <ChartCard title="Steps — ⌚ Apple Watch" emoji="👟" data={stepsData} goalValue={10000} color="#3b82f6" unit="" />}
          {exerciseMinData.length > 0 && <ChartCard title="Exercise Minutes — ⌚ Apple Watch" emoji="🏃" data={exerciseMinData} goalValue={30} color="#22c55e" unit=" min" />}
          {activeKcalData.length > 0 && <ChartCard title="Active Calories — ⌚ Apple Watch" emoji="🔥" data={activeKcalData} goalValue={500} color="#f97316" unit=" kcal" />}
          {distanceData.length > 0 && <ChartCard title="Distance — ⌚ Apple Watch" emoji="🚶" data={distanceData} goalValue={3} color="#8b5cf6" unit=" mi" />}
          {daylightData.length > 0 && <ChartCard title="Time in Daylight — ⌚ Apple Watch" emoji="☀️" data={daylightData} goalValue={120} color="#fbbf24" unit=" min" />}
        </div>
      )}

      {/* === FITNESS === */}
      {view === 'fitness' && (
        <div className="space-y-4">
          <ChartCard title="Run Pace — manual" emoji="🏃" data={runPaceData} goalValue={9.0} color="#10b981" unit="min/mile" />
          <RunPaceForm save={rest?.save || (() => {})} currentEntries={data?.runEntries || []} />
          <ChartCard title={`VO2 Max${vo2Apple.length > 0 ? ' — ⌚ Apple Watch' : ' — manual'}`} emoji="💨" data={vo2Data} goalValue={40} color="#06b6d4" unit="ml/kg/min" />
          {vo2Apple.length === 0 && <VO2MaxForm save={rest?.save || (() => {})} currentEntries={data?.vo2Entries || []} />}
        </div>
      )}

      {/* === SLEEP === */}
      {view === 'sleep' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">😴 Sleep Trends</h2>
          {(() => {
            // Prefer Apple Watch sleep (dailyMetricsByDate[date].sleep) over manual sleepLog.
            // Build a unified entries array of [date, { hours, stages?, source }].
            const apple = Object.entries(dailyMetricsByDate || {})
              .filter(([, doc]) => doc?.sleep?.hoursTotal)
              .map(([date, doc]) => [date, { hours: doc.sleep.hoursTotal, stages: doc.sleep.stages, source: 'apple' }]);
            const manual = Object.entries(data?.sleepLog || {})
              .filter(([_, v]) => v.hours)
              .map(([date, v]) => [date, { hours: v.hours, quality: v.quality, bedtime: v.bedtime, wakeTime: v.wakeTime, source: 'manual' }]);
            // Apple wins for a given date if both exist
            const byDate = new Map();
            for (const [d, v] of manual) byDate.set(d, v);
            for (const [d, v] of apple) byDate.set(d, v);
            const entries = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-30);

            if (entries.length === 0) {
              return <p className="text-sm text-slate-400">No sleep data yet. Apple Watch sleep tracking is the easiest source — wear it overnight and run a sync.</p>;
            }

            const avg = (entries.reduce((s, [, v]) => s + v.hours, 0) / entries.length).toFixed(1);
            const qualityEntries = entries.filter(([, v]) => v.quality);
            const avgQuality = qualityEntries.length > 0
              ? (qualityEntries.reduce((s, [, v]) => s + v.quality, 0) / qualityEntries.length).toFixed(1)
              : null;
            const best = Math.max(...entries.map(([, v]) => v.hours)).toFixed(1);
            const worst = Math.min(...entries.map(([, v]) => v.hours)).toFixed(1);
            const daysOver7 = entries.filter(([, v]) => v.hours >= 7).length;
            const appleCount = entries.filter(([, v]) => v.source === 'apple').length;
            // Average stage breakdown for Apple-sourced nights
            const stageNights = entries.filter(([, v]) => v.stages);
            const avgStages = stageNights.length > 0 ? {
              deep: (stageNights.reduce((s, [, v]) => s + (v.stages.deep || 0), 0) / stageNights.length).toFixed(1),
              rem: (stageNights.reduce((s, [, v]) => s + (v.stages.rem || 0), 0) / stageNights.length).toFixed(1),
              core: (stageNights.reduce((s, [, v]) => s + (v.stages.core || 0), 0) / stageNights.length).toFixed(1),
            } : null;

            return (
              <>
                {appleCount > 0 && (
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full">⌚ {appleCount}/{entries.length} nights from Apple Watch</span>
                  </div>
                )}
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
                    <div className="text-xs text-slate-400">Avg Hours</div>
                    <div className={`text-xl font-bold ${parseFloat(avg) >= 7 ? 'text-green-400' : parseFloat(avg) >= 6 ? 'text-yellow-400' : 'text-red-400'}`}>{avg}</div>
                  </div>
                  {avgQuality && (
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
                      <div className="text-xs text-slate-400">Avg Quality</div>
                      <div className="text-xl font-bold text-blue-400">{avgQuality}/5</div>
                    </div>
                  )}
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
                    <div className="text-xs text-slate-400">Best / Worst</div>
                    <div className="text-xl font-bold text-slate-200">{best} / {worst}</div>
                  </div>
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-3">
                    <div className="text-xs text-slate-400">Days 7+ hrs</div>
                    <div className="text-xl font-bold text-green-400">{daysOver7}/{entries.length}</div>
                  </div>
                </div>

                {/* Sleep stage breakdown — only when Apple Watch data exists */}
                {avgStages && (
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">Avg Sleep Stages <span className="text-xs text-slate-500 font-normal">(⌚ Apple Watch · {stageNights.length} nights)</span></h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-purple-300">{avgStages.deep}</div>
                        <div className="text-xs text-purple-400">Deep (hrs)</div>
                      </div>
                      <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-300">{avgStages.rem}</div>
                        <div className="text-xs text-blue-400">REM (hrs)</div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-slate-300">{avgStages.core}</div>
                        <div className="text-xs text-slate-400">Core (hrs)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chart */}
                <ChartCard
                  title="Sleep Hours (Last 30 Days)"
                  emoji="😴"
                  data={entries.map(([date, v]) => ({ date, value: v.hours }))}
                  goalValue={7}
                  color="#8b5cf6"
                  unit=" hrs"
                />

                {/* Quality chart if data exists */}
                {entries.some(([_, v]) => v.quality) && (
                  <ChartCard
                    title="Sleep Quality (Last 30 Days)"
                    emoji="⭐"
                    data={entries.filter(([_, v]) => v.quality).map(([date, v]) => ({ date, value: v.quality }))}
                    goalValue={4}
                    color="#f59e0b"
                    unit="/5"
                  />
                )}

                {/* Recent entries table */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Recent Nights</h3>
                  <div className="space-y-1.5">
                    {entries.slice(-10).reverse().map(([date, v]) => (
                      <div key={date} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          {v.source === 'apple' && <span className="text-[9px] bg-emerald-900/50 text-emerald-400 px-1.5 py-0.5 rounded-full">⌚</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-medium ${v.hours >= 7 ? 'text-green-400' : v.hours >= 6 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {v.hours.toFixed(1)} hrs
                          </span>
                          {v.stages && (
                            <span className="text-[10px] text-slate-500" title="Deep · REM · Core">
                              {v.stages.deep != null && `D ${v.stages.deep.toFixed(1)} · `}
                              {v.stages.rem != null && `R ${v.stages.rem.toFixed(1)}`}
                            </span>
                          )}
                          {v.bedtime && <span className="text-xs text-slate-500">{v.bedtime} → {v.wakeTime}</span>}
                          {v.quality && <span className="text-xs text-yellow-400">{'★'.repeat(v.quality)}{'☆'.repeat(5 - v.quality)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
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
              {weightError && <p className="text-xs text-red-400">{weightError}</p>}
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
