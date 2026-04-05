import { useState, useMemo } from 'react';
import { getTrend } from '../data/labData';
import { toLocalDateStr } from '../utils/dateUtils';
import TrendChart from '../components/TrendChart';

function ChartCard({ title, emoji, data, goalValue, color, unit }) {
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
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!systolic || !diastolic) {
      alert('Please enter systolic and diastolic readings');
      return;
    }
    const newEntry = {
      id: Date.now(),
      date,
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      notes,
    };
    // Combine systolic and diastolic into value for chart display
    const chartEntry = {
      id: newEntry.id,
      date,
      value: parseInt(systolic),
      diastolic: parseInt(diastolic),
      notes,
    };
    save({ bpEntries: [...currentEntries, chartEntry] });
    setDate(toLocalDateStr());
    setSystolic('');
    setDiastolic('');
    setNotes('');
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-white">❤️ Log Blood Pressure</h3>
      <div className="space-y-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Systolic" value={systolic} onChange={(e) => setSystolic(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
          <input type="number" placeholder="Diastolic" value={diastolic} onChange={(e) => setDiastolic(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
        </div>
        <input type="text" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
        <button onClick={handleSave}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors">
          Save Entry
        </button>
      </div>
    </div>
  );
}

// Resting Heart Rate form
function RestingHeartRateForm({ save, currentEntries }) {
  const [date, setDate] = useState(toLocalDateStr());
  const [bpm, setBpm] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!bpm) {
      alert('Please enter BPM');
      return;
    }
    const newEntry = {
      id: Date.now(),
      date,
      bpm: parseInt(bpm),
      notes,
    };
    save({ hrEntries: [...currentEntries, { ...newEntry, value: parseInt(bpm) }] });
    setDate(toLocalDateStr());
    setBpm('');
    setNotes('');
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-white">💓 Log Resting Heart Rate</h3>
      <div className="space-y-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
        <input type="number" placeholder="BPM" value={bpm} onChange={(e) => setBpm(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
        <input type="text" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
        <button onClick={handleSave}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors">
          Save Entry
        </button>
      </div>
    </div>
  );
}

// Run Pace form
function RunPaceForm({ save, currentEntries }) {
  const [date, setDate] = useState(toLocalDateStr());
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!distance || !duration) {
      alert('Please enter distance and duration');
      return;
    }
    const distNum = parseFloat(distance);
    const durMin = parseFloat(duration);
    const pace = (durMin / distNum).toFixed(2);
    const newEntry = {
      id: Date.now(),
      date,
      distance: distNum,
      duration: durMin,
      pace: parseFloat(pace),
      notes,
    };
    save({ runEntries: [...currentEntries, newEntry] });
    setDate(toLocalDateStr());
    setDistance('');
    setDuration('');
    setNotes('');
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-white">🏃 Log Run</h3>
      <div className="space-y-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Distance (mi)" value={distance} onChange={(e) => setDistance(e.target.value)} step="0.1"
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
          <input type="number" placeholder="Duration (min)" value={duration} onChange={(e) => setDuration(e.target.value)} step="0.1"
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
        </div>
        <input type="text" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
        <button onClick={handleSave}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors">
          Save Entry
        </button>
      </div>
    </div>
  );
}

// VO2 Max form
function VO2MaxForm({ save, currentEntries }) {
  const [date, setDate] = useState(toLocalDateStr());
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!value) {
      alert('Please enter VO2 Max value');
      return;
    }
    const newEntry = {
      id: Date.now(),
      date,
      value: parseFloat(value),
      notes,
    };
    save({ vo2Entries: [...currentEntries, newEntry] });
    setDate(toLocalDateStr());
    setValue('');
    setNotes('');
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-white">💨 Log VO2 Max</h3>
      <div className="space-y-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm" />
        <input type="number" placeholder="VO2 Max (ml/kg/min)" value={value} onChange={(e) => setValue(e.target.value)} step="0.1"
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
        <input type="text" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500" />
        <button onClick={handleSave}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors">
          Save Entry
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'body', label: 'Body' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'lipids', label: 'Lipids' },
  { id: 'kidney', label: 'Kidney' },
  { id: 'other', label: 'Other' },
];

