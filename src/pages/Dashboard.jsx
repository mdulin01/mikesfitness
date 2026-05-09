import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { exercisePlan, motivationalQuotes } from '../data/exercisePlan';
import { healthPlan } from '../data/healthPlan';
import { getLatestValue, getTrend } from '../data/labData';
import { imagingHistory, colonoscopyTimeline } from '../data/imagingData';
import { ALL_EVENT_TYPES, MEAL_TYPES } from '../constants';
import { toLocalDateStr, offsetDateStr } from '../utils/dateUtils';

const today = () => toLocalDateStr();
const dayOfWeek = () => new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

// Habits grouped by medical priority
const HABIT_GROUPS = {
  critical: [
    { key: 'workout', label: 'Exercise', emoji: '💪' },
    { key: 'sleep', label: '7+ hours sleep', emoji: '😴' },
    { key: 'meds', label: 'All meds taken', emoji: '💊' },
  ],
  important: [
    { key: 'move', label: 'Move / Steps', emoji: '🏃' },
    { key: 'water', label: '3L water', emoji: '💧' },
    { key: 'mobility', label: '10 min mobility', emoji: '🧘' },
  ],
  optional: [
    { key: 'social', label: 'Social', emoji: '👥' },
    { key: 'cognitive', label: 'Cognitive', emoji: '🧠' },
    { key: 'no-alcohol', label: 'No Alcohol', emoji: '🚫🍺' },
    { key: 'no-sweets', label: 'No Sweets', emoji: '🚫🍰' },
  ],
};

const ALL_HABIT_ITEMS = [...HABIT_GROUPS.critical, ...HABIT_GROUPS.important, ...HABIT_GROUPS.optional];
const DEFAULT_DAILY_ITEMS = ALL_HABIT_ITEMS;

function Section({ title, emoji, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left">
        <h2 className="font-semibold text-white">{emoji && `${emoji} `}{title}</h2>
        <span className="text-slate-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 pb-4 -mt-1">{children}</div>}
    </div>
  );
}

/* ─── System status helpers ─── */
const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

// Helper: prefer Apple Health synced sleep over manual sleepLog. Returns
// { hours, source: 'apple'|'manual'|null, bedtime?, wakeTime?, quality?, stages? }
function getTodaySleep(data, dailyMetricsByDate, todayStr) {
  const apple = dailyMetricsByDate?.[todayStr]?.sleep;
  if (apple?.hoursTotal) {
    return {
      hours: apple.hoursTotal,
      source: 'apple',
      stages: apple.stages,
    };
  }
  const manual = data?.sleepLog?.[todayStr] || {};
  if (manual.hours) {
    return { hours: manual.hours, source: 'manual', bedtime: manual.bedtime, wakeTime: manual.wakeTime, quality: manual.quality };
  }
  return { hours: null, source: null };
}

