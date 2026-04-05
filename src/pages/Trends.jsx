import { useState, useMemo } from 'react';
import { getTrend } from '../data/labData';

// Reusable SVG trend chart
function TrendChart({ data, goalValue, color, label, unit, height = 200 }) {
  if (!data || data.length < 2) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        {data?.length === 1 ? `Only 1 data point (${data[0].value} ${unit})` : 'Not enough data for a trend'}
      </div>
    );
  }

  const padding = { top: 20, right: 15, bottom: 35, left: 50 };
  const width = 400;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const allVals = goalValue != null ? [...values, goalValue] : values;
  const minVal = Math.min(...allVals) * 0.92;
  const maxVal = Math.max(...allVals) * 1.08;
  const range = maxVal - minVal || 1;

  const scaleX = (i) => padding.left + (i / (data.length - 1)) * chartW;
  const scaleY = (v) => padding.top + chartH - ((v - minVal) / range) * chartH;

  const points = data.map((d, i) => `${scaleX(i)},${scaleY(d.value)}`).join(' ');
  const goalY = goalValue != null ? scaleY(goalValue) : null;

  const labelInterval = Math.max(1, Math.floor(data.length / 5));
  const latest = data[data.length - 1];

  // Grid lines
  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const v = minVal + (range * i) / gridCount;
    return { y: scaleY(v), label: v.toFixed(v >= 100 ? 0 : 1) };
  });

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={padding.left} y1={g.y} x2={width - padding.right} y2={g.y} stroke="#334155" strokeWidth="0.5" />
            <text x={padding.left - 5} y={g.y + 4} textAnchor="end" className="text-[9px]" fill="#64748b">{g.label}</text>
          </g>
        ))}

        {/* Goal line */}
        {goalY != null && (
          <>
            <line x1={padding.left} y1={goalY} x2={width - padding.right} y2={goalY}
              stroke="#22c55e" strokeWidth="1.5" strokeDasharray="6 3" />
            <text x={width - padding.right + 3} y={goalY + 3} className="text-[8px]" fill="#22c55e">Goal</text>
          </>
        )}

        {/* Data line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {data.map((d, i) => (
          <circle key={i} cx={scaleX(i)} cy={scaleY(d.value)} r="4" fill={color} stroke="#1e293b" strokeWidth="2" />
        ))}

        {/* Date labels */}
        {data.map((d, i) => (
          i % labelInterval === 0 || i === data.length - 1 ? (
            <text key={i} x={scaleX(i)} y={height - 5} textAnchor="middle" className="text-[8px]" fill="#64748b">
              {new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            </text>
          ) : null
        ))}
      </svg>

      {/* Current value badge */}
      <div className="flex items-center justify-between mt-1 px-1">
        <span className="text-xs text-slate-400">
          Latest: <span className="font-semibold" style={{ color }}>{latest.value} {unit}</span>
          <span className="text-slate-600 ml-1">({new Date(latest.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})</span>
        </span>
        {goalValue != null && (
          <span className="text-xs text-green-500">Goal: {goalValue} {unit}</span>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, emoji, data, goalValue, color, unit }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-white mb-2">{emoji} {title}</h3>
      <TrendChart data={data} goalValue={goalValue} color={color} unit={unit} />
    </div>
  );
}

const TABS = [
  { id: 'body', label: 'Body' },
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
      {activeTab === 'kidney' && (
        <div className="space-y-4">
          <ChartCard title="Creatinine" emoji="🫘" data={creatinineTrend} goalValue={1.27} color="#f59e0b" unit="mg/dL" />
          <ChartCard title="eGFR" emoji="🔍" data={egfrTrend} goalValue={60} color="#3b82f6" unit="mL/min" />

          {/* eGFR interpretation */}
          <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-amber-300 mb-1">eGFR Stages</h3>
            <div className="text-xs text-amber-200/80 space-y-1">
              <p>Stage 1: ≥90 (Normal)</p>
              <p>Stage 2: 60-89 (Mild decrease)</p>
              <p className="font-semibold">Stage 3a: 45-59 (Mild to moderate) ← You are here (56)</p>
              <p>Stage 3b: 30-44 (Moderate to severe)</p>
            </div>
          </div>
        </div>
      )}

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
