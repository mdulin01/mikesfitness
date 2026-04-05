// Structured lab results extracted from Labcorp reports
// Each entry: { date, values: { testName: { value, unit, flag, refRange } } }

export const labHistory = [
  {
    date: '2023-12-06',
    source: 'Labcorp',
    values: {
      'LDL-C': { value: 133, unit: 'mg/dL', flag: 'high', ref: '0-99' },
      'HDL-C': { value: 59, unit: 'mg/dL', flag: null, ref: '>39' },
      'Triglycerides': { value: 73, unit: 'mg/dL', flag: null, ref: '0-149' },
      'Total Cholesterol': { value: 205, unit: 'mg/dL', flag: 'high', ref: '100-199' },
      'ApoB': { value: 108, unit: 'mg/dL', flag: 'high', ref: '<90' },
      'Lp(a)': { value: 153.7, unit: 'nmol/L', flag: 'high', ref: '<75' },
      'LDL-P': { value: 1464, unit: 'nmol/L', flag: 'high', ref: '<1000' },
      'Creatinine': { value: 1.16, unit: 'mg/dL', flag: null, ref: '0.76-1.27' },
      'eGFR': { value: 74, unit: 'mL/min/1.73', flag: null, ref: '>59' },
      'Glucose': { value: 85, unit: 'mg/dL', flag: null, ref: '70-99' },
      'Vitamin D': { value: 53.9, unit: 'ng/mL', flag: null, ref: '30-100' },
    },
  },
  {
    date: '2024-10-07',
    source: 'Labcorp',
    values: {
      'LDL-C': { value: 203, unit: 'mg/dL', flag: 'high', ref: '0-99' },
      'HDL-C': { value: 58, unit: 'mg/dL', flag: null, ref: '>39' },
      'Triglycerides': { value: 73, unit: 'mg/dL', flag: null, ref: '0-149' },
      'Total Cholesterol': { value: 273, unit: 'mg/dL', flag: 'high', ref: '100-199' },
      'Creatinine': { value: 1.20, unit: 'mg/dL', flag: null, ref: '0.76-1.27' },
      'eGFR': { value: 71, unit: 'mL/min/1.73', flag: null, ref: '>59' },
      'Glucose': { value: 66, unit: 'mg/dL', flag: 'low', ref: '70-99' },
      'HbA1c': { value: 5.1, unit: '%', flag: null, ref: '4.8-5.6' },
      'TSH': { value: 1.620, unit: 'uIU/mL', flag: null, ref: '0.45-4.5' },
      'Free T4': { value: 1.26, unit: 'ng/dL', flag: null, ref: '0.82-1.77' },
      'Vitamin D': { value: 44.7, unit: 'ng/mL', flag: null, ref: '30-100' },
      'PSA': { value: 0.7, unit: 'ng/mL', flag: null, ref: '0-4.0' },
      'Platelets': { value: 100, unit: 'x10E3/uL', flag: 'critical', ref: '150-450' },
    },
  },
  {
    date: '2024-11-01',
    source: 'Labcorp',
    values: {
      'LDL-C': { value: 139, unit: 'mg/dL', flag: 'high', ref: '0-99' },
      'HDL-C': { value: 68, unit: 'mg/dL', flag: null, ref: '>39' },
      'Triglycerides': { value: 53, unit: 'mg/dL', flag: null, ref: '0-149' },
      'Total Cholesterol': { value: 216, unit: 'mg/dL', flag: 'high', ref: '100-199' },
      'Platelets': { value: 112, unit: 'x10E3/uL', flag: 'low', ref: '150-450' },
    },
  },
  {
    date: '2025-02-26',
    source: 'Labcorp',
    values: {
      'Creatinine': { value: 1.35, unit: 'mg/dL', flag: 'high', ref: '0.76-1.27' },
      'eGFR': { value: 61, unit: 'mL/min/1.73', flag: null, ref: '>59' },
      'Glucose': { value: 83, unit: 'mg/dL', flag: null, ref: '70-99' },
      'ANA': { value: 'Positive 1:80 Speckled', unit: '', flag: 'abnormal', ref: 'Negative' },
      'ESR': { value: 2, unit: 'mm/hr', flag: null, ref: '0-30' },
      'Platelets': { value: null, unit: 'x10E3/uL', flag: null, ref: '150-450', note: 'Unable to count due to aggregation' },
    },
  },
  {
    date: '2025-06-27',
    source: 'Labcorp',
    values: {
      'LDL-C': { value: 146, unit: 'mg/dL', flag: 'high', ref: '0-99' },
      'HDL-C': { value: 48, unit: 'mg/dL', flag: null, ref: '>39' },
      'Triglycerides': { value: 236, unit: 'mg/dL', flag: 'high', ref: '0-149' },
      'Total Cholesterol': { value: 237, unit: 'mg/dL', flag: 'high', ref: '100-199' },
      'ApoB': { value: 111, unit: 'mg/dL', flag: 'high', ref: '<90' },
      'Lp(a)': { value: 181.7, unit: 'nmol/L', flag: 'high', ref: '<75' },
      'LDL-P': { value: 1578, unit: 'nmol/L', flag: 'high', ref: '<1000' },
      'Homocysteine': { value: 21.4, unit: 'umol/L', flag: 'high', ref: '0-14.5' },
      'CRP': { value: 0.34, unit: 'mg/L', flag: null, ref: '0-3.0' },
      'HbA1c': { value: 5.0, unit: '%', flag: null, ref: '4.8-5.6' },
      'Insulin': { value: 11.9, unit: 'uIU/mL', flag: null, ref: '2.6-24.9' },
      'LP-IR Score': { value: 42, unit: '', flag: null, ref: '<=45' },
      'Creatinine': { value: 1.45, unit: 'mg/dL', flag: 'high', ref: '0.76-1.27' },
      'eGFR': { value: 56, unit: 'mL/min/1.73', flag: 'low', ref: '>59' },
      'Glucose': { value: 93, unit: 'mg/dL', flag: null, ref: '70-99' },
      'TSH': { value: 1.310, unit: 'uIU/mL', flag: null, ref: '0.45-4.5' },
      'Free T4': { value: 1.22, unit: 'ng/dL', flag: null, ref: '0.82-1.77' },
      'Vitamin D': { value: 46.8, unit: 'ng/mL', flag: null, ref: '30-100' },
      'CO2': { value: 18, unit: 'mmol/L', flag: 'low', ref: '20-29' },
      'Platelets': { value: 121, unit: 'x10E3/uL', flag: 'low', ref: '150-450' },
      'APCR': { value: 2.1, unit: 'ratio', flag: 'low', ref: '2.2-3.5' },
      'Factor V Leiden': { value: 'Not Detected', unit: '', flag: null, ref: 'Negative' },
      'Factor II': { value: 'Not Detected', unit: '', flag: null, ref: 'Negative' },
    },
  },
];