function systemStatus(key, data, dailyChecks, medChecks, dailyMetricsByDate) {
  // Returns { status: 'green'|'yellow'|'red', label, detail }
  switch (key) {
    case 'cardio': {
      const apoB = getLatestValue('ApoB');
      const ldl = getLatestValue('LDL-C') || getLatestValue('LDL');
      const val = apoB?.value ?? ldl?.value ?? null;
      const ccta = imagingHistory.find(i => i.name === 'CT Coronary Angiogram with Plaque Analysis');
      const cctaLine = ccta ? `CCTA: Zero plaque · ${fmtDate(ccta.date)}` : '';
      if (val === null) return { status: 'yellow', label: 'No data', detail: cctaLine || 'No lab data' };
      const line = apoB ? `ApoB ${apoB.value} mg/dL · ${fmtDate(apoB.date)} · Goal <70` : `LDL ${ldl.value} · ${fmtDate(ldl.date)}`;
      const detail = [line, cctaLine].filter(Boolean).join('\n');
      if (apoB && apoB.value < 80) return { status: 'green', label: `ApoB ${apoB.value}`, detail };
      if (apoB && apoB.value < 100) return { status: 'yellow', label: `ApoB ${apoB.value}`, detail };
      return { status: 'red', label: `ApoB ${apoB?.value || '?'}`, detail };
    }
    case 'kidney': {
      const egfr = getLatestValue('eGFR');
      const mri = imagingHistory.find(i => i.category === 'renal' && i.type === 'imaging');
      const mriLine = mri ? `MRI: ${mri.summary.split('.')[0]} · ${fmtDate(mri.date)}` : '';
      if (!egfr) return { status: 'yellow', label: 'No data', detail: mriLine || 'No eGFR data' };
      const line = `eGFR ${egfr.value} · ${fmtDate(egfr.date)} · Goal ≥90`;
      const trend = getTrend('eGFR');
      const trendLine = trend && trend.length >= 2 ? `Trend: ${trend[trend.length - 2].value} → ${trend[trend.length - 1].value}` : '';
      const detail = [line, trendLine, mriLine].filter(Boolean).join('\n');
      if (egfr.value >= 90) return { status: 'green', label: `eGFR ${egfr.value}`, detail };
      if (egfr.value >= 60) return { status: 'yellow', label: `eGFR ${egfr.value}`, detail };
      return { status: 'red', label: `eGFR ${egfr.value}`, detail };
    }
    case 'metabolic': {
      const a1c = getLatestValue('HbA1c');
      const glucose = getLatestValue('Glucose');
      if (a1c) {
        const detail = `HbA1c ${a1c.value}% · ${fmtDate(a1c.date)} · Goal <5.7`;
        if (a1c.value < 5.7) return { status: 'green', label: `A1c ${a1c.value}`, detail };
        if (a1c.value < 6.5) return { status: 'yellow', label: `A1c ${a1c.value}`, detail };
        return { status: 'red', label: `A1c ${a1c.value}`, detail };
      }
      if (glucose) {
        const detail = `Glucose ${glucose.value} mg/dL · ${fmtDate(glucose.date)} · Goal <100`;
        if (glucose.value < 100) return { status: 'green', label: `Glu ${glucose.value}`, detail };
        return { status: 'yellow', label: `Glu ${glucose.value}`, detail };
      }
      return { status: 'yellow', label: 'No data', detail: 'No A1c or glucose data' };
    }
    case 'brain': {
      const cognitive = dailyChecks['cognitive'];
      const sleep = dailyChecks['sleep'];
      const detail = `Today: ${cognitive ? '✓ Cognitive' : '✗ Cognitive'}, ${sleep ? '✓ Sleep' : '✗ Sleep'}`;
      if (cognitive && sleep) return { status: 'green', label: 'Active', detail };
      if (sleep || cognitive) return { status: 'yellow', label: 'Partial', detail };
      return { status: 'red', label: 'Inactive', detail };
    }
    case 'muscle': {
      const weights = data?.weightEntries || [];
      const latest = weights.length > 0 ? [...weights].sort((a, b) => b.date.localeCompare(a.date))[0] : null;
      const bf = latest?.bodyFat;
      const wt = latest?.weight;
      const wTarget = healthPlan.weightGoals?.target || 185;
      const lines = [];
      if (wt) lines.push(`Weight ${wt} lbs · ${fmtDate(latest.date)} · Goal ${wTarget}`);
      if (bf) lines.push(`Body fat ${bf}% · Goal <18%`);
      const detail = lines.length ? lines.join('\n') : 'No data';
      if (bf && bf < 20) return { status: 'green', label: `${bf}% BF`, detail };
      if (bf && bf < 25) return { status: 'yellow', label: `${bf}% BF`, detail };
      if (bf) return { status: 'red', label: `${bf}% BF`, detail };
      return { status: 'yellow', label: 'No data', detail };
    }
    case 'gut': {
      const calprotectin = getLatestValue('Fecal Calprotectin');
      const latestColonoscopy = colonoscopyTimeline.length > 0 ? colonoscopyTimeline[colonoscopyTimeline.length - 1] : null;
      const lines = [];
      if (calprotectin) lines.push(`Calprotectin ${calprotectin.value} µg/g · ${fmtDate(calprotectin.date)} · Goal <50`);
      if (latestColonoscopy) lines.push(`Colonoscopy: ${latestColonoscopy.finding} · ${fmtDate(latestColonoscopy.date)} · Dr. ${latestColonoscopy.provider}`);
      const nextColonoscopy = imagingHistory.find(i => i.category === 'gi' && i.date === '2026-03-02');
      if (nextColonoscopy?.details?.recommendations) {
        const repeatRec = nextColonoscopy.details.recommendations.find(r => r.includes('Repeat'));
        if (repeatRec) lines.push(`Next: ${repeatRec}`);
      }
      const detail = lines.length ? lines.join('\n') : 'No data';
      // Status: yellow if active ulcers found on colonoscopy, even if calprotectin is normal
      const hasActiveUlcers = latestColonoscopy && latestColonoscopy.finding.toLowerCase().includes('erosion');
      if (hasActiveUlcers) {
        const calLabel = calprotectin ? `Cal ${calprotectin.value}` : '';
        return { status: 'yellow', label: calLabel || '2 ulcers', detail };
      }
      if (calprotectin) {
        if (calprotectin.value < 50) return { status: 'green', label: `Cal ${calprotectin.value}`, detail };
        if (calprotectin.value < 200) return { status: 'yellow', label: `Cal ${calprotectin.value}`, detail };
        return { status: 'red', label: `Cal ${calprotectin.value}`, detail };
      }
      return { status: 'yellow', label: 'No data', detail };
    }
    case 'sleep': {
      const todayStr = toLocalDateStr();
      const s = getTodaySleep(data, dailyMetricsByDate, todayStr);
      if (s.hours) {
        let detail;
        if (s.source === 'apple') {
          const stageBits = s.stages
            ? Object.entries(s.stages).filter(([k]) => k !== 'inbed').map(([k, v]) => `${k} ${v.toFixed(1)}`).join(' · ')
            : '';
          detail = `${s.hours.toFixed(1)} hrs · Apple Watch${stageBits ? ` · ${stageBits}` : ''}`;
        } else {
          detail = `${s.hours.toFixed(1)} hrs · Bed ${s.bedtime || '?'} · Wake ${s.wakeTime || '?'}${s.quality ? ` · Quality ${s.quality}/5` : ''} · manual`;
        }
        if (s.hours >= 7) return { status: 'green', label: `${s.hours.toFixed(1)} hrs`, detail };
        if (s.hours >= 6) return { status: 'yellow', label: `${s.hours.toFixed(1)} hrs`, detail };
        return { status: 'red', label: `${s.hours.toFixed(1)} hrs`, detail };
      }
      const slept = dailyChecks['sleep'];
      const detail = slept ? 'Logged 7+ hours today' : 'Not yet logged today';
      if (slept) return { status: 'green', label: '7+ hrs', detail };
      return { status: 'red', label: 'Not logged', detail };
    }
    default:
      return { status: 'yellow', label: '—', detail: '' };
  }
}

const STATUS_COLORS = {
  green: { dot: 'bg-green-500', bg: 'bg-green-900/20', text: 'text-green-400', border: 'border-green-800' },
  yellow: { dot: 'bg-yellow-500', bg: 'bg-yellow-900/20', text: 'text-yellow-400', border: 'border-yellow-800' },
  red: { dot: 'bg-red-500', bg: 'bg-red-900/20', text: 'text-red-400', border: 'border-red-800' },
};

