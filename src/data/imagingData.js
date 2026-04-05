// Imaging, procedures, and diagnostic results from Atrium Health MyChart and NIH Clinical Center
// Structured for display on Medical and Health pages

export const imagingHistory = [
  // === CARDIAC ===
  {
    date: '2025-02-25',
    type: 'imaging',
    category: 'cardiac',
    name: 'CT Coronary Angiogram with Plaque Analysis',
    provider: 'Holly Gonzales, MD',
    ordering: 'John Fedor, MD',
    source: 'Atrium Health',
    result: 'Normal',
    summary: 'Normal coronary arteries. Zero plaque. Zero stenosis.',
    details: {
      heartRate: 66,
      dominance: 'Right dominant',
      diagnosticQuality: 'Good',
      contrast: '115mL Omnipaque 350',
      findings: {
        'Left Main': { plaque: 'None', stenosis: 'None' },
        'LAD Proximal': { plaque: 'None', stenosis: 'None' },
        'LAD Mid': { plaque: 'None', stenosis: 'None' },
        'LAD Distal': { plaque: 'None', stenosis: 'None' },
        '1st Diagonal': { plaque: 'None', stenosis: 'None' },
        '2nd Diagonal': { plaque: 'None', stenosis: 'None' },
        'Circumflex Proximal': { plaque: 'None', stenosis: 'None' },
        'Circumflex Distal': { plaque: 'None', stenosis: 'None' },
        '1st Obtuse Marginal': { plaque: 'None', stenosis: 'None' },
        '2nd Obtuse Marginal': { plaque: 'None', stenosis: 'None' },
        'RCA Proximal': { plaque: 'None', stenosis: 'None' },
        'RCA Mid': { plaque: 'None', stenosis: 'None' },
        'RCA Distal': { plaque: 'None', stenosis: 'None' },
        'Right Posterior Descending': { plaque: 'None', stenosis: 'None' },
        'Right Posterolateral': { plaque: 'None', stenosis: '<25%' },
      },
      aorta: 'Normal size, no plaque',
      pericardium: 'Normal, no effusion',
    },
  },
  {
    date: '2025-02-25',
    type: 'imaging',
    category: 'cardiac',
    name: 'CT Chest Noncardiac with Contrast',
    provider: 'Michael Lavelle, MD',
    ordering: 'John Fedor, MD',
    source: 'Atrium Health',
    result: 'Normal',
    summary: 'No significant incidental findings.',
    details: {
      airways: 'Clear',
      lungs: 'Normal',
      pleura: 'Normal',
      thoracicAorta: 'Normal',
      mediastinum: 'Normal',
      chestWall: 'Normal',
      upperAbdomen: 'Normal',
    },
  },
  {
    date: '2024-11-15',
    type: 'imaging',
    category: 'cardiac',
    name: 'Holter Monitor (3-7 Days)',
    provider: 'John Fedor, MD',
    source: 'Atrium Health',
    result: 'Sinus Rhythm with BBB',
    summary: 'Sinus rhythm, bundle branch block. VE and SVE burden both <1%. One brief SVT episode.',
    details: {
      rhythm: 'Sinus',
      maxHR: 137,
      minHR: 41,
      avgHR: 65,
      veBurden: '<1%',
      veBeats: 193,
      sveBurden: '<1%',
      sveBeats: 74,
      svtEpisodes: 1,
      svtFastestRate: 136,
      svtLongestBeats: 4,
      findings: ['Bundle Branch Block'],
    },
  },

  // === ECGs ===
  {
    date: '2024-11-15',
    type: 'ecg',
    category: 'cardiac',
    name: 'ECG 12-Lead',
    provider: 'John Fedor, MD',
    source: 'Atrium Health',
    result: 'Abnormal',
    summary: 'Sinus bradycardia, RBBB, left anterior fascicular block.',
    details: {
      rate: 57,
      pAxis: 52,
      prInterval: 218,
      qrsAxis: -75,
      qrsDuration: 176,
      tAxis: 34,
      qtInterval: 448,
      qtc: 441,
      findings: [
        'Sinus Bradycardia',
        'Right Bundle Branch Block',
        'Left Anterior Fascicular Block',
      ],
    },
  },
  {
    date: '2023-08-11',
    type: 'ecg',
    category: 'cardiac',
    name: 'ECG 12-Lead',
    provider: 'John Fedor, MD',
    source: 'Atrium Health',
    result: 'Abnormal',
    summary: 'Sinus rhythm, RBBB. No change from previous.',
    details: {
      rate: 72,
      pAxis: 64,
      prInterval: 184,
      qrsAxis: 263,
      qrsDuration: 165,
      tAxis: 45,
      qtInterval: 419,
      qtc: 443,
      findings: [
        'Sinus Rhythm',
        'Right Bundle Branch Block',
      ],
    },
  },

  // === COLONOSCOPIES ===
  {
    date: '2026-03-02',
    type: 'procedure',
    category: 'gi',
    name: 'Colonoscopy',
    provider: 'Ravi Shah, MD',
    ordering: 'Courtney Ollis, PA-C',
    source: 'Atrium Health',
    result: 'Abnormal',
    summary: 'Terminal ileum erosions (2 ulcers). Colon normal. BBPS 9/9.',
    details: {
      indication: 'Family hx colon cancer, terminal ileitis, adenomatous polyp hx',
      prepScore: { right: 3, transverse: 3, left: 3, total: 9 },
      scopeInTime: '12:22 PM',
      cecumReached: '12:27 PM',
      scopeOutTime: '12:37 PM',
      terminalIleum: '30 cm examined, 2 erosions, cold forceps biopsy taken',
      colon: 'Normal appearing',
      biopsies: [
        'Ileal ulcer biopsy to r/o Crohn\'s',
        'Random colon biopsies to r/o Crohn\'s',
      ],
      pathology: {
        ileum: 'Unremarkable terminal ileal mucosa. Negative for inflammation or granuloma.',
        colon: 'Colonic mucosa with prominent lymphoid follicles, otherwise unremarkable. Negative for adenomatous changes.',
        note: 'Biopsy may not have captured ulcerated mucosa due to sampling variation.',
      },
      recommendations: [
        'Repeat colonoscopy in 5 years (due 3/1/2031)',
        'Recommend MRE and follow up IBD clinic',
      ],
    },
  },
  {
    date: '2020-01-08',
    type: 'procedure',
    category: 'gi',
    name: 'Colonoscopy Pathology',
    provider: 'Nilesh Lodhia, MD',
    source: 'Atrium Health',
    result: 'Polyps found',
    summary: 'TI unremarkable. Transverse colon: serrated/hyperplastic polyp. Rectal: hyperplastic polyp.',
    details: {
      specimens: [
        { site: 'Terminal Ileum', finding: 'Histologically unremarkable terminal ileal mucosa' },
        { site: 'Transverse Colon (2 polyps)', finding: 'Serrated polyp with features of hyperplastic polyp' },
        { site: 'Rectum (polyp)', finding: 'Hyperplastic polyp' },
      ],
    },
  },
  {
    date: '2019-09-11',
    type: 'procedure',
    category: 'gi',
    name: 'Colonoscopy Pathology',
    provider: 'Nilesh Lodhia, MD',
    source: 'Atrium Health',
    result: 'Adenomas found',
    summary: 'TI unremarkable. Ascending + transverse colon: sessile serrated adenomas.',
    details: {
      specimens: [
        { site: 'Terminal Ileum', finding: 'Histologically unremarkable ileum mucosa' },
        { site: 'Ascending Colon (2 polyps)', finding: 'Sessile serrated adenoma' },
        { site: 'Transverse Colon (polyp)', finding: 'Sessile serrated adenoma' },
      ],
    },
  },

  // === ABDOMINAL IMAGING ===
  {
    date: '2019-09-25',
    type: 'imaging',
    category: 'gi',
    name: 'CT Abdomen and Pelvis with IV Contrast',
    provider: 'James Ferris, MD',
    ordering: 'Nilesh Lodhia, MD',
    source: 'Atrium Health',
    result: 'Abnormal',
    summary: 'Mild inflammatory stricture of terminal ileum suggestive of Crohn\'s disease. No abscess or obstruction.',
    details: {
      indication: 'Terminal ileal ulcer seen on recent colonoscopy',
      contrast: '120 cc IV Isovue 370 + oral Breeza',
      terminalIleum: 'Circumferential wall thickening and hyperemia with mild luminal narrowing. More chronic than acute appearance.',
      fibrofattyProliferation: 'Mild right lower quadrant',
      mesentericNodes: 'Subcentimeter right lower quadrant and scattered',
      smallBowel: 'No upstream dilatation, no obstruction',
      appendix: 'Normal',
      liver: 'Unremarkable',
      spleen: 'Unremarkable',
      pancreas: 'Unremarkable',
      kidneys: 'Unremarkable',
      prostate: 'Moderately enlarged',
      bladder: 'Unremarkable',
      other: 'Small right inguinal hernia',
      impression: [
        'Mild inflammatory stricture of terminal ileum, suggestive of Crohn\'s disease sequela',
        'No abscess or obstruction',
        'Moderate prostatic enlargement',
      ],
    },
  },

  // === NIH MRI SURVEILLANCE (HPRC) ===
  {
    date: '2025-09-02',
    type: 'imaging',
    category: 'renal',
    name: 'MRI Abdomen (HPRC Surveillance)',
    provider: 'Evrim Turkbey, MD',
    ordering: 'Ko, Seong, MD',
    source: 'NIH Clinical Center',
    result: 'Stable',
    summary: 'Right kidney 0.7cm minimally complex cystic lesion, stable. Left kidney upper pole cortical thinning/scarring. Liver subcentimeter cysts.',
    details: {
      indication: 'HPRC surveillance — MET c.3335A>G mutation',
      rightKidney: '0.7cm minimally complex cystic lesion (stable vs prior 9/14/2023)',
      leftKidney: 'Upper pole cortical thinning/scarring',
      liver: 'Subcentimeter cysts',
      impression: 'Stable renal cystic lesion, no new concerning findings',
      comparedTo: '2023-09-14',
    },
  },
  {
    date: '2023-09-14',
    type: 'imaging',
    category: 'renal',
    name: 'MRI Abdomen (HPRC Surveillance)',
    provider: 'Ko, Seong, MD',
    source: 'NIH Clinical Center',
    result: 'Baseline',
    summary: 'Baseline MRI for HPRC surveillance. Details not accessible from portal.',
    details: {
      indication: 'HPRC surveillance — MET c.3335A>G mutation',
      note: 'Report text not available in FollowMyHealth portal. Used as comparison for 2025 study.',
    },
  },

  // === GENETICS ===
  {
    date: '2016-09-19',
    type: 'genetic',
    category: 'genetics',
    name: 'Renal/Urinary Tract Gene Panel',
    source: 'Atrium Health',
    result: 'Mutation detected',
    summary: 'MET c.3335A>G mutation. Familial MET mutation. 29 genes tested.',
    details: {
      gene: 'MET',
      variant: 'c.3335A>G',
      panel: 'Renal/Urinary Tract Panel with prelim evidence genes',
      genesTestedCount: 29,
    },
  },
];