// Key metrics with current values and goals for the Health page
export const keyMetrics = [
  { id: 'weight', label: 'Weight', current: null, goal: 185, unit: 'lbs', direction: 'lower', category: 'body' },
  { id: 'bodyFat', label: 'Body Fat', current: null, goal: 20, goalLabel: '18-20%', unit: '%', direction: 'lower', category: 'body' },
  { id: 'apoB', label: 'ApoB', current: 111, goal: 70, unit: 'mg/dL', direction: 'lower', category: 'heart', lastDate: '2025-06-27' },
  { id: 'ldl', label: 'LDL-C', current: 146, goal: 70, unit: 'mg/dL', direction: 'lower', category: 'heart', lastDate: '2025-06-27' },
  { id: 'lpa', label: 'Lp(a)', current: 181.7, goal: null, goalLabel: 'genetic', unit: 'nmol/L', direction: 'lower', category: 'heart', lastDate: '2025-06-27' },
  { id: 'homocysteine', label: 'Homocysteine', current: 21.4, goal: 10, unit: 'umol/L', direction: 'lower', category: 'heart', lastDate: '2025-06-27' },
  { id: 'egfr', label: 'eGFR', current: 56, goal: null, goalLabel: 'stable', unit: 'mL/min', direction: 'higher', category: 'kidney', lastDate: '2025-06-27' },
  { id: 'creatinine', label: 'Creatinine', current: 1.45, goal: null, goalLabel: '< 1.27', unit: 'mg/dL', direction: 'lower', category: 'kidney', lastDate: '2025-06-27' },
  { id: 'hba1c', label: 'HbA1c', current: 5.0, goal: null, goalLabel: '< 5.7', unit: '%', direction: 'lower', category: 'metabolic', lastDate: '2025-06-27' },
  { id: 'crp', label: 'hs-CRP', current: 0.34, goal: null, goalLabel: '< 1.0', unit: 'mg/L', direction: 'lower', category: 'inflammation', lastDate: '2025-06-27' },
  { id: 'platelets', label: 'Platelets', current: 121, goal: 150, unit: 'x10E3', direction: 'higher', category: 'blood', lastDate: '2025-06-27' },
  { id: 'vitD', label: 'Vitamin D', current: 46.8, goal: null, goalLabel: '40-60', unit: 'ng/mL', direction: 'maintain', category: 'vitamins', lastDate: '2025-06-27' },
];