export default function Dashboard({
  data, toggleDayCompletion, getWeekKey, toggleDailyItem,
  toggleMedCheck, saveFastingEntry, saveFiberEntry, saveSleepEntry, addWaterEntry, removeWaterEntry,
  getMonthKey,
  updateDailyItems,
  dailyMetricsByDate, lastDailyMetricsSync,
  ...rest
}) {
  const navigate = useNavigate();
  const weekKey = getWeekKey();
  const completions = data?.weeklyCompletions?.[weekKey] || {};
  const todayStr = today();
  const dailyChecks = data?.dailyChecklist?.[todayStr] || {};
  const medChecks = data?.medicationChecks?.[todayStr] || {};
  const todayMeals = data?.mealLog?.[todayStr] || [];
  const daysCompleted = Object.values(completions).filter(Boolean).length;
  const todayDow = dayOfWeek();
  const todayPlan = exercisePlan.weeklySchedule.find(d => d.day.toLowerCase() === todayDow);

  const dailyItems = data?.customDailyItems || DEFAULT_DAILY_ITEMS;

  // Fasting data
  const fastingSettings = data?.fastingSettings || { targetFastHours: 16, feedingWindowHours: 8, typicalFastStart: '20:00', typicalFeedingStart: '12:00' };
  const todayFasting = data?.fastingLog?.[todayStr] || {};

  // Expanded system tooltip
  const [expandedSystem, setExpandedSystem] = useState(null);

  // Exercise log
  const [showExerciseLog, setShowExerciseLog] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({ type: 'walk', duration: '', notes: '' });

  // Sleep log
  const [showSleepLog, setShowSleepLog] = useState(false);
  const todaySleep = data?.sleepLog?.[todayStr] || {};

  // BP quick log
  const [showBPInput, setShowBPInput] = useState(false);
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [sleepForm, setSleepForm] = useState({ bedtime: todaySleep.bedtime || '22:00', wakeTime: todaySleep.wakeTime || '06:00', quality: todaySleep.quality || 3 });

  // Water log
  const todayWater = data?.waterLog?.[todayStr] || { entries: [], total: 0 };
  const waterTarget = 80; // oz

  // Edit checklist
  const [editingChecklist, setEditingChecklist] = useState(false);
  const [editItems, setEditItems] = useState([]);

  const quote = useMemo(() => {
    const dayIndex = Math.floor(Date.now() / 86400000) % motivationalQuotes.length;
    return motivationalQuotes[dayIndex];
  }, []);

  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    d.setDate(d.getDate() - 1);
    while (true) {
      const dateStr = toLocalDateStr(d);
      const checks = data?.dailyChecklist?.[dateStr] || {};
      const completed = Object.values(checks).filter(Boolean).length;
      if (completed >= 3) { count++; d.setDate(d.getDate() - 1); } else break;
    }
    if (Object.values(dailyChecks).filter(Boolean).length >= 3) count++;
    return count;
  }, [data, dailyChecks]);

  // Appointments
  const upcomingAppts = (data?.appointments || [])
    .filter(a => a.date && a.date >= todayStr && a.status === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const needsScheduling = (data?.appointments || []).filter(a => a.status === 'needs-scheduling');

  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const daysUntil = (d) => Math.ceil((new Date(d) - new Date(todayStr)) / 86400000);

  // Meds
  const allScheduleItems = (healthPlan.medSchedule || []).flatMap(g => g.items.filter(i => !i.optional));
  const totalMedItems = allScheduleItems.length;
  const totalMedChecked = allScheduleItems.filter(i => medChecks[i.name]).length;
  const allDone = totalMedChecked === totalMedItems;

  const dailyProgress = Object.values(dailyChecks).filter(Boolean).length;
  const dailyTotal = dailyItems.length;

  const startEditChecklist = () => { setEditItems([...dailyItems]); setEditingChecklist(true); };
  const saveChecklist = () => { updateDailyItems(editItems.filter(i => i.label.trim())); setEditingChecklist(false); };

  // ===== SCORES =====
  const scores = useMemo(() => {
    // ── BEHAVIOR SCORE (0-100) ── what you did today
    const workoutDone = dailyChecks['workout'] || false;
    const moveDone = dailyChecks['move'] || false;
    const mobilityDone = dailyChecks['mobility'] || false;
    const exercisePts = (workoutDone ? 12 : 0) + (moveDone ? 4 : 0) + (mobilityDone ? 4 : 0); // 20 max

    const mealPts = Math.min(10, todayMeals.length * 5);
    const fiberPts = (medChecks['Benefiber'] ? 5 : 0) + (medChecks['Psyllium'] ? 5 : 0);
    const nutritionPts = mealPts + fiberPts; // 20 max

    const sleepEntry = data?.sleepLog?.[todayStr] || {};
    const sleepPts = sleepEntry.hours ? (sleepEntry.hours >= 7 ? 20 : sleepEntry.hours >= 6 ? 12 : 5) : (dailyChecks['sleep'] ? 20 : 0); // 20 max

    const medPts = totalMedItems > 0 ? Math.round((totalMedChecked / totalMedItems) * 20) : 0; // 20 max

    // Fasting
    const lastMeal = todayFasting.lastMealYesterday || '';
    const firstMeal = todayFasting.firstMealToday || '';
    let fastPts = 0;
    if (lastMeal && firstMeal) {
      const [lh, lm] = lastMeal.split(':').map(Number);
      const [fh, fm] = firstMeal.split(':').map(Number);
      const totalMins = (24 * 60 - (lh * 60 + lm)) + (fh * 60 + fm);
      const hrs = totalMins / 60;
      fastPts = hrs >= fastingSettings.targetFastHours ? 20 : hrs >= 12 ? 10 : 0;
    }
    // 20 max

    const behavior = exercisePts + nutritionPts + sleepPts + medPts + fastPts; // 0-100

    // ── BIOLOGY SCORE (0-100) ── your lab/vital numbers
    // Each system scores 0-14.3 (7 systems)
    const bioParts = [];
    const apoB = getLatestValue('ApoB');
    bioParts.push(apoB ? (apoB.value < 70 ? 14.3 : apoB.value < 90 ? 10 : apoB.value < 120 ? 5 : 0) : 7); // neutral if no data

    const egfr = getLatestValue('eGFR');
    bioParts.push(egfr ? (egfr.value >= 90 ? 14.3 : egfr.value >= 60 ? 10 : egfr.value >= 30 ? 5 : 0) : 7);

    const a1c = getLatestValue('HbA1c');
    bioParts.push(a1c ? (a1c.value < 5.7 ? 14.3 : a1c.value < 6.5 ? 10 : 5) : 7);

    // Weight toward goal
    const weights = data?.weightEntries || [];
    const latestW = weights.length > 0 ? [...weights].sort((a, b) => b.date.localeCompare(a.date))[0] : null;
    const wTarget = healthPlan.weightGoals?.target || 185;
    if (latestW) {
      const diff = Math.abs(latestW.weight - wTarget);
      bioParts.push(diff < 5 ? 14.3 : diff < 15 ? 10 : diff < 25 ? 5 : 0);
    } else bioParts.push(7);

    // BP
    const bpEntries = data?.bpEntries || [];
    const latestBP = bpEntries.length > 0 ? [...bpEntries].sort((a, b) => b.date.localeCompare(a.date))[0] : null;
    if (latestBP) {
      bioParts.push(latestBP.systolic < 120 && latestBP.diastolic < 80 ? 14.3 :
        latestBP.systolic < 130 ? 10 : latestBP.systolic < 140 ? 5 : 0);
    } else bioParts.push(7);

    // Body fat
    const bf = latestW?.bodyFat;
    bioParts.push(bf ? (bf < 18 ? 14.3 : bf < 22 ? 10 : bf < 28 ? 5 : 0) : 7);

    // Gut (calprotectin)
    const cal = getLatestValue('Fecal Calprotectin');
    bioParts.push(cal ? (cal.value < 50 ? 14.3 : cal.value < 200 ? 10 : 5) : 7);

    const biology = Math.round(bioParts.reduce((s, v) => s + v, 0));

    const overall = Math.round(behavior * 0.5 + biology * 0.5);

    return { overall, behavior, biology };
  }, [dailyChecks, todayMeals, medChecks, totalMedChecked, totalMedItems, todayFasting, data?.weightEntries, data?.bpEntries]);

  // Systems for display
  const systems = useMemo(() => [
    { key: 'cardio', label: 'Cardio', emoji: '❤️' },
    { key: 'kidney', label: 'Kidney', emoji: '🫘' },
    { key: 'metabolic', label: 'Metabolic', emoji: '🔬' },
    { key: 'brain', label: 'Brain', emoji: '🧠' },
    { key: 'muscle', label: 'Muscle', emoji: '💪' },
    { key: 'gut', label: 'Gut', emoji: '🦠' },
    { key: 'sleep', label: 'Sleep', emoji: '😴' },
  ].map(s => ({ ...s, ...systemStatus(s.key, data, dailyChecks, medChecks, dailyMetricsByDate) })),
  [data, dailyChecks, medChecks]);

  // Key numbers
  const keyNumbers = useMemo(() => {
    const weights = data?.weightEntries || [];
    const latestW = weights.length > 0 ? [...weights].sort((a, b) => b.date.localeCompare(a.date))[0] : null;
    const bpEntries = data?.bpEntries || [];
    const latestBP = bpEntries.length > 0 ? [...bpEntries].sort((a, b) => b.date.localeCompare(a.date))[0] : null;
    const vo2 = data?.vo2Entries || [];
    const latestVO2 = vo2.length > 0 ? [...vo2].sort((a, b) => b.date.localeCompare(a.date))[0] : null;
    const hrEntries = data?.hrEntries || [];
    const latestHR = hrEntries.length > 0 ? [...hrEntries].sort((a, b) => b.date.localeCompare(a.date))[0] : null;
    const apoB = getLatestValue('ApoB');
    const egfr = getLatestValue('eGFR');

    return [
      { label: 'Weight', value: latestW ? `${latestW.weight}` : '—', unit: 'lbs' },
      { label: 'BF', value: latestW?.bodyFat ? `${latestW.bodyFat}` : '—', unit: '%' },
      { label: 'ApoB', value: apoB ? `${apoB.value}` : '—', unit: '' },
      { label: 'eGFR', value: egfr ? `${egfr.value}` : '—', unit: '' },
      { label: 'VO2', value: latestVO2 ? `${latestVO2.vo2max}` : '—', unit: '' },
      { label: 'BP', value: latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '—', unit: '' },
      { label: 'RHR', value: latestHR ? `${latestHR.hr}` : '—', unit: '' },
    ];
  }, [data?.weightEntries, data?.bpEntries, data?.vo2Entries, data?.hrEntries]);

  // Fasting computed
  const fastingStatus = useMemo(() => {
    const lastMeal = todayFasting.lastMealYesterday || '';
    const firstMeal = todayFasting.firstMealToday || '';
    if (!lastMeal || !firstMeal) return { hasBoth: false, hours: 0, mins: 0, metGoal: false, pct: 0 };
    const [lh, lm] = lastMeal.split(':').map(Number);
    const [fh, fm] = firstMeal.split(':').map(Number);
    const totalMins = (24 * 60 - (lh * 60 + lm)) + (fh * 60 + fm);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const target = fastingSettings.targetFastHours;
    return { hasBoth: true, hours, mins, metGoal: (hours + mins / 60) >= target, pct: Math.min(1, (hours + mins / 60) / target) };
  }, [todayFasting, fastingSettings]);

  // Today checklist items for the compact view
  const todayItems = [
    { key: 'workout', label: 'Exercise', done: dailyChecks['workout'] },
    { key: 'sleep', label: 'Sleep', done: dailyChecks['sleep'] },
    { key: 'nutrition', label: 'Nutrition', done: todayMeals.length >= 2 },
    { key: 'meds', label: 'Meds', done: allDone },
    { key: 'fasting', label: 'Fasting', done: fastingStatus.metGoal },
  ];

  const scoreColor = (s) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = (s) => s >= 80 ? 'from-green-900/40 to-emerald-900/40 border-green-700/50' :
    s >= 60 ? 'from-yellow-900/40 to-amber-900/40 border-yellow-700/50' :
    'from-red-900/40 to-rose-900/40 border-red-700/50';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4 pb-24 md:pb-6">

      {/* ══════ HEALTH OS HEADER ══════ */}
      <div className={`rounded-xl border p-4 bg-gradient-to-br ${scoreBg(scores.overall)}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Mike's Health OS</div>
              {lastDailyMetricsSync && (() => {
                const minsAgo = Math.round((Date.now() - lastDailyMetricsSync) / 60000);
                const ago = minsAgo < 60 ? `${minsAgo}m` : minsAgo < 1440 ? `${Math.round(minsAgo/60)}h` : `${Math.round(minsAgo/1440)}d`;
                const fresh = minsAgo < 90;
                return (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${fresh ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}
                    title={`Last Apple Health sync: ${new Date(lastDailyMetricsSync).toLocaleString()}`}>
                    ⌚ {ago} ago
                  </span>
                );
              })()}
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-4xl font-bold ${scoreColor(scores.overall)}`}>{scores.overall}</span>
              <span className="text-slate-500 text-sm">/ 100</span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-slate-400">Behavior</span>
              <span className={`text-lg font-bold ${scoreColor(scores.behavior)}`}>{scores.behavior}</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-slate-400">Biology</span>
              <span className={`text-lg font-bold ${scoreColor(scores.biology)}`}>{scores.biology}</span>
            </div>
          </div>
        </div>

        {/* Systems row */}
        <div className="grid grid-cols-7 gap-1.5">
          {systems.map(sys => {
            const c = STATUS_COLORS[sys.status];
            const isExpanded = expandedSystem === sys.key;
            return (
              <div key={sys.key}
                onClick={() => setExpandedSystem(isExpanded ? null : sys.key)}
                className={`${c.bg} border ${c.border} rounded-lg p-1.5 text-center cursor-pointer transition-all ${isExpanded ? 'ring-1 ring-white/30' : ''}`}>
                <div className="flex items-center justify-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className="text-xs font-medium text-slate-300">{sys.emoji}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{sys.label}</div>
              </div>
            );
          })}
        </div>
        {/* System detail tooltip */}
        {expandedSystem && (() => {
          const sys = systems.find(s => s.key === expandedSystem);
          if (!sys?.detail) return null;
          const c = STATUS_COLORS[sys.status];
          return (
            <div className={`${c.bg} border ${c.border} rounded-lg px-3 py-2 mt-1.5`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white">{sys.emoji} {sys.label}</span>
                <button onClick={(e) => { e.stopPropagation(); setExpandedSystem(null); }} className="text-slate-500 text-xs hover:text-slate-300">✕</button>
              </div>
              {sys.detail.split('\n').map((line, i) => (
                <div key={i} className="text-[11px] text-slate-300 leading-relaxed">{line}</div>
              ))}
            </div>
          );
        })()}

        {/* Key Numbers */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs">
          {keyNumbers.map(n => (
            <span key={n.label} className="text-slate-400">
              <span className="text-slate-500">{n.label}</span>{' '}
              <span className="text-white font-semibold">{n.value}</span>
              {n.unit && <span className="text-slate-600 ml-0.5">{n.unit}</span>}
            </span>
          ))}
        </div>

        {/* Quick BP Log */}
        <div className="mt-3">
          <button onClick={() => setShowBPInput(!showBPInput)} className="text-xs text-blue-400 hover:text-blue-300">
            + Log BP
          </button>
          {showBPInput && (
            <div className="flex gap-2 mt-2 items-center">
              <input type="number" placeholder="Sys" value={bpSys} onChange={e => setBpSys(e.target.value)} className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm" />
              <span className="text-slate-500">/</span>
              <input type="number" placeholder="Dia" value={bpDia} onChange={e => setBpDia(e.target.value)} className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm" />
              <button onClick={() => {
                if(bpSys && bpDia) {
                  const entries = [...(data?.bpEntries || []), { id: Date.now(), date: toLocalDateStr(), systolic: parseInt(bpSys), diastolic: parseInt(bpDia), value: parseInt(bpSys) }];
                  save({ bpEntries: entries });
                  setBpSys(''); setBpDia(''); setShowBPInput(false);
                }
              }} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Save</button>
            </div>
          )}
        </div>
      </div>

      {/* ══════ TODAY'S APPLE HEALTH ACTIVITY (auto-hides metrics that aren't synced yet) ══════ */}
      {(() => {
        const todayMetrics = dailyMetricsByDate?.[todayStr];
        if (!todayMetrics) return null;
        const a = todayMetrics.activity || {};
        const v = todayMetrics.vitals || {};
        const env = todayMetrics.environment || {};
        const sleep = todayMetrics.sleep;
        // Compose tiles only when we actually have data, so the panel stays clean
        // on days without much sync (e.g., before the watch is worn).
        const tiles = [];
        if (a.steps != null) tiles.push({ label: 'Steps', value: Math.round(a.steps).toLocaleString(), sub: a.distanceMiles ? `${a.distanceMiles.toFixed(2)} mi` : null });
        if (a.activeEnergyKcal != null) tiles.push({ label: 'Active Cal', value: Math.round(a.activeEnergyKcal), sub: 'kcal' });
        if (a.exerciseMinutes != null) tiles.push({ label: 'Exercise', value: Math.round(a.exerciseMinutes), sub: 'min' });
        if (a.standHours != null) tiles.push({ label: 'Stand', value: Math.round(a.standHours), sub: 'hours' });
        if (a.flightsClimbed != null) tiles.push({ label: 'Floors', value: Math.round(a.flightsClimbed), sub: 'climbed' });
        if (a.swimDistanceMeters != null) tiles.push({ label: 'Swim', value: Math.round(a.swimDistanceMeters).toLocaleString(), sub: `yds${a.swimStrokes ? ` · ${Math.round(a.swimStrokes)} strokes` : ''}` });
        if (a.daylightMinutes != null) tiles.push({ label: 'Daylight', value: Math.round(a.daylightMinutes), sub: 'min' });
        if (sleep?.hoursTotal) {
          const stages = sleep.stages || {};
          const stageBits = [stages.deep && `D ${stages.deep.toFixed(1)}`, stages.rem && `R ${stages.rem.toFixed(1)}`, stages.core && `C ${stages.core.toFixed(1)}`].filter(Boolean).join(' · ');
          tiles.push({ label: 'Sleep', value: sleep.hoursTotal.toFixed(1), sub: stageBits || 'hrs' });
        }
        if (v.heartRateRest != null) tiles.push({ label: 'Resting HR', value: Math.round(v.heartRateRest), sub: 'bpm' });
        if (v.hrv != null) tiles.push({ label: 'HRV', value: Math.round(v.hrv), sub: 'ms' });
        if (v.weightLbs != null) tiles.push({ label: 'Weight', value: v.weightLbs.toFixed(1), sub: 'lbs' });
        if (v.bodyFatPct != null) tiles.push({ label: 'Body Fat', value: `${(v.bodyFatPct * 100).toFixed(1)}%`, sub: '' });
        if (v.spo2 != null) tiles.push({ label: 'SpO₂', value: `${(v.spo2 * 100).toFixed(0)}%`, sub: '' });
        if (env.underwaterTempF != null) tiles.push({ label: 'Pool Temp', value: env.underwaterTempF.toFixed(1), sub: '°F' });
        if (tiles.length === 0) return null;
        return (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs text-slate-400 uppercase tracking-wide font-semibold">⌚ Today from Apple Health</h3>
              {todayMetrics.lastSync?.toMillis && (
                <span className="text-[10px] text-slate-500">synced {new Date(todayMetrics.lastSync.toMillis()).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {tiles.map((t, i) => (
                <div key={i} className="bg-slate-900/40 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">{t.label}</div>
                  <div className="text-base font-bold text-white leading-tight">{t.value}</div>
                  {t.sub && <div className="text-[10px] text-slate-500 truncate" title={t.sub}>{t.sub}</div>}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ══════ TODAY'S CHECKLIST (compact) ══════ */}
      <div className="flex gap-1.5 flex-wrap">
        {todayItems.map(item => (
          <div key={item.key} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            item.done ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/40' : 'bg-slate-800/60 text-slate-500 ring-1 ring-slate-700'
          }`}>
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${
              item.done ? 'bg-green-500 text-white' : 'border border-slate-600'
            }`}>{item.done ? '✓' : ''}</span>
            {item.label}
          </div>
        ))}
      </div>

      {/* ══════ STREAK + DATE ══════ */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-red-600 px-3 py-1 rounded-full">
            <span className="text-sm">🔥</span>
            <span className="text-sm font-bold text-white">{streak} day streak</span>
          </div>
        )}
      </div>

      {/* Quote */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-800/30 rounded-xl px-4 py-3">
        <p className="text-sm text-blue-200 italic">"{quote.text}"</p>
        {(quote.author || quote.source) && (
          <p className="text-xs text-blue-400 mt-1">— {quote.author || quote.source}</p>
        )}
      </div>

      {/* ══════ TODAY'S WORKOUT ══════ */}
      {todayPlan && (
        <Section title="Today's Workout" emoji={todayPlan.emoji} defaultOpen={true}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <div className="font-medium text-white">{todayPlan.exercise}</div>
            </div>
            <button
              onClick={() => { toggleDayCompletion(todayDow, weekKey); if (!dailyChecks['workout']) toggleDailyItem(todayStr, 'workout'); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                completions[todayDow] ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}>
              {completions[todayDow] ? '✓ Done!' : 'Mark Done'}
            </button>
          </div>
          {!showExerciseLog ? (
            <button onClick={() => setShowExerciseLog(true)}
              className="text-xs text-blue-400 hover:underline">+ Log exercise details</button>
          ) : (
            <div className="space-y-2 bg-slate-700/50 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2">
                <select value={exerciseForm.type} onChange={e => setExerciseForm(f => ({...f, type: e.target.value}))}
                  className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white">
                  <option value="walk">🚶 Walk</option>
                  <option value="run">🏃 Run</option>
                  <option value="weights">🏋️ Weights</option>
                  <option value="bike">🚴 Bike</option>
                  <option value="swim">🏊 Swim</option>
                  <option value="yoga">🧘 Yoga/Mobility</option>
                  <option value="other">💪 Other</option>
                </select>
                <input type="number" placeholder="Minutes" value={exerciseForm.duration}
                  onChange={e => setExerciseForm(f => ({...f, duration: e.target.value}))}
                  className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
              </div>
              <input type="text" placeholder="Notes (optional)" value={exerciseForm.notes}
                onChange={e => setExerciseForm(f => ({...f, notes: e.target.value}))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
              <div className="flex gap-2">
                <button onClick={() => {
                  if (!exerciseForm.duration) return;
                  const log = { ...(data?.exerciseLog || {}) };
                  const todayLog = log[todayStr] || [];
                  log[todayStr] = [...todayLog, { id: Date.now(), type: exerciseForm.type, duration: parseInt(exerciseForm.duration), notes: exerciseForm.notes }];
                  rest.save?.({ exerciseLog: log });
                  setExerciseForm({ type: 'walk', duration: '', notes: '' });
                  setShowExerciseLog(false);
                  if (!dailyChecks['move']) toggleDailyItem(todayStr, 'move');
                }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500">Save</button>
                <button onClick={() => setShowExerciseLog(false)}
                  className="px-3 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-500">Cancel</button>
              </div>
              {(data?.exerciseLog?.[todayStr] || []).length > 0 && (
                <div className="pt-2 border-t border-slate-600 space-y-1">
                  {(data.exerciseLog[todayStr]).map(e => (
                    <div key={e.id} className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{e.type === 'walk' ? '🚶' : e.type === 'run' ? '🏃' : e.type === 'weights' ? '🏋️' : e.type === 'bike' ? '🚴' : e.type === 'swim' ? '🏊' : e.type === 'yoga' ? '🧘' : '💪'}</span>
                      <span>{e.duration} min</span>
                      {e.notes && <span className="text-slate-500">— {e.notes}</span>}
                    </div>
                  ))}
                  <div className="text-xs text-green-400 font-medium">
                    Total: {(data.exerciseLog[todayStr]).reduce((s, e) => s + (e.duration || 0), 0)} min
                  </div>
                </div>
              )}
            </div>
          )}
        </Section>
      )}

      {/* ══════ TODAY'S HABITS ══════ */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-semibold text-white">✅ Today's Habits</h2>
          <button onClick={startEditChecklist} className="text-xs text-blue-400 hover:underline">Edit ✏️</button>
        </div>
        <div className="px-4 pb-4 -mt-1 space-y-3">
          <div>
            <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1.5">🚨 Critical</div>
            <div className="space-y-1.5">
              {HABIT_GROUPS.critical.map(item => {
                const done = dailyChecks[item.key];
                return (
                  <button key={item.key} onClick={() => toggleDailyItem(todayStr, item.key)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-lg transition-all text-base ${
                      done ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/20 border border-red-700/60 hover:bg-red-900/30'
                    }`}>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      done ? 'border-green-500 bg-green-500' : 'border-red-500'
                    }`}>{done && <span className="text-white text-sm">✓</span>}</div>
                    <span className={`font-medium ${done ? 'text-green-400 line-through' : 'text-white'}`}>{item.emoji} {item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-1.5">⭐ Important</div>
            <div className="space-y-1">
              {HABIT_GROUPS.important.map(item => {
                const done = dailyChecks[item.key];
                return (
                  <button key={item.key} onClick={() => toggleDailyItem(todayStr, item.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      done ? 'bg-green-900/30 border border-green-700' : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
                    }`}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      done ? 'border-green-500 bg-green-500' : 'border-yellow-500'
                    }`}>{done && <span className="text-white text-xs">✓</span>}</div>
                    <span className={`text-sm ${done ? 'text-green-400 line-through' : 'text-slate-300'}`}>{item.emoji} {item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Optional</div>
            <div className="space-y-1">
              {HABIT_GROUPS.optional.map(item => {
                const done = dailyChecks[item.key];
                return (
                  <button key={item.key} onClick={() => toggleDailyItem(todayStr, item.key)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                      done ? 'bg-green-900/30 border border-green-700' : 'bg-slate-700/30 border border-slate-700 hover:bg-slate-700/50'
                    }`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      done ? 'border-green-500 bg-green-500' : 'border-slate-600'
                    }`}>{done && <span className="text-white text-[10px]">✓</span>}</div>
                    <span className={`text-sm ${done ? 'text-green-400 line-through' : 'text-slate-400'}`}>{item.emoji} {item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {dailyProgress === dailyTotal && dailyTotal > 0 && (
            <div className="text-center p-2 bg-green-900/30 border border-green-700 rounded-lg">
              <span className="text-green-400 text-sm font-medium">🎉 All habits completed!</span>
            </div>
          )}
        </div>
      </div>

      {/* ══════ SLEEP TRACKER ══════ */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">😴 Sleep Tracker</h2>
          {todaySleep.hours && (
            <span className={`text-sm font-bold ${todaySleep.hours >= 7 ? 'text-green-400' : todaySleep.hours >= 6 ? 'text-yellow-400' : 'text-red-400'}`}>
              {todaySleep.hours.toFixed(1)} hrs
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">🌙 Bedtime</label>
            <input type="time" value={sleepForm.bedtime}
              onChange={e => setSleepForm(f => ({ ...f, bedtime: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">☀️ Wake time</label>
            <input type="time" value={sleepForm.wakeTime}
              onChange={e => setSleepForm(f => ({ ...f, wakeTime: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
          </div>
        </div>
        <div className="mb-3">
          <label className="text-xs text-slate-400 block mb-1">Quality</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(q => (
              <button key={q} onClick={() => setSleepForm(f => ({ ...f, quality: q }))}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  sleepForm.quality === q ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}>
                {q}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => {
          const [bh, bm] = sleepForm.bedtime.split(':').map(Number);
          const [wh, wm] = sleepForm.wakeTime.split(':').map(Number);
          let mins = (wh * 60 + wm) - (bh * 60 + bm);
          if (mins <= 0) mins += 24 * 60;
          const hours = Math.round((mins / 60) * 100) / 100;
          saveSleepEntry(todayStr, { bedtime: sleepForm.bedtime, wakeTime: sleepForm.wakeTime, hours, quality: sleepForm.quality });
          if (hours >= 7 && !dailyChecks['sleep']) toggleDailyItem(todayStr, 'sleep');
        }} className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500">
          Save Sleep
        </button>
      </div>

      {/* ══════ WATER TRACKER ══════ */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">💧 Water Tracker</h2>
          <span className={`text-sm font-bold ${todayWater.total >= waterTarget ? 'text-green-400' : todayWater.total >= waterTarget * 0.5 ? 'text-blue-400' : 'text-slate-500'}`}>
            {todayWater.total} / {waterTarget} oz
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 mb-3">
          <div className={`h-3 rounded-full transition-all ${todayWater.total >= waterTarget ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(100, (todayWater.total / waterTarget) * 100)}%` }} />
        </div>
        <div className="flex gap-2 mb-3">
          {[{ oz: 8, label: '8oz Glass' }, { oz: 12, label: '12oz Can' }, { oz: 16, label: '16oz Bottle' }, { oz: 24, label: '24oz Lg' }].map(opt => (
            <button key={opt.oz} onClick={() => {
              addWaterEntry(todayStr, opt.oz);
              if ((todayWater.total + opt.oz) >= waterTarget && !dailyChecks['water']) toggleDailyItem(todayStr, 'water');
            }}
              className="flex-1 py-2 bg-blue-900/30 border border-blue-700/50 rounded-lg text-xs font-medium text-blue-300 hover:bg-blue-800/40 transition-all">
              +{opt.oz}oz
            </button>
          ))}
        </div>
        {todayWater.entries.length > 0 && (
          <div className="space-y-1 text-xs text-slate-400">
            {todayWater.entries.slice(-5).map(e => (
              <div key={e.id} className="flex justify-between items-center">
                <span>{e.time} — {e.oz}oz</span>
                <button onClick={() => removeWaterEntry(todayStr, e.id)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════ MEDS & SUPPLEMENTS ══════ */}
      <Section title="Meds & Supplements" emoji="💊" defaultOpen={true}>
        <div className="space-y-2">
          {(healthPlan.medSchedule || []).map(group => {
            const required = group.items.filter(i => !i.optional);
            const checkedInGroup = required.filter(i => medChecks[i.name]).length;
            const groupDone = checkedInGroup === required.length;
            return (
              <div key={group.time} className={`p-3 rounded-lg transition-all ${
                groupDone ? 'bg-green-900/30 border border-green-700' : 'bg-slate-700/50 border border-slate-600'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{group.emoji}</span>
                  <span className={`text-sm font-medium ${groupDone ? 'text-green-400' : 'text-slate-300'}`}>{group.label}</span>
                  <span className="text-xs text-slate-500 ml-auto">{checkedInGroup}/{required.length}</span>
                </div>
                <div className="space-y-1">
                  {group.items.map(item => {
                    const done = medChecks[item.name];
                    return (
                      <button key={item.name} onClick={() => !item.optional && toggleMedCheck(todayStr, item.name)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-sm ${
                          item.optional ? 'opacity-60 cursor-default' :
                          done ? 'bg-green-900/20 text-green-400' : 'text-slate-400 hover:bg-slate-700/50'
                        }`}>
                        {!item.optional && (
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                            done ? 'border-green-500 bg-green-500' : 'border-slate-500'
                          }`}>{done && <span className="text-white text-[10px]">✓</span>}</div>
                        )}
                        {item.optional && <span className="w-4 text-center text-slate-600">–</span>}
                        <span className={`flex-1 text-left ${done ? 'line-through' : ''}`}>
                          {item.name}
                          {item.rx && <span className="text-[10px] ml-1 px-1 py-0.5 rounded bg-blue-900/50 text-blue-400">Rx</span>}
                        </span>
                        <span className="text-[10px] text-slate-500">{item.notes}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-slate-700 rounded-full h-2">
            <div className={`rounded-full h-2 transition-all ${allDone ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{ width: `${totalMedItems > 0 ? (totalMedChecked / totalMedItems) * 100 : 0}%` }} />
          </div>
          <span className="text-xs text-slate-400">{totalMedChecked}/{totalMedItems}</span>
        </div>
      </Section>

      {/* ══════ NUTRITION SUMMARY ══════ */}
      <Section title="Today's Nutrition" emoji="🍽️" defaultOpen={true}>
        <div className="flex justify-end -mt-2 mb-2">
          <button onClick={() => navigate('/nutrition')} className="text-sm text-blue-400 hover:underline">Log meals →</button>
        </div>
        {todayMeals.length === 0 ? (
          <button onClick={() => navigate('/nutrition')} className="w-full p-4 bg-slate-700/30 border border-dashed border-slate-600 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition-colors">
            No meals logged yet. Tap to start tracking →
          </button>
        ) : (
          <div className="space-y-1.5">
            {todayMeals.slice(0, 4).map(meal => {
              const mt = MEAL_TYPES.find(t => t.id === meal.type) || MEAL_TYPES[0];
              return (
                <div key={meal.id} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg text-sm">
                  <span>{mt.emoji}</span>
                  <span className="text-slate-300 truncate flex-1">{meal.description}</span>
                  <span className="text-xs text-slate-500">{meal.time}</span>
                </div>
              );
            })}
            {todayMeals.length > 4 && <p className="text-xs text-slate-500 text-center">+{todayMeals.length - 4} more</p>}
            {(() => {
              const cals = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
              const prot = todayMeals.reduce((s, m) => s + (m.protein || 0), 0);
              if (cals === 0 && prot === 0) return null;
              return (
                <div className="flex gap-3 mt-2 pt-2 border-t border-slate-700 text-xs text-slate-400">
                  <span>🔥 {cals} cal</span>
                  <span>🥩 {prot}g protein</span>
                  <span>🌾 {todayMeals.reduce((s, m) => s + (m.fiber || 0), 0)}g fiber</span>
                </div>
              );
            })()}
          </div>
        )}
      </Section>

      {/* ══════ FASTING ══════ */}
      <Section title="Intermittent Fasting" emoji="⏱️" defaultOpen={true}>
        {(() => {
          const lastMeal = todayFasting.lastMealYesterday || '';
          const firstMeal = todayFasting.firstMealToday || '';
          const { hasBoth, hours, mins, metGoal, pct } = fastingStatus;
          const targetHours = fastingSettings.targetFastHours;
          const lastMealPresets = ['18:00', '19:00', '20:00', '21:00'];
          const firstMealPresets = ['10:00', '11:00', '12:00', '13:00'];

          return (
            <div className="space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                metGoal ? 'bg-green-900/30 border border-green-700' :
                hasBoth ? 'bg-amber-900/30 border border-amber-700' :
                'bg-slate-700/50 border border-slate-600'
              }`}>
                <div className="text-2xl">{metGoal ? '✅' : hasBoth ? '⏱️' : '🍽️'}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {metGoal ? `${hours}h ${mins}m fast — Goal met!` :
                     hasBoth ? `${hours}h ${mins}m fast (goal: ${targetHours}h)` :
                     'Log your meals to track fasting'}
                  </div>
                  {hasBoth && <div className="text-xs text-slate-400">Last meal yesterday {lastMeal} → First meal today {firstMeal}</div>}
                </div>
              </div>
              {hasBoth && (
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className={`rounded-full h-2 transition-all ${metGoal ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${pct * 100}%` }} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">🌙 Last meal yesterday</label>
                  <input type="time" value={lastMeal}
                    onChange={e => saveFastingEntry(todayStr, { ...todayFasting, lastMealYesterday: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
                  <div className="flex gap-1 mt-1">
                    {lastMealPresets.map(t => (
                      <button key={t} onClick={() => saveFastingEntry(todayStr, { ...todayFasting, lastMealYesterday: t })}
                        className={`text-xs px-1.5 py-0.5 rounded ${lastMeal === t ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                        {t.replace(':00', '')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">☀️ First meal today</label>
                  <input type="time" value={firstMeal}
                    onChange={e => saveFastingEntry(todayStr, { ...todayFasting, firstMealToday: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
                  <div className="flex gap-1 mt-1">
                    {firstMealPresets.map(t => (
                      <button key={t} onClick={() => saveFastingEntry(todayStr, { ...todayFasting, firstMealToday: t })}
                        className={`text-xs px-1.5 py-0.5 rounded ${firstMeal === t ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                        {t.replace(':00', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {(lastMeal || firstMeal) && (
                <button onClick={() => saveFastingEntry(todayStr, { lastMealYesterday: null, firstMealToday: null, fastStart: null, fastEnd: null })}
                  className="text-xs text-slate-500 hover:text-slate-400">Reset</button>
              )}
            </div>
          );
        })()}
      </Section>

      {/* ══════ THIS WEEK ══════ */}
      <Section title="This Week" emoji="📅" defaultOpen={true}>
        <div className="flex justify-end -mt-2 mb-2">
          <button onClick={() => navigate('/training')} className="text-sm text-blue-400 hover:underline">View all →</button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {exercisePlan.weeklySchedule.map((day) => {
            const key = day.day.toLowerCase();
            const isToday = key === todayDow;
            const done = completions[key];
            return (
              <button key={key} onClick={() => toggleDayCompletion(key, weekKey)}
                className={`p-2 rounded-lg text-center transition-all ${
                  done ? 'bg-green-900/40 border border-green-700' :
                  isToday ? 'bg-blue-900/40 border border-blue-600' :
                  'bg-slate-700/50 border border-slate-600'
                }`}>
                <div className="text-lg">{day.emoji}</div>
                <div className="text-xs font-medium mt-1 text-slate-300">{day.day.slice(0, 3)}</div>
                {done && <div className="text-green-400 text-xs">✓</div>}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ══════ UPCOMING EVENTS ══════ */}
      {(upcomingAppts.length > 0 || needsScheduling.length > 0) && (
        <Section title="Upcoming" emoji="📋" defaultOpen={true}>
          <div className="flex justify-end -mt-2 mb-2">
            <button onClick={() => navigate('/life')} className="text-sm text-blue-400 hover:underline">View all →</button>
          </div>
          <div className="space-y-2">
            {upcomingAppts.map(appt => {
              const type = ALL_EVENT_TYPES.find(t => t.id === appt.type) || ALL_EVENT_TYPES[ALL_EVENT_TYPES.length - 1];
              return (
                <div key={appt.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-xl">{type.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200">{appt.notes || type.label}</div>
                    <div className="text-xs text-slate-400">{formatDate(appt.date)} · {daysUntil(appt.date)} days</div>
                  </div>
                </div>
              );
            })}
            {needsScheduling.length > 0 && (
              <div className="p-3 bg-amber-900/30 border border-amber-700 rounded-lg">
                <div className="text-sm font-medium text-amber-400">⚠️ {needsScheduling.length} to schedule</div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ══════ MODALS ══════ */}
      {editingChecklist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingChecklist(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Edit Healthy Habits</h3>
            <div className="space-y-2 mb-4">
              {editItems.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="text" value={item.emoji} onChange={e => {
                    const items = [...editItems]; items[i] = { ...items[i], emoji: e.target.value }; setEditItems(items);
                  }} className="w-12 bg-slate-700 border border-slate-600 rounded p-2 text-sm text-white text-center" />
                  <input type="text" value={item.label} onChange={e => {
                    const items = [...editItems]; items[i] = { ...items[i], label: e.target.value }; setEditItems(items);
                  }} className="flex-1 bg-slate-700 border border-slate-600 rounded p-2 text-sm text-white" />
                  <button onClick={() => setEditItems(editItems.filter((_, j) => j !== i))} className="text-red-400 text-sm p-1">×</button>
                </div>
              ))}
            </div>
            <button onClick={() => setEditItems([...editItems, { key: `custom-${Date.now()}`, label: '', emoji: '✅' }])}
              className="w-full py-2 border border-dashed border-slate-600 rounded-lg text-sm text-slate-400 mb-4">+ Add item</button>
            <div className="flex gap-2">
              <button onClick={() => setEditingChecklist(false)} className="flex-1 py-2 border border-slate-600 rounded-lg text-sm text-slate-300">Cancel</button>
              <button onClick={saveChecklist} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
