import { useState } from 'react';
import { healthPlan } from '../data/healthPlan';
import { labHistory, keyMetrics, getTrend, getLatestValue } from '../data/labData';

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

// Tab 1: Problem List
function ProblemsTab() {
  const problems = [
    {
      risk: 'Coronary artery disease risk',
      why: 'High ApoB 111, Lp(a) 181.7, homocysteine 21.4',
      status: 'active',
    },
    {
      risk: 'CKD Stage 3a',
      why: 'eGFR 56, creatinine 1.45, declining',
      status: 'monitoring',
    },
    {
      risk: "Crohn's disease / terminal ileitis",
      why: 'Managed',
      status: 'active',
    },
    {
      risk: 'Thrombocytopenia',
      why: 'Platelets 121, stable',
      status: 'monitoring',
    },
    {
      risk: 'Hyperlipidemia',
      why: 'On rosuvastatin + ezetimibe',
      status: 'active',
    },
    {
      risk: 'Low testosterone',
      why: 'On enclomiphene',
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
        </div>
      ))}
    </div>
  );
}

// Tab 2: Medications
function MedicationsTab() {
  const medicationTiming = {
    'Rosuvastatin 5 mg': { timing: 'Evening', withFood: 'N' },
    'Ezetimibe 10 mg': { timing: 'Morning', withFood: 'Y' },
    'GLP-1 (semaglutide or tirzepatide)': { timing: 'Weekly', withFood: 'N' },
    'Enclomiphene': { timing: 'Morning', withFood: 'N' },
    'Vitamin D': { timing: 'Morning', withFood: 'Y' },
    'Fish oil (EPA/DHA)': { timing: 'Morning', withFood: 'Y' },
    'Creatine 5 g/day': { timing: 'Anytime', withFood: 'N' },
    'Magnesium': { timing: 'Evening', withFood: 'N' },
    'Probiotic': { timing: 'Morning', withFood: 'N' },
    'Novo': { timing: 'Morning', withFood: 'N' },
  };

  const allMeds = [...healthPlan.medications, ...healthPlan.supplements];

  return (
    <div className="space-y-4">
      <Section title="Prescription Medications" emoji="💊" defaultOpen={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left py-2 font-semibold">Name</th>
                <th className="text-left py-2 font-semibold">Purpose</th>
                <th className="text-left py-2 font-semibold">Timing</th>
                <th className="text-left py-2 font-semibold">With Food?</th>
              </tr>
            </thead>
            <tbody>
              {healthPlan.medications.map((med, i) => {
                const timing = medicationTiming[med.name] || {};
                return (
                  <tr key={i} className="border-b border-slate-700 hover:bg-slate-750/50">
                    <td className="py-3">{med.name}</td>
                    <td className="py-3 text-slate-400">{med.why}</td>
                    <td className="py-3">{timing.timing || '—'}</td>
                    <td className="py-3">{timing.withFood || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Supplements" emoji="🥤" defaultOpen={true}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left py-2 font-semibold">Name</th>
                <th className="text-left py-2 font-semibold">Purpose</th>
                <th className="text-left py-2 font-semibold">Timing</th>
                <th className="text-left py-2 font-semibold">With Food?</th>
              </tr>
            </thead>
            <tbody>
              {healthPlan.supplements.map((sup, i) => {
                const timing = medicationTiming[sup.name] || {};
                return (
                  <tr key={i} className="border-b border-slate-700 hover:bg-slate-750/50">
                    <td className="py-3">{sup.name}</td>
                    <td className="py-3 text-slate-400">{sup.why}</td>
                    <td className="py-3">{timing.timing || '—'}</td>
                    <td className="py-3">{timing.withFood || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

// Tab 3: Labs
function LabsTab() {
  const keyLabValues = [
    { marker: 'ApoB', current: 111, goal: 70, unit: 'mg/dL', warning: true },
    { marker: 'LDL', current: 146, goal: 70, unit: 'mg/dL', warning: true },
    { marker: 'eGFR', current: 56, goal: 60, unit: 'mL/min', warning: true },
    { marker: 'Creatinine', current: 1.45, goal: 1.27, unit: 'mg/dL', warning: true },
    { marker: 'Homocysteine', current: 21.4, goal: 10, unit: 'umol/L', warning: true },
    { marker: 'Lp(a)', current: 181.7, goal: null, unit: 'nmol/L', warning: false, note: 'genetic' },
    { marker: 'Platelets', current: 121, goal: 150, unit: 'x10E3', warning: false },
  ];

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
              {kv.goal ? (
                <p className="text-xs text-slate-400">Goal: {kv.goal} {kv.unit}</p>
              ) : (
                <p className="text-xs text-slate-400">{kv.note}</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Recent Lab Results" emoji="📊" defaultOpen={true}>
        <div className="space-y-2">
          {labHistory.slice().reverse().map((lab, i) => (
            <div key={i} className="bg-slate-750 rounded-lg p-3 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">{lab.date}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {Object.entries(lab.values).map(([name, data], j) => (
                  <div key={j} className="text-slate-400">
                    <span className="text-slate-500">{name}:</span>{' '}
                    <span className={data.value == null ? 'italic text-slate-600' : 'text-white font-medium'}>
                      {data.value ?? 'N/A'}
                    </span>
                    {data.value && <span className="text-slate-600"> {data.unit}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// Tab 4: Imaging
function ImagingTab() {
  const imagingStudies = [
    { study: 'Coronary calcium score', lastDone: null, nextDue: 'Schedule', status: 'pending' },
    { study: 'Colonoscopy', lastDone: '>3 years ago', nextDue: 'Due (Crohn\'s monitoring)', status: 'overdue' },
    { study: 'DEXA scan', lastDone: null, nextDue: 'Schedule', status: 'pending' },
    { study: 'Echocardiogram', lastDone: null, nextDue: 'Schedule', status: 'pending' },
  ];

  const statusColors = {
    pending: 'bg-slate-700 text-slate-300',
    overdue: 'bg-red-400/10 text-red-300',
    completed: 'bg-green-400/10 text-green-300',
  };

  return (
    <div className="space-y-3">
      {imagingStudies.map((img, i) => (
        <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-white">{img.study}</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[img.status]}`}>
              {img.status.charAt(0).toUpperCase() + img.status.slice(1)}
            </span>
          </div>
          {img.lastDone && <p className="text-sm text-slate-400 mb-1">Last done: {img.lastDone}</p>}
          <p className="text-sm text-yellow-400 font-medium">{img.nextDue}</p>
        </div>
      ))}
    </div>
  );
}

// Tab 5: Vaccines
function VaccinesTab() {
  const vaccines = [
    { name: 'COVID booster', frequency: 'Annual', completed: false },
    { name: 'Flu', frequency: 'Annual', completed: false },
    { name: 'Shingrix', frequency: '2 doses after 50', completed: false },
    { name: 'Tdap', frequency: 'Every 10 years', completed: false },
    { name: 'Pneumococcal', frequency: 'Consider with Crohn\'s/immunomodulators', completed: false },
  ];

  return (
    <div className="space-y-3">
      {vaccines.map((vax, i) => (
        <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-start gap-3">
          <input
            type="checkbox"
            checked={vax.completed}
            readOnly
            className="mt-1 w-4 h-4 rounded cursor-pointer accent-green-500"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-white">{vax.name}</h3>
            <p className="text-sm text-slate-400">{vax.frequency}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Tab 6: Kidney
function KidneyTab() {
  const creatinineTrend = getTrend('Creatinine');
  const egfrTrend = getTrend('eGFR');

  return (
    <div className="space-y-4">
      <Section title="Current Status" emoji="🫘" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-400 mb-1">eGFR</p>
            <p className="text-2xl font-bold text-yellow-400">56</p>
            <p className="text-xs text-slate-500 mt-1">Stage 3a CKD</p>
          </div>
          <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-slate-400 mb-1">Creatinine</p>
            <p className="text-2xl font-bold text-yellow-400">1.45 mg/dL</p>
            <p className="text-xs text-slate-500 mt-1">Goal: &lt; 1.27</p>
          </div>
        </div>
      </Section>

      <Section title="Trend Data" emoji="📈" defaultOpen={true}>
        {creatinineTrend.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Creatinine History</h4>
            <div className="space-y-1 text-xs">
              {creatinineTrend.map((t, i) => (
                <div key={i} className="flex justify-between text-slate-400">
                  <span>{t.date}</span>
                  <span className="font-medium text-white">{t.value} mg/dL</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {egfrTrend.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2">eGFR History</h4>
            <div className="space-y-1 text-xs">
              {egfrTrend.map((t, i) => (
                <div key={i} className="flex justify-between text-slate-400">
                  <span>{t.date}</span>
                  <span className="font-medium text-white">{t.value} mL/min</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="Risk Factors" emoji="⚠️" defaultOpen={true}>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-2">
            <span className="text-slate-500">•</span>
            <span>Crohn's disease</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-500">•</span>
            <span>Age (59)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-500">•</span>
            <span>Medications (some affect renal function)</span>
          </li>
        </ul>
      </Section>

      <Section title="Monitoring Plan" emoji="📋" defaultOpen={true}>
        <div className="space-y-2 text-sm text-slate-300">
          <p className="font-semibold text-white mb-2">Schedule: Every 3-6 months</p>
          <p className="text-slate-400">
            Tests: Creatinine, eGFR, BUN, electrolytes, urinalysis
          </p>
        </div>
      </Section>

      <Section title="Actions" emoji="✅" defaultOpen={true}>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-2">
            <span className="text-slate-500">•</span>
            <span>Stay hydrated (80+ oz water daily)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-500">•</span>
            <span>Avoid NSAIDs (ibuprofen, naproxen)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-500">•</span>
            <span>Monitor with labs every 6 months</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-500">•</span>
            <span>Control blood pressure</span>
          </li>
        </ul>
      </Section>
    </div>
  );
}

// Tab 7: Crohn's
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
            <p className="font-semibold text-white text-green-400">Managed / Quiescent</p>
          </div>
        </div>
      </Section>

      <Section title="Colonoscopy History" emoji="📅" defaultOpen={true}>
        <div className="space-y-2 text-sm text-slate-300">
          <div className="bg-slate-750 rounded p-3 border border-slate-700">
            <p className="text-slate-400 text-xs mb-1">Last Colonoscopy</p>
            <p className="text-white font-medium">&gt; 3 years ago</p>
            <p className="text-xs text-yellow-400 mt-2">Due for surveillance colonoscopy</p>
          </div>
        </div>
      </Section>

      <Section title="Monitoring Plan" emoji="📋" defaultOpen={true}>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-2">
            <span className="text-slate-500">•</span>
            <span>
              <strong>Colonoscopy:</strong> Every 3 years for surveillance
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-500">•</span>
            <span>
              <strong>Fecal Calprotectin:</strong> Monitor for disease activity
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-500">•</span>
            <span>
              <strong>CMP & CBC:</strong> As needed or with medication changes
            </span>
          </li>
        </ul>
      </Section>

      <Section title="Triggers to Watch" emoji="🚨" defaultOpen={true}>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-2">
            <span className="text-slate-500">•</span>
            <span>High stress and emotional triggers</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-500">•</span>
            <span>NSAIDs (ibuprofen, naproxen)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-500">•</span>
            <span>Certain foods (identify personal triggers)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-500">•</span>
            <span>Poor sleep and dehydration</span>
          </li>
        </ul>
      </Section>

      <Section title="Treatment & Management" emoji="💊" defaultOpen={true}>
        <div className="space-y-3 text-sm text-slate-300">
          <div>
            <p className="text-slate-400 text-xs mb-1">Current Treatment</p>
            <p className="font-semibold text-white">Managed with dietary modifications and monitoring</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Supportive Measures</p>
            <ul className="space-y-1 text-slate-300 ml-3">
              <li>• Mediterranean diet (anti-inflammatory)</li>
              <li>• Probiotics (gut health support)</li>
              <li>• Adequate hydration</li>
              <li>• Stress management</li>
              <li>• Regular exercise (as tolerated)</li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}

// Main component
export default function Medical({ data, save, addLabResult, ...rest }) {
  const [activeTab, setActiveTab] = useState('problems');

  const tabs = [
    { id: 'problems', label: 'Problems', icon: '⚕️', component: ProblemsTab },
    { id: 'medications', label: 'Medications', icon: '💊', component: MedicationsTab },
    { id: 'labs', label: 'Labs', icon: '🔬', component: LabsTab },
    { id: 'imaging', label: 'Imaging', icon: '🖼️', component: ImagingTab },
    { id: 'vaccines', label: 'Vaccines', icon: '💉', component: VaccinesTab },
    { id: 'kidney', label: 'Kidney', icon: '🫘', component: KidneyTab },
    { id: 'crohns', label: "Crohn's", icon: '🔬', component: CrohnsTab },
  ];

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component || ProblemsTab;

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Medical EHR</h1>
          <p className="text-slate-400">Personal health records and prevention dashboard</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