// Colonoscopy timeline for Crohn's monitoring
export const colonoscopyTimeline = [
  { date: '2019-09-11', finding: 'TI ulcers + sessile serrated adenomas (ascending, transverse)', provider: 'Lodhia' },
  { date: '2019-09-25', finding: 'CT A/P: mild inflammatory stricture of TI, chronic appearance, suggestive of Crohn\'s', provider: 'Ferris' },
  { date: '2020-01-08', finding: 'TI unremarkable + hyperplastic polyps (transverse, rectal)', provider: 'Lodhia' },
  { date: '2023-06-27', finding: 'Colonoscopy performed (details in scanned report)', provider: 'Lodhia' },
  { date: '2026-03-02', finding: 'TI erosions (2), colon normal, biopsies negative for Crohn\'s', provider: 'Shah' },
];

// ECG trend data
export const ecgTrend = [
  { date: '2023-08-11', hr: 72, qrs: 165, qtc: 443, findings: 'Sinus rhythm, RBBB' },
  { date: '2024-11-15', hr: 57, qrs: 176, qtc: 441, findings: 'Sinus bradycardia, RBBB, LAFB' },
];

// Key cardiac findings summary
export const cardiacSummary = {
  coronaryStatus: {
    date: '2025-02-25',
    calciumScore: 'Not formally performed',
    plaque: 'None detected in any vessel',
    stenosis: 'None (except <25% right posterolateral)',
    overall: 'Normal coronary arteries',
  },
  ecgFindings: {
    baseline: 'Right Bundle Branch Block (stable)',
    recent: 'Added Left Anterior Fascicular Block (bifascicular block)',
    rhythm: 'Sinus (bradycardia at rest)',
  },
  holterFindings: {
    date: '2024-11-15',
    avgHR: 65,
    arrhythmiaBurden: 'Minimal (<1% VE, <1% SVE)',
  },
};

// Helper: get all results for a category
export function getResultsByCategory(category) {
  return imagingHistory
    .filter(r => r.category === category)
    .sort((a, b) => b.date.localeCompare(a.date));
}

// Helper: get latest result for a specific test type
export function getLatestResult(name) {
  return imagingHistory
    .filter(r => r.name === name)
    .sort((a, b) => b.date.localeCompare(a.date))[0] || null;
}
