import { useState } from 'react';
import { healthPlan } from '../data/healthPlan';
import { labHistory, keyMetrics, getTrend, getLatestValue } from '../data/labData';
import { imagingHistory, colonoscopyTimeline, cardiacSummary, getResultsByCategory } from '../data/imagingData';
import LabPanelForm from '../components/LabPanelForm';

// Reusable Section component
function Section({ title, emoji, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-750 transition"
      >
        <h2 className="font-semibold text-white">
          {emoji && `${emoji} `}
          {title}
        </h2>
        <span className="text-slate-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 pb-4 -mt-1">{children}</div>}
    </div>
  );
}

const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// Biology Snapshot — moved here from Dashboard. Quick top-of-page view of
// score + body systems status + key lab values, with BP quick-log so this stays
// the place to capture biology-side data.
function BiologySnapshot({ data, save }) {
  const [showBPInput, setShowBPInput] = useState(false);
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');

  // Latest lab values
  const apoB = getLatestValue('ApoB');
  const egfr = getLatestValue('eGFR');
  const a1c = getLatestValue('HbA1c');
  const cal = getLatestValue('Fecal Calprotectin');
  const homo = getLatestValue('Homocysteine');

  // Latest user-logged
  const weights = data?.weightEntries || [];
  const latestW = weights.length > 0 ? [...weights].sort((a, b) => b.date.localeCompare(a.date))[0] : null;
  const bpEntries = data?.bpEntries || [];
  const latestBP = bpEntries.length > 0 ? [...bpEntries].sort((a, b) => b.date.localeCompare(a.date))[0] : null;
  const vo2List = data?.vo2Entries || [];
  const latestVO2 = vo2List.length > 0 ? [...vo2List].sort((a, b) => b.date.localeCompare(a.date))[0] : null;
  const hrEntries = data?.hrEntries || [];
  const latestHR = hrEntries.length > 0 ? [...hrEntries].sort((a, b) => b.date.localeCompare(a.date))[0] : null;

  // Biology score (out of 100, 7 systems × 14.3)
  const partial = (cond) => cond ? 14.3 : 7;
  const score = Math.round(
    (apoB ? (apoB.value < 70 ? 14.3 : apoB.value < 90 ? 10 : apoB.value < 120 ? 5 : 0) : 7) +
    (egfr ? (egfr.value >= 90 ? 14.3 : egfr.value >= 60 ? 10 : egfr.value >= 30 ? 5 : 0) : 7) +
    (a1c ? (a1c.value < 5.7 ? 14.3 : a1c.value < 6.5 ? 10 : 5) : 7) +
    (latestW ? (Math.abs(latestW.weight - 185) < 5 ? 14.3 : Math.abs(latestW.weight - 185) < 15 ? 10 : Math.abs(latestW.weight - 185) < 25 ? 5 : 0) : 7) +
    (latestBP ? (latestBP.systolic < 120 ? 14.3 : latestBP.systolic < 130 ? 10 : latestBP.systolic < 140 ? 5 : 0) : 7) +
    (latestW?.bodyFat ? (latestW.bodyFat < 18 ? 14.3 : latestW.bodyFat < 22 ? 10 : latestW.bodyFat < 28 ? 5 : 0) : 7) +
    (cal ? (cal.value < 50 ? 14.3 : cal.value < 200 ? 10 : 5) : 7)
  );
  void partial; // helper kept for future system additions

  // Status helpers — return green/yellow/red string
  const statusOf = (v, goodAt, okAt, dir = 'lower') => {
    if (v == null) return 'gray';
    if (dir === 'higher') return v >= goodAt ? 'green' : v >= okAt ? 'yellow' : 'red';
    return v < goodAt ? 'green' : v < okAt ? 'yellow' : 'red';
  };

  const systems = [
    { key: 'cardio', label: 'Cardio', emoji: '❤️', status: statusOf(apoB?.value, 90, 120) },
    { key: 'kidney', label: 'Kidney', emoji: '🫘', status: statusOf(egfr?.value, 60, 30, 'higher') },
    { key: 'metabolic', label: 'Metabolic', emoji: '🔬', status: statusOf(a1c?.value, 5.7, 6.5) },
    { key: 'gut', label: 'Gut', emoji: '🦠', status: cal ? statusOf(cal.value, 50, 200) : 'yellow' },
    { key: 'bp', label: 'BP', emoji: '💓', status: latestBP ? statusOf(latestBP.systolic, 130, 140) : 'gray' },
    { key: 'composition', label: 'Body Comp', emoji: '⚖️', status: latestW?.bodyFat ? statusOf(latestW.bodyFat, 22, 28) : 'gray' },
    { key: 'fitness', label: 'Fitness', emoji: '💪', status: latestVO2?.vo2max ? statusOf(latestVO2.vo2max, 35, 25, 'higher') : 'gray' },
  ];

  const STATUS_BG = {
    green: 'bg-green-900/20 border-green-800',
    yellow: 'bg-yellow-900/20 border-yellow-800',
    red: 'bg-red-900/20 border-red-800',
    gray: 'bg-slate-800 border-slate-700',
  };
  const STATUS_DOT = { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500', gray: 'bg-slate-600' };
  const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = score >= 80 ? 'from-green-900/40 to-emerald-900/40 border-green-800/50' : score >= 60 ? 'from-yellow-900/40 to-orange-900/40 border-yellow-800/50' : 'from-red-900/40 to-orange-900/40 border-red-800/50';

  const keyNumbers = [
    { label: 'Weight', value: latestW ? latestW.weight : '—', unit: 'lbs' },
    { label: 'BF', value: latestW?.bodyFat ? latestW.bodyFat : '—', unit: '%' },
    { label: 'ApoB', value: apoB ? apoB.value : '—', unit: '' },
    { label: 'eGFR', value: egfr ? egfr.value : '—', unit: '' },
    { label: 'A1c', value: a1c ? a1c.value : '—', unit: '%' },
    { label: 'Hcy', value: homo ? homo.value : '—', unit: '' },
    { label: 'VO2', value: latestVO2?.vo2max || '—', unit: '' },
    { label: 'BP', value: latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '—', unit: '' },
    { label: 'RHR', value: latestHR?.bpm || '—', unit: '' },
  ];

  return (
    <div className={`rounded-xl border p-4 bg-gradient-to-br ${scoreBg} mb-4`}>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Biology Snapshot</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
            <span className="text-slate-500 text-xs">/ 100 biology score</span>
          </div>
        </div>
      </div>

      {/* Body systems */}
      <div className="grid grid-cols-7 gap-1.5 mb-3">
        {systems.map(sys => (
          <div key={sys.key} className={`${STATUS_BG[sys.status]} border rounded-lg p-1.5 text-center`}>
            <div className="flex items-center justify-center gap-1">
              <div className={`w-2 h-2 rounded-full ${STATUS_DOT[sys.status]}`} />
              <span className="text-xs">{sys.emoji}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{sys.label}</div>
          </div>
        ))}
      </div>

      {/* Key numbers row */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs">
        {keyNumbers.map(n => (
          <span key={n.label} className="text-slate-400">
            <span className="text-slate-500">{n.label}</span>{' '}
            <span className="text-white font-semibold">{n.value}</span>
            {n.unit && <span className="text-slate-600 ml-0.5">{n.unit}</span>}
          </span>
        ))}
      </div>

      {/* Quick BP log */}
      <div className="mt-3">
        <button onClick={() => setShowBPInput(v => !v)} className="text-xs text-blue-400 hover:text-blue-300">
          + Log BP
        </button>
        {showBPInput && (
          <div className="flex gap-2 mt-2 items-center">
            <input type="number" placeholder="Sys" value={bpSys} onChange={e => setBpSys(e.target.value)} className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm" />
            <span className="text-slate-500">/</span>
            <input type="number" placeholder="Dia" value={bpDia} onChange={e => setBpDia(e.target.value)} className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm" />
            <button onClick={() => {
              if (bpSys && bpDia) {
                const entries = [...(data?.bpEntries || []), { id: Date.now(), date: new Date().toISOString().slice(0, 10), systolic: parseInt(bpSys), diastolic: parseInt(bpDia), value: parseInt(bpSys) }];
                save({ bpEntries: entries });
                setBpSys(''); setBpDia(''); setShowBPInput(false);
              }
            }} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Save</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Tab 1: Problem List
function ProblemsTab({ data, save }) {
  const latestEgfr = getLatestValue('eGFR');
  const latestCreat = getLatestValue('Creatinine');
  const latestPlatelets = getLatestValue('Platelets');
  const latestApoB = getLatestValue('ApoB');
  const latestLpa = getLatestValue('Lp(a)');
  const latestHomocysteine = getLatestValue('Homocysteine');

  const problems = [
    {
      risk: 'Coronary artery disease risk',
      why: `ApoB ${latestApoB?.value || '—'}, Lp(a) ${latestLpa?.value || '—'}, Homocysteine ${latestHomocysteine?.value || '—'}`,
      detail: 'CT Coronary Angio (Feb 2025): minimal plaque, <25% stenosis right posterolateral only. CAC score 0.',
      status: 'active',
    },
    {
      risk: 'CKD Stage 3a',
      why: `eGFR ${latestEgfr?.value || '—'} (${latestEgfr?.date || ''}), Creatinine ${latestCreat?.value || '—'}`,
      detail: 'NIH Sep 2025: eGFR 71, Creatinine 1.19. Labcorp Jun 2025: eGFR 56, Creatinine 1.45. Lab variation or hydration-dependent.',
      status: 'monitoring',
    },
    {
      risk: "Crohn's disease / terminal ileitis",
      why: 'Managed — last colonoscopy Mar 2026',
      detail: 'No active Crohn\'s. Hyperplastic polyps only. Next scope per GI.',
      status: 'active',
    },
    {
      risk: 'Pseudothrombocytopenia',
      why: `Labcorp: ${latestPlatelets?.value || '—'} (EDTA artifact). NIH: 208 (Sep 2025)`,
      detail: 'Platelets normal at NIH (208, 152) but consistently low at Labcorp (100-121). EDTA-induced platelet clumping artifact confirmed.',
      status: 'resolved',
    },
    {
      risk: 'HPRC (Hereditary Papillary Renal Cell Carcinoma)',
      why: 'MET c.3335A&gt;G mutation. NIH surveillance.',
      detail: 'Right kidney 0.7cm minimally complex cystic lesion (Sep 2025), stable. Monitored by NIH q2yr MRI.',
      status: 'monitoring',
    },
    {
      risk: 'Hyperlipidemia',
      why: 'On rosuvastatin + ezetimibe',
      status: 'active',
    },
    {
      risk: 'Hyperhomocysteinemia',
      why: `Homocysteine ${latestHomocysteine?.value || '—'} umol/L (goal <10)`,
      detail: 'On B-vitamin supplementation.',
      status: 'active',
    },
  ];

  const statusColors = {
    active: 'text-red-400 bg-red-400/10',
    monitoring: 'text-yellow-400 bg-yellow-400/10',
    resolved: 'text-green-400 bg-green-400/10',
  };

  return (
    <div className="space-y-3">
      <BiologySnapshot data={data} save={save} />
      {problems.map((p, i) => (
        <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-white text-lg">{p.risk}</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[p.status]}`}>
              {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
            </span>
          </div>
          <p className="text-slate-400 text-sm">{p.why}</p>
          {p.detail && <p className="text-slate-500 text-xs mt-2">{p.detail}</p>}
        </div>
      ))}
    </div>
  );
}

// Tab 2: Medications
function MedicationsTab() {
  return (
    <div className="space-y-4">
      {(healthPlan.medSchedule || []).map(group => (
        <Section key={group.time} title={group.label} emoji={group.emoji} defaultOpen={true}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left py-2 font-semibold">Name</th>
                  <th className="text-left py-2 font-semibold">Purpose</th>
                  <th className="text-left py-2 font-semibold">Type</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-700 hover:bg-slate-750/50">
                    <td className="py-3 font-medium text-white">{item.name}</td>
                    <td className="py-3 text-slate-400">{item.notes}</td>
                    <td className="py-3">{item.rx ? <span className="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-400">Rx</span> : <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">Supplement</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ))}
    </div>
  );
}

// Tab 3: Labs
function LabsTab({ labPanels = [], addLabPanel, updateLabPanel, deleteLabPanel }) {
  const [expandedDate, setExpandedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null); // Firestore panel being edited

  const keyLabValues = [
    { marker: 'ApoB', goal: 70, unit: 'mg/dL' },
    { marker: 'LDL-C', goal: 70, unit: 'mg/dL' },
    { marker: 'eGFR', goal: 60, unit: 'mL/min' },
    { marker: 'Creatinine', goal: 1.27, unit: 'mg/dL' },
    { marker: 'Homocysteine', goal: 10, unit: 'umol/L' },
    { marker: 'Lp(a)', goal: null, unit: 'nmol/L', note: 'genetic' },
    { marker: 'Platelets', goal: 150, unit: 'x10E3' },
    { marker: 'HbA1c', goal: 5.7, unit: '%' },
  ].map(kv => {
    const latest = getLatestValue(kv.marker);
    return {
      ...kv,
      current: latest?.value ?? '—',
      date: latest?.date ?? null,
      warning: latest?.flag === 'high' || latest?.flag === 'low' || latest?.flag === 'critical',
    };
  });

  const getTrendArrow = (testName) => {
    const trend = getTrend(testName);
    if (trend.length < 2) return '→';
    const prev = trend[trend.length - 2].value;
    const curr = trend[trend.length - 1].value;
    if (curr > prev) return '↑';
    if (curr < prev) return '↓';
    return '→';
  };

  // Build a unified, date-descending list of panels with provenance so the user
  // can see and edit Firestore-added panels alongside the static ones.
  const userPanelDates = new Set(labPanels.map(p => p.date + '|' + (p.source || '')));
  const merged = [
    ...labPanels.map(p => ({ ...p, _source: 'firestore' })),
    ...labHistory
      .filter(p => !userPanelDates.has(p.date + '|' + (p.source || '')))
      .map(p => ({ ...p, _source: 'static' })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const handleSubmit = async (panel) => {
    if (editingPanel) {
      await updateLabPanel(editingPanel.id, panel);
    } else {
      await addLabPanel(panel);
    }
    setShowForm(false);
    setEditingPanel(null);
  };

  const handleDelete = async () => {
    if (!editingPanel) return;
    await deleteLabPanel(editingPanel.id);
    setShowForm(false);
    setEditingPanel(null);
  };

  return (
    <div className="space-y-4">
      <Section title="Key Lab Values" emoji="🔬" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {keyLabValues.map((kv, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border ${
                kv.warning
                  ? 'bg-red-400/10 border-red-400/30'
                  : 'bg-slate-750 border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-semibold text-white">{kv.marker}</h4>
                <span className="text-xl">{getTrendArrow(kv.marker)}</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-lg font-bold ${kv.warning ? 'text-red-300' : 'text-slate-200'}`}>
                  {kv.current}
                </span>
                <span className="text-xs text-slate-500">{kv.unit}</span>
              </div>
              <div className="flex items-center gap-2">
                {kv.goal ? (
                  <p className="text-xs text-slate-400">Goal: {kv.goal} {kv.unit}</p>
                ) : (
                  <p className="text-xs text-slate-400">{kv.note}</p>
                )}
                {kv.date && <span className="text-xs text-slate-600">{kv.date}</span>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">All Lab Panels</h2>
        <button
          onClick={() => { setEditingPanel(null); setShowForm(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
        >
          + New Panel
        </button>
      </div>

      <Section title="Lab History" emoji="📊" defaultOpen={true}>
        <div className="space-y-2">
          {merged.map((lab, i) => {
            const key = lab.id || `${lab.date}-${i}`;
            const isExpanded = expandedDate === key;
            const flagged = Object.entries(lab.values || {}).filter(([, d]) => d.flag);
            const isUserPanel = lab._source === 'firestore';
            return (
              <div key={key} className="bg-slate-750 rounded-lg border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setExpandedDate(isExpanded ? null : key)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-700/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white">{lab.date}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      lab.source === 'NIH Clinical Center' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-blue-900/50 text-blue-400'
                    }`}>{lab.source}</span>
                    {lab.provider && <span className="text-xs text-slate-500">{lab.provider}</span>}
                    {isUserPanel && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400" title="Added via app">app</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {flagged.length > 0 && (
                      <span className="text-xs text-red-400">{flagged.length} flagged</span>
                    )}
                    {isUserPanel && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingPanel(lab); setShowForm(true); }}
                        className="text-xs text-blue-400 hover:text-blue-300 px-1"
                        title="Edit panel"
                      >Edit</button>
                    )}
                    <span className="text-slate-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {Object.entries(lab.values || {}).map(([name, data], j) => (
                        <div key={j} className={`p-2 rounded ${data.flag ? 'bg-red-400/10' : ''}`}>
                          <span className="text-slate-500">{name}</span>
                          <div className="flex items-baseline gap-1">
                            <span className={data.value == null ? 'italic text-slate-600' : `font-medium ${data.flag ? 'text-red-300' : 'text-white'}`}>
                              {data.value ?? 'N/A'}
                            </span>
                            {data.value != null && <span className="text-slate-600">{data.unit}</span>}
                          </div>
                          {data.ref && <span className="text-slate-600">ref: {data.ref}</span>}
                          {data.note && <div className="text-yellow-500 mt-0.5">{data.note}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {showForm && (
        <LabPanelForm
          initial={editingPanel || undefined}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingPanel(null); }}
          onDelete={editingPanel ? handleDelete : undefined}
        />
      )}
    </div>
  );
}

// Tab 4: Imaging — now using real data
function ImagingTab() {
  const [expandedIdx, setExpandedIdx] = useState(null);

  const categoryLabels = {
    cardiac: { emoji: '❤️', label: 'Cardiac' },
    gi: { emoji: '🔬', label: 'GI / Colonoscopy' },
    renal: { emoji: '🫘', label: 'Renal / HPRC' },
    ecg: { emoji: '⚡', label: 'ECG' },
    genetics: { emoji: '🧬', label: 'Genetics' },
    pathology: { emoji: '🔬', label: 'Pathology' },
  };

  // Group by category
  const grouped = {};
  imagingHistory.forEach((item, idx) => {
    const cat = item.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ ...item, _idx: idx });
  });

  const categoryOrder = ['cardiac', 'renal', 'gi', 'ecg', 'pathology', 'genetics'];

  return (
    <div className="space-y-4">
      {categoryOrder.filter(cat => grouped[cat]).map(cat => {
        const catInfo = categoryLabels[cat] || { emoji: '📋', label: cat };
        return (
          <Section key={cat} title={catInfo.label} emoji={catInfo.emoji} defaultOpen={cat === 'cardiac' || cat === 'renal'}>
            <div className="space-y-2">
              {grouped[cat].sort((a, b) => b.date.localeCompare(a.date)).map((item) => {
                const isExpanded = expandedIdx === item._idx;
                return (
                  <div key={item._idx} className="bg-slate-750 rounded-lg border border-slate-700 overflow-hidden">
                    <button
                      onClick={() => setExpandedIdx(isExpanded ? null : item._idx)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-700/50 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white text-sm truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400">{formatDate(item.date)}</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            item.source === 'NIH Clinical Center' ? 'bg-emerald-900/50 text-emerald-400' :
                            'bg-blue-900/50 text-blue-400'
                          }`}>{item.source}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                          item.result === 'Normal' || item.result === 'Stable' ? 'bg-green-400/10 text-green-400' :
                          item.result === 'Abnormal' ? 'bg-red-400/10 text-red-400' :
                          'bg-yellow-400/10 text-yellow-400'
                        }`}>{item.result}</span>
                        <span className="text-slate-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2">
                        <p className="text-sm text-slate-300">{item.summary}</p>
                        {item.provider && <p className="text-xs text-slate-500">Radiologist/Provider: {item.provider}</p>}
                        {item.details && (
                          <div className="mt-2 space-y-1">
                            {Object.entries(item.details).filter(([k]) => k !== 'impression').map(([key, val]) => (
                              <div key={key} className="text-xs">
                                <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                                <span className="text-slate-300">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                              </div>
                            ))}
                            {item.details.impression && (
                              <div className="mt-2 p-2 bg-slate-800 rounded border border-slate-600">
                                <span className="text-xs text-slate-400 font-semibold">Impression: </span>
                                <span className="text-xs text-white">{item.details.impression}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        );
      })}
    </div>
  );
}

// Tab 5: Vaccines
const VACCINE_LIST = [
  { id: 'covid', name: 'COVID booster', frequency: 'Annual' },
  { id: 'flu', name: 'Flu', frequency: 'Annual' },
  { id: 'shingrix', name: 'Shingrix', frequency: '2 doses after 50' },
  { id: 'tdap', name: 'Tdap', frequency: 'Every 10 years' },
  { id: 'pneumo', name: 'Pneumococcal', frequency: 'Consider with Crohn\'s/immunomodulators' },
];

function VaccinesTab({ vaccineStatus = {}, onToggleVaccine }) {
  return (
    <div className="space-y-3">
      {VACCINE_LIST.map(vax => {
        const status = vaccineStatus[vax.id];
        const done = status?.completed || false;
        return (
          <div key={vax.id} className={`border rounded-lg p-4 flex items-start gap-3 ${done ? 'bg-green-900/20 border-green-700' : 'bg-slate-800 border-slate-700'}`}>
            <button onClick={() => onToggleVaccine?.(vax.id)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                done ? 'border-green-500 bg-green-500' : 'border-slate-500 hover:border-blue-400'
              }`}>{done && <span className="text-white text-xs">✓</span>}</button>
            <div className="flex-1">
              <h3 className={`font-semibold ${done ? 'text-green-400' : 'text-white'}`}>{vax.name}</h3>
              <p className="text-sm text-slate-400">{vax.frequency}</p>
              {status?.date && <p className="text-xs text-slate-500 mt-1">Last: {formatDate(status.date)}</p>}
            </div>
            {done && !status?.date && (
              <input type="date" className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                onChange={e => onToggleVaccine?.(vax.id, e.target.value)} placeholder="Date" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Tab 6: Kidney
function KidneyTab() {
  const creatinineTrend = getTrend('Creatinine');
  const egfrTrend = getTrend('eGFR');
  const latestEgfr = getLatestValue('eGFR');
  const latestCreat = getLatestValue('Creatinine');

  const egfrVal = latestEgfr?.value;
  const ckdStage = egfrVal >= 90 ? 'Stage 1' : egfrVal >= 60 ? 'Stage 2' : egfrVal >= 45 ? 'Stage 3a' : egfrVal >= 30 ? 'Stage 3b' : 'Stage 4+';

  return (
    <div className="space-y-4">
      <Section title="Current Status" emoji="🫘" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-400 mb-1">eGFR</p>
            <p className="text-2xl font-bold text-yellow-400">{latestEgfr?.value || '—'}</p>
            <p className="text-xs text-slate-500 mt-1">{ckdStage} CKD · {latestEgfr?.date || ''}</p>
          </div>
          <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-400 mb-1">Creatinine</p>
            <p className="text-2xl font-bold text-yellow-400">{latestCreat?.value || '—'} mg/dL</p>
            <p className="text-xs text-slate-500 mt-1">Goal: &lt; 1.27 · {latestCreat?.date || ''}</p>
          </div>
        </div>
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3 text-xs text-blue-300">
          Note: eGFR varies between labs. NIH (Sep 2025): 71. Labcorp (Jun 2025): 56. Hydration, timing, and lab methodology affect results.
        </div>
      </Section>

      <Section title="Trend Data" emoji="📈" defaultOpen={true}>
        {creatinineTrend.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Creatinine History</h4>
            <div className="space-y-1 text-xs">
              {creatinineTrend.map((t, i) => {
                const lab = labHistory.find(l => l.date === t.date);
                return (
                  <div key={i} className="flex justify-between text-slate-400">
                    <span>{t.date} <span className="text-slate-600">({lab?.source || ''})</span></span>
                    <span className="font-medium text-white">{t.value} mg/dL</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {egfrTrend.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2">eGFR History</h4>
            <div className="space-y-1 text-xs">
              {egfrTrend.map((t, i) => {
                const lab = labHistory.find(l => l.date === t.date);
                return (
                  <div key={i} className="flex justify-between text-slate-400">
                    <span>{t.date} <span className="text-slate-600">({lab?.source || ''})</span></span>
                    <span className="font-medium text-white">{t.value} mL/min</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Section>

      <Section title="Actions" emoji="✅" defaultOpen={true}>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-2"><span className="text-slate-500">•</span><span>Stay hydrated (80+ oz water daily)</span></li>
          <li className="flex gap-2"><span className="text-slate-500">•</span><span>Avoid NSAIDs (ibuprofen, naproxen)</span></li>
          <li className="flex gap-2"><span className="text-slate-500">•</span><span>Monitor with labs every 6 months</span></li>
          <li className="flex gap-2"><span className="text-slate-500">•</span><span>Control blood pressure</span></li>
        </ul>
      </Section>
    </div>
  );
}

// Tab 7: Crohn's — updated with real colonoscopy data
function CrohnsTab() {
  return (
    <div className="space-y-4">
      <Section title="Diagnosis" emoji="🔬" defaultOpen={true}>
        <div className="space-y-3 text-sm text-slate-300">
          <div>
            <p className="text-slate-400 text-xs mb-1">Primary Diagnosis</p>
            <p className="font-semibold text-white">Terminal Ileitis (Crohn's Disease)</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Current Status</p>
            <p className="font-semibold text-green-400">Managed / Quiescent</p>
          </div>
        </div>
      </Section>

      <Section title="Colonoscopy Timeline" emoji="📅" defaultOpen={true}>
        <div className="space-y-2">
          {colonoscopyTimeline.slice().reverse().map((entry, i) => (
            <div key={i} className="bg-slate-750 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white text-sm">{formatDate(entry.date)}</span>
                <span className="text-xs text-slate-500">{entry.provider}</span>
              </div>
              <p className="text-xs text-slate-400">{entry.finding}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Monitoring Plan" emoji="📋" defaultOpen={true}>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-2"><span className="text-slate-500">•</span><span><strong>Colonoscopy:</strong> Every 3 years for surveillance</span></li>
          <li className="flex gap-2"><span className="text-slate-500">•</span><span><strong>Fecal Calprotectin:</strong> Monitor for disease activity</span></li>
          <li className="flex gap-2"><span className="text-slate-500">•</span><span><strong>CMP & CBC:</strong> As needed or with medication changes</span></li>
        </ul>
      </Section>

      <Section title="Management" emoji="💊" defaultOpen={false}>
        <div className="space-y-3 text-sm text-slate-300">
          <p>Managed with dietary modifications and monitoring. No active biologics.</p>
          <ul className="space-y-1 text-slate-400 ml-3">
            <li>• Mediterranean diet (anti-inflammatory)</li>
            <li>• Probiotics</li>
            <li>• Adequate hydration</li>
            <li>• Stress management</li>
            <li>• Avoid NSAIDs</li>
          </ul>
        </div>
      </Section>
    </div>
  );
}

// Tab 8: HPRC Surveillance
function HPRCTab() {
  const renalStudies = getResultsByCategory('renal').sort((a, b) => a.date.localeCompare(b.date));

  // Build cyst progression data
  const cystProgression = [
    { date: '2016-11-03', size: '0.4cm', description: 'Tiny probable right renal cyst (baseline)' },
    { date: '2017-10-31', size: '0.6cm', description: 'Stable cyst, lower pole right kidney' },
    { date: '2020-10-27', size: 'present', description: 'No solid mass identified (cyst not separately measured)' },
    { date: '2021-08-03', size: 'subcm', description: 'Subcentimeter cyst, unchanged' },
    { date: '2023-09-14', size: '0.6cm', description: 'Cortical cyst, stable' },
    { date: '2025-09-02', size: '0.7cm', description: 'Minimally complex cystic lesion with tiny septation' },
  ];

  return (
    <div className="space-y-4">
      <Section title="Genetic Basis" emoji="🧬" defaultOpen={true}>
        <div className="space-y-2 text-sm text-slate-300">
          <div className="bg-slate-750 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Mutation</p>
            <p className="font-semibold text-white">MET c.3335A&gt;G (Hereditary Papillary Renal Cell Carcinoma)</p>
          </div>
          <div className="bg-slate-750 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Surveillance Protocol</p>
            <p className="text-white">NIH Protocol #89-C-0086 (PI: Dr. W. Marston Linehan)</p>
            <p className="text-xs text-slate-500 mt-1">MRI Abdomen every ~2 years</p>
          </div>
        </div>
      </Section>

      <Section title="Right Kidney Cyst Progression" emoji="📈" defaultOpen={true}>
        <div className="space-y-1">
          {cystProgression.map((entry, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded text-sm">
              <div className="w-24 text-xs text-slate-400 shrink-0">{entry.date}</div>
              <div className={`w-16 text-center font-bold shrink-0 ${
                entry.size === '0.7cm' ? 'text-yellow-400' : 'text-slate-300'
              }`}>{entry.size}</div>
              <div className="text-xs text-slate-400 flex-1">{entry.description}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3 text-xs text-yellow-300">
          0.3cm growth over 9 years. The key change is the appearance of septation by 2025, shifting classification from simple cyst to minimally complex cystic lesion.
        </div>
      </Section>

      <Section title="MRI History" emoji="🖼️" defaultOpen={true}>
        <div className="space-y-2">
          {renalStudies.slice().reverse().map((study, i) => (
            <div key={i} className="bg-slate-750 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white text-sm">{formatDate(study.date)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  study.result === 'Stable' || study.result === 'Essentially normal' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'
                }`}>{study.result}</span>
              </div>
              <p className="text-xs text-slate-400">{study.provider}</p>
              <p className="text-sm text-slate-300 mt-1">{study.summary}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// Tab 9: Visit Prep
function VisitPrepTab() {
  // Compute what's due based on monitoring schedule and last lab dates
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Find most recent date for each test
  const lastDate = (testName) => {
    for (let i = labHistory.length - 1; i >= 0; i--) {
      if (labHistory[i].values[testName]?.value != null) return labHistory[i].date;
    }
    return null;
  };

  const monthsSince = (dateStr) => {
    if (!dateStr) return Infinity;
    const d = new Date(dateStr);
    return Math.round((today - d) / (30.44 * 86400000));
  };

  // Upcoming appointments (next 30 days)
  const appointments = [];
  // Primary care Apr 24 is hardcoded context from the user
  const upcomingVisit = { type: 'Primary Care', date: '2026-04-24', daysOut: Math.ceil((new Date('2026-04-24') - new Date(todayStr)) / 86400000) };

  // === LABS TO REQUEST ===
  const labsToRequest = [];

  // Lipid/ApoB — last Jun 2025, 10 months ago, 6-month cadence
  const lastApoB = lastDate('ApoB');
  if (monthsSince(lastApoB) >= 5) {
    labsToRequest.push({
      panel: 'NMR LipoProfile + ApoB',
      reason: `Last drawn ${lastApoB || 'never'}${monthsSince(lastApoB) !== Infinity ? ` (${monthsSince(lastApoB)} months ago)` : ''}. ApoB was 111 mg/dL (goal <70). On rosuvastatin + ezetimibe — need to assess response.`,
      priority: 'high',
      markers: ['ApoB', 'LDL-P', 'LDL-C', 'HDL-C', 'Triglycerides', 'Lp(a)'],
    });
  }

  // CMP (kidney function) — last Sep 2025 NIH, 7 months ago
  const lastCreat = lastDate('Creatinine');
  if (monthsSince(lastCreat) >= 5) {
    labsToRequest.push({
      panel: 'Comprehensive Metabolic Panel (CMP)',
      reason: `Last drawn ${lastCreat || 'never'}${monthsSince(lastCreat) !== Infinity ? ` (${monthsSince(lastCreat)} months ago)` : ''}. Creatinine ranged 1.19–1.45, eGFR 56–71 between labs. Critical to recheck kidney function.`,
      priority: 'high',
      markers: ['Creatinine', 'eGFR', 'BUN', 'Glucose', 'Electrolytes'],
    });
  }

  // Homocysteine — last Jun 2025, was 21.4 (goal <10)
  const lastHcy = lastDate('Homocysteine');
  if (monthsSince(lastHcy) >= 5) {
    labsToRequest.push({
      panel: 'Homocysteine',
      reason: `Last drawn ${lastHcy || 'never'} at 21.4 umol/L (goal <10). On B-vitamin supplementation — need to check if it's working.`,
      priority: 'high',
      markers: ['Homocysteine'],
    });
  }

  // CBC — last Sep 2025
  const lastCBC = lastDate('WBC');
  if (monthsSince(lastCBC) >= 5) {
    labsToRequest.push({
      panel: 'CBC with Differential',
      reason: `Last drawn ${lastCBC || 'never'}${monthsSince(lastCBC) !== Infinity ? ` (${monthsSince(lastCBC)} months ago)` : ''}. Monitoring platelets (pseudothrombocytopenia at Labcorp, normal at NIH).`,
      priority: 'medium',
      markers: ['WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'Platelets'],
    });
  }

  // Vitamin D — last Jun 2025
  const lastVitD = lastDate('Vitamin D');
  if (monthsSince(lastVitD) >= 9) {
    labsToRequest.push({
      panel: 'Vitamin D, 25-Hydroxy',
      reason: `Last drawn ${lastVitD || 'never'} at 46.8 ng/mL. Supplementing — annual recheck.`,
      priority: 'low',
      markers: ['Vitamin D'],
    });
  }

  // HbA1c — last Jun 2025
  const lastA1c = lastDate('HbA1c');
  if (monthsSince(lastA1c) >= 9) {
    labsToRequest.push({
      panel: 'HbA1c',
      reason: `Last drawn ${lastA1c || 'never'} at 5.0%. Annual metabolic check.`,
      priority: 'low',
      markers: ['HbA1c'],
    });
  }

  // hs-CRP — last Jun 2025
  const lastCRP = lastDate('CRP');
  if (monthsSince(lastCRP) >= 9) {
    labsToRequest.push({
      panel: 'hs-CRP',
      reason: `Last drawn ${lastCRP || 'never'} at 0.34 mg/L. Annual inflammation marker.`,
      priority: 'low',
      markers: ['CRP'],
    });
  }

  // === QUESTIONS FOR THE DOCTOR ===
  const questions = [
    {
      topic: 'PSA Increase',
      emoji: '⚠️',
      priority: 'high',
      question: 'PSA went from 0.7 (Oct 2024) to 3.02 (Mar 2026). Still within range (0–4) but a 4x increase. Is this clinically significant? Should we recheck or get a free PSA ratio?',
    },
    {
      topic: 'FSH Elevated',
      emoji: '⚠️',
      priority: 'high',
      question: 'FSH was 20.5 mIU/mL (ref 1.5–12.4) on the H&H panel. Combined with testosterone dropping from 619 to 483 — does this suggest primary hypogonadism? What workup do you recommend?',
    },
    {
      topic: 'Kidney Function Trend',
      emoji: '🫘',
      priority: 'high',
      question: 'eGFR has ranged from 56 (Labcorp, Jun 2025) to 71 (NIH, Sep 2025). Creatinine 1.19–1.45 across labs. Is this CKD Stage 2 vs 3a? Should we get a cystatin C for a more accurate GFR estimate?',
    },
    {
      topic: 'Lipid Management',
      emoji: '❤️',
      priority: 'medium',
      question: 'ApoB is still 111 (goal <70) and triglycerides spiked to 236 in June 2025. On rosuvastatin + ezetimibe. Should we increase the statin dose or add icosapent ethyl (Vascepa)?',
    },
    {
      topic: 'Homocysteine Follow-up',
      emoji: '📊',
      priority: 'medium',
      question: 'Homocysteine was 21.4 in June 2025 (goal <10). Have been taking B-vitamins. Is there a better methylfolate/B12 protocol if levels remain high?',
    },
    {
      topic: 'Testosterone / Enclomiphene',
      emoji: '💊',
      priority: 'medium',
      question: 'Testosterone 483 (was 619 in 2023). Currently on enclomiphene from H&H — should this be monitored through you as well? Any concerns with the current protocol?',
    },
    {
      topic: 'Platelet Monitoring',
      emoji: '🩸',
      priority: 'low',
      question: 'Platelets consistently low at Labcorp (100–121) but normal at NIH (152, 208). EDTA artifact confirmed. Can we add a citrated platelet count at Labcorp to avoid false lows?',
    },
  ];

  const priorityColors = {
    high: 'border-red-500/30 bg-red-900/10',
    medium: 'border-yellow-500/30 bg-yellow-900/10',
    low: 'border-slate-600 bg-slate-800',
  };

  const priorityBadge = {
    high: 'bg-red-400/20 text-red-400',
    medium: 'bg-yellow-400/20 text-yellow-400',
    low: 'bg-slate-700 text-slate-400',
  };

  return (
    <div className="space-y-4">
      {/* Visit header */}
      <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white text-lg">🩺 Primary Care Visit</h3>
            <p className="text-sm text-blue-300 mt-1">
              {new Date('2026-04-24T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-400">{upcomingVisit.daysOut}</span>
            <p className="text-xs text-blue-400">days away</p>
          </div>
        </div>
      </div>

      {/* Labs to request */}
      <Section title={`Labs to Request (${labsToRequest.length})`} emoji="🧪" defaultOpen={true}>
        <div className="space-y-3">
          {labsToRequest.map((lab, i) => (
            <div key={i} className={`rounded-lg border p-3 ${priorityColors[lab.priority]}`}>
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-semibold text-white text-sm">{lab.panel}</h4>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityBadge[lab.priority]}`}>
                  {lab.priority}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{lab.reason}</p>
              <div className="flex flex-wrap gap-1">
                {lab.markers.map(m => (
                  <span key={m} className="text-xs bg-slate-700/70 text-slate-300 px-2 py-0.5 rounded">{m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Questions for the doctor */}
      <Section title={`Questions to Discuss (${questions.length})`} emoji="❓" defaultOpen={true}>
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={i} className={`rounded-lg border p-3 ${priorityColors[q.priority]}`}>
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-semibold text-white text-sm">{q.emoji} {q.topic}</h4>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityBadge[q.priority]}`}>
                  {q.priority}
                </span>
              </div>
              <p className="text-sm text-slate-300">{q.question}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Quick reference: recent flagged values */}
      <Section title="Recent Flagged Values" emoji="🚩" defaultOpen={false}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {[
            { name: 'ApoB', val: '111', unit: 'mg/dL', ref: '<90', date: '2025-06-27' },
            { name: 'Homocysteine', val: '21.4', unit: 'umol/L', ref: '0-14.5', date: '2025-06-27' },
            { name: 'FSH', val: '20.5', unit: 'mIU/mL', ref: '1.5-12.4', date: '2026-03-25' },
            { name: 'PSA', val: '3.02', unit: 'ng/mL', ref: '0-4', date: '2026-03-25' },
            { name: 'Creatinine', val: '1.19–1.45', unit: 'mg/dL', ref: '0.76-1.27', date: '2025' },
            { name: 'eGFR', val: '56–71', unit: 'mL/min', ref: '>59', date: '2025' },
            { name: 'Triglycerides', val: '236', unit: 'mg/dL', ref: '0-149', date: '2025-06-27' },
            { name: 'LDL-C', val: '146', unit: 'mg/dL', ref: '0-99', date: '2025-06-27' },
            { name: 'Testosterone', val: '483', unit: 'ng/dL', ref: '193-740', date: '2026-03-25', note: 'In range but ↓ from 619' },
          ].map((item, i) => (
            <div key={i} className="p-2 rounded bg-red-400/10">
              <span className="text-slate-500">{item.name}</span>
              <div className="font-medium text-red-300">{item.val} <span className="text-slate-600">{item.unit}</span></div>
              <span className="text-slate-600">ref: {item.ref}</span>
              {item.note && <div className="text-yellow-500 mt-0.5">{item.note}</div>}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// Main component
export default function Medical({ data, save, addLabResult, labPanels, addLabPanel, updateLabPanel, deleteLabPanel, ...rest }) {
  const [activeTab, setActiveTab] = useState('problems');
  const [searchQuery, setSearchQuery] = useState('');

  const vaccineStatus = data?.vaccineStatus || {};
  const onToggleVaccine = (id, date) => {
    const current = vaccineStatus[id] || {};
    if (date) {
      // Setting date on already-completed vaccine
      save({ vaccineStatus: { ...vaccineStatus, [id]: { ...current, completed: true, date } } });
    } else {
      // Toggle completed
      save({ vaccineStatus: { ...vaccineStatus, [id]: { ...current, completed: !current.completed } } });
    }
  };

  const tabs = [
    { id: 'problems', label: 'Problems', icon: '⚕️' },
    { id: 'medications', label: 'Meds', icon: '💊' },
    { id: 'labs', label: 'Labs', icon: '🔬' },
    { id: 'imaging', label: 'Imaging', icon: '🖼️' },
    { id: 'hprc', label: 'HPRC', icon: '🫘' },
    { id: 'kidney', label: 'Kidney', icon: '🫘' },
    { id: 'crohns', label: "Crohn's", icon: '🔬' },
    { id: 'vaccines', label: 'Vaccines', icon: '💉' },
    { id: 'visit-prep', label: 'Visit Prep', icon: '📋' },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'visit-prep': return <VisitPrepTab />;
      case 'problems': return <ProblemsTab data={data} save={save} />;
      case 'medications': return <MedicationsTab />;
      case 'labs': return <LabsTab labPanels={labPanels} addLabPanel={addLabPanel} updateLabPanel={updateLabPanel} deleteLabPanel={deleteLabPanel} />;
      case 'imaging': return <ImagingTab />;
      case 'hprc': return <HPRCTab />;
      case 'kidney': return <KidneyTab />;
      case 'crohns': return <CrohnsTab />;
      case 'vaccines': return <VaccinesTab vaccineStatus={vaccineStatus} onToggleVaccine={onToggleVaccine} />;
      default: return <VisitPrepTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-white mb-1">Medical EHR</h1>
          <p className="text-slate-400 text-sm">Labcorp, Atrium Health, NIH Clinical Center</p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input type="text" placeholder="Search labs, imaging, meds..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg font-medium whitespace-nowrap transition text-sm ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div>
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