// Risk reduction plans
export const riskPlans = [
  {
    id: 'heart',
    label: 'Heart Disease',
    emoji: '❤️',
    color: '#ef4444',
    actions: [
      'Rosuvastatin + Ezetimibe (LDL/ApoB)',
      'Fish oil (triglycerides)',
      'Fiber 30g/day',
      'Mediterranean diet',
      'Zone 2 cardio 150 min/week',
      'B-vitamins for homocysteine',
    ],
  },
  {
    id: 'kidney',
    label: 'Kidney Disease',
    emoji: '🫘',
    color: '#f59e0b',
    actions: [
      'BP monitoring & control',
      'Hydration 80+ oz/day',
      'Avoid NSAIDs',
      'Monitor creatinine/eGFR every 6 mo',
      'Limit protein if eGFR drops further',
    ],
  },
  {
    id: 'muscle',
    label: 'Muscle Loss',
    emoji: '💪',
    color: '#3b82f6',
    actions: [
      'Lift 3x/week',
      'Protein 120g/day',
      'Creatine 5g/day',
      'Enclomiphene (testosterone)',
    ],
  },
  {
    id: 'crohns',
    label: "Crohn's",
    emoji: '🔬',
    color: '#8b5cf6',
    actions: [
      'Mediterranean diet',
      'Probiotics',
      'Colonoscopy per GI schedule',
      'Avoid trigger foods',
      'Monitor calprotectin',
    ],
  },
];

// Monitoring schedule
export const monitoringSchedule = [
  { test: 'Lipids / ApoB', frequency: 'Every 6 months', nextDue: '2025-12', category: 'heart' },
  { test: 'CMP (kidney)', frequency: 'Every 6 months', nextDue: '2025-12', category: 'kidney' },
  { test: 'Homocysteine', frequency: 'Every 6 months', nextDue: '2025-12', category: 'heart' },
  { test: 'Testosterone', frequency: 'Yearly', nextDue: '2026-06', category: 'hormonal' },
  { test: 'Colonoscopy', frequency: 'Per GI', nextDue: 'TBD', category: 'crohns' },
  { test: 'Coronary calcium', frequency: 'Every 3-5 years', nextDue: 'TBD', category: 'heart' },
  { test: 'DEXA scan', frequency: 'Every 5 years', nextDue: 'TBD', category: 'bone' },
  { test: 'Dermatology exam', frequency: 'Yearly', nextDue: '2026', category: 'cancer' },
  { test: 'Eye exam', frequency: 'Yearly', nextDue: '2026', category: 'general' },
  { test: 'PSA', frequency: 'Yearly', nextDue: '2025-10', category: 'cancer' },
];

// Helper: get latest value for a given test across all lab dates
export function getLatestValue(testName) {
  for (let i = labHistory.length - 1; i >= 0; i--) {
    const v = labHistory[i].values[testName];
    if (v && v.value != null) return { ...v, date: labHistory[i].date };
  }
  return null;
}

// Helper: get trend data (all values over time) for a given test
export function getTrend(testName) {
  return labHistory
    .filter(h => h.values[testName]?.value != null)
    .map(h => ({ date: h.date, value: h.values[testName].value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
