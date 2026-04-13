import { useState } from 'react';
import { healthPlan } from '../data/healthPlan';
import { labHistory, keyMetrics, getTrend, getLatestValue } from '../data/labData';
import { imagingHistory, colonoscopyTimeline, cardiacSummary, getResultsByCategory } from '../data/imagingData';

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

// Tab 1: Problem List
function ProblemsTab() {
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
function LabsTab() {
  const [expandedDate, setExpandedDate] = useState(null);

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

      <Section title="Lab History" emoji="📊" defaultOpen={true}>
        <div className="space-y-2">
          {labHistory.slice().reverse().map((lab, i) => {
            const isExpanded = expandedDate === lab.date;
            const flagged = Object.entries(lab.values).filter(([, d]) => d.flag);
            return (
              <div key={i} className="bg-slate-750 rounded-lg border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setExpandedDate(isExpanded ? null : lab.date)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-700/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white">{lab.date}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      lab.source === 'NIH Clinical Center' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-blue-900/50 text-blue-400'
                    }`}>{lab.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {flagged.length > 0 && (
                      <span className="text-xs text-red-400">{flagged.length} flagged</span>
                    )}
                    <span className="text-slate-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {Object.entries(lab.values).map(([name, data], j) => (
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

// Main component
export default function Medical({ data, save, addLabResult, ...rest }) {
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
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'problems': return <ProblemsTab />;
      case 'medications': return <MedicationsTab />;
      case 'labs': return <LabsTab />;
      case 'imaging': return <ImagingTab />;
      case 'hprc': return <HPRCTab />;
      case 'kidney': return <KidneyTab />;
      case 'crohns': return <CrohnsTab />;
      case 'vaccines': return <VaccinesTab vaccineStatus={vaccineStatus} onToggleVaccine={onToggleVaccine} />;
      default: return <ProblemsTab />;
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