export default function Trends({ data, ...rest }) {
  const [activeTab, setActiveTab] = useState('body');

  // Body metrics from weightEntries
  const weightData = useMemo(() =>
    (data?.weightEntries || [])
      .filter(e => e.weight)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => ({ date: e.date, value: e.weight })),
    [data?.weightEntries]
  );

  const bodyFatData = useMemo(() =>
    (data?.weightEntries || [])
      .filter(e => e.bodyFat)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => ({ date: e.date, value: e.bodyFat })),
    [data?.weightEntries]
  );

  const waistData = useMemo(() =>
    (data?.weightEntries || [])
      .filter(e => e.waist)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => ({ date: e.date, value: parseFloat(e.waist) })),
    [data?.weightEntries]
  );

  // Blood pressure data - systolic as primary value
  const bpData = useMemo(() =>
    (data?.bpEntries || [])
      .filter(e => e.systolic)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => ({ date: e.date, value: e.systolic, diastolic: e.diastolic })),
    [data?.bpEntries]
  );

  // Resting heart rate data
  const hrData = useMemo(() =>
    (data?.hrEntries || [])
      .filter(e => e.bpm)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => ({ date: e.date, value: e.bpm })),
    [data?.hrEntries]
  );

  // Run pace data - convert to min/mile
  const runPaceData = useMemo(() =>
    (data?.runEntries || [])
      .filter(e => e.pace)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => ({ date: e.date, value: e.pace })),
    [data?.runEntries]
  );

  // VO2 Max data
  const vo2Data = useMemo(() =>
    (data?.vo2Entries || [])
      .filter(e => e.value)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(e => ({ date: e.date, value: e.value })),
    [data?.vo2Entries]
  );

  // Lab trends
  const apoBTrend = useMemo(() => getTrend('ApoB'), []);
  const ldlTrend = useMemo(() => getTrend('LDL-C'), []);
  const creatinineTrend = useMemo(() => getTrend('Creatinine'), []);
  const egfrTrend = useMemo(() => getTrend('eGFR'), []);
  const homocysteineTrend = useMemo(() => getTrend('Homocysteine'), []);
  const trigTrend = useMemo(() => getTrend('Triglycerides'), []);
  const hdlTrend = useMemo(() => getTrend('HDL-C'), []);
  const plateletsTrend = useMemo(() => getTrend('Platelets'), []);
  const vitDTrend = useMemo(() => getTrend('Vitamin D'), []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-white">📈 Trends</h1>
      <p className="text-sm text-slate-400">Are my labs moving in the right direction?</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-slate-600 text-blue-400 shadow-sm' : 'text-slate-400'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body Tab */}
      {activeTab === 'body' && (
        <div className="space-y-4">
          <ChartCard title="Weight" emoji="⚖️" data={weightData} goalValue={185} color="#3b82f6" unit="lbs" />
          <ChartCard title="Body Fat %" emoji="📐" data={bodyFatData} goalValue={20} color="#f59e0b" unit="%" />
          <ChartCard title="Waist" emoji="📏" data={waistData} goalValue={38} color="#8b5cf6" unit="in" />
          <ChartCard title="Blood Pressure (Systolic)" emoji="❤️" data={bpData} goalValue={120} color="#ec4899" unit="mmHg" />
          <BloodPressureForm save={rest?.save || (() => {})} currentEntries={data?.bpEntries || []} />
          <ChartCard title="Resting Heart Rate" emoji="💓" data={hrData} goalValue={60} color="#f97316" unit="bpm" />
          <RestingHeartRateForm save={rest?.save || (() => {})} currentEntries={data?.hrEntries || []} />
        </div>
      )}

      {/* Fitness Tab */}
      {activeTab === 'fitness' && (
        <div className="space-y-4">
          <ChartCard title="Run Pace" emoji="🏃" data={runPaceData} goalValue={9.0} color="#10b981" unit="min/mile" />
          <RunPaceForm save={rest?.save || (() => {})} currentEntries={data?.runEntries || []} />
          <ChartCard title="VO2 Max" emoji="💨" data={vo2Data} goalValue={40} color="#06b6d4" unit="ml/kg/min" />
          <VO2MaxForm save={rest?.save || (() => {})} currentEntries={data?.vo2Entries || []} />
        </div>
      )}

      {/* Lipids Tab */}
      {activeTab === 'lipids' && (
        <div className="space-y-4">
          <ChartCard title="ApoB" emoji="🔬" data={apoBTrend} goalValue={70} color="#ef4444" unit="mg/dL" />
          <ChartCard title="LDL-C" emoji="🩸" data={ldlTrend} goalValue={70} color="#f97316" unit="mg/dL" />
          <ChartCard title="HDL-C" emoji="💚" data={hdlTrend} goalValue={60} color="#22c55e" unit="mg/dL" />
          <ChartCard title="Triglycerides" emoji="📊" data={trigTrend} goalValue={150} color="#eab308" unit="mg/dL" />
        </div>
      )}

      {/* Kidney Tab */}
      {activeTab === 'kidney' && (() => {
        const latestEgfr = egfrTrend.length > 0 ? egfrTrend[egfrTrend.length - 1].value : null;
        const getStage = (val) => {
          if (val >= 90) return '1';
          if (val >= 60) return '2';
          if (val >= 45) return '3a';
          if (val >= 30) return '3b';
          if (val >= 15) return '4';
          return '5';
        };
        const stage = latestEgfr ? getStage(latestEgfr) : null;
        return (
          <div className="space-y-4">
            <ChartCard title="Creatinine" emoji="🫘" data={creatinineTrend} goalValue={1.27} color="#f59e0b" unit="mg/dL" />
            <ChartCard title="eGFR" emoji="🔍" data={egfrTrend} goalValue={60} color="#3b82f6" unit="mL/min" />

            {/* eGFR interpretation */}
            <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-amber-300 mb-1">eGFR Stages</h3>
              <div className="text-xs text-amber-200/80 space-y-1">
                <p className={stage === '1' ? 'font-semibold' : ''}>Stage 1: ≥90 (Normal){stage === '1' && ` ← You are here (${latestEgfr})`}</p>
                <p className={stage === '2' ? 'font-semibold' : ''}>Stage 2: 60-89 (Mild decrease){stage === '2' && ` ← You are here (${latestEgfr})`}</p>
                <p className={stage === '3a' ? 'font-semibold' : ''}>Stage 3a: 45-59 (Mild to moderate){stage === '3a' && ` ← You are here (${latestEgfr})`}</p>
                <p className={stage === '3b' ? 'font-semibold' : ''}>Stage 3b: 30-44 (Moderate to severe){stage === '3b' && ` ← You are here (${latestEgfr})`}</p>
                <p className={stage === '4' ? 'font-semibold' : ''}>Stage 4: 15-29 (Severe){stage === '4' && ` ← You are here (${latestEgfr})`}</p>
                <p className={stage === '5' ? 'font-semibold' : ''}>Stage 5: &lt;15 (Kidney failure){stage === '5' && ` ← You are here (${latestEgfr})`}</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Other Tab */}
      {activeTab === 'other' && (
        <div className="space-y-4">
          <ChartCard title="Homocysteine" emoji="⚠️" data={homocysteineTrend} goalValue={10} color="#ef4444" unit="umol/L" />
          <ChartCard title="Platelets" emoji="🩸" data={plateletsTrend} goalValue={150} color="#8b5cf6" unit="x10E3" />
          <ChartCard title="Vitamin D" emoji="☀️" data={vitDTrend} goalValue={50} color="#f59e0b" unit="ng/mL" />
        </div>
      )}
    </div>
  );
}
