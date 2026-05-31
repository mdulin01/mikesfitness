import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { exercisePlan, motivationalQuotes } from '../data/exercisePlan';
import { healthPlan } from '../data/healthPlan';
import { MEAL_TYPES } from '../constants';
import { toLocalDateStr, offsetDateStr } from '../utils/dateUtils';
import { appleSeries, appleSum, appleAvg, appleLatest, appleTrend, sparklinePath } from '../utils/appleHealth';

const today = () => toLocalDateStr();
const dayOfWeek = () => new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

// Habits grouped by medical priority
const HABIT_GROUPS = {
  critical: [
    { key: 'workout', label: 'Exercise', emoji: '💪' },
    { key: 'sleep', label: '7+ hours sleep', emoji: '😴' },
  ],
  important: [
    { key: 'move', label: 'Move / Steps', emoji: '🏃' },
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


export default function Dashboard({
  data, save, toggleDayCompletion, getWeekKey, toggleDailyItem,
  saveFastingEntry, saveFiberEntry, saveSleepEntry,
  getMonthKey,
  updateDailyItems,
  dailyMetricsByDate, lastDailyMetricsSync,
  sharedFitness, toggleSharedWorkout, triEventId,
  ...rest
}) {
  const navigate = useNavigate();
  const weekKey = getWeekKey();
  const completions = data?.weeklyCompletions?.[weekKey] || {};
  const todayStr = today();
  const dailyChecks = data?.dailyChecklist?.[todayStr] || {};
  const todayMeals = data?.mealLog?.[todayStr] || [];
  const daysCompleted = Object.values(completions).filter(Boolean).length;
  const todayDow = dayOfWeek();
  const todayPlan = exercisePlan.weeklySchedule.find(d => d.day.toLowerCase() === todayDow);

  const dailyItems = data?.customDailyItems || DEFAULT_DAILY_ITEMS;

  // Fasting data
  const fastingSettings = data?.fastingSettings || { targetFastHours: 16, feedingWindowHours: 8, typicalFastStart: '20:00', typicalFeedingStart: '12:00' };
  const todayFasting = data?.fastingLog?.[todayStr] || {};

  // expandedSystem state was for the old biology systems row — moved to Medical.

  // Exercise log
  const [showExerciseLog, setShowExerciseLog] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({ type: 'walk', duration: '', notes: '' });

  // Sleep log
  const [showSleepLog, setShowSleepLog] = useState(false);
  const todaySleep = data?.sleepLog?.[todayStr] || {};

  // BP quick log moved to Medical — biology metric, doesn't belong on the behavior dashboard.
  const [sleepForm, setSleepForm] = useState({ bedtime: todaySleep.bedtime || '22:00', wakeTime: todaySleep.wakeTime || '06:00', quality: todaySleep.quality || 3 });

  // Water tracker removed — variables deleted. Old data persists in Firestore but is unused.

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


  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const daysUntil = (d) => Math.ceil((new Date(d) - new Date(todayStr)) / 86400000);


  const dailyProgress = Object.values(dailyChecks).filter(Boolean).length;
  const dailyTotal = dailyItems.length;

  const startEditChecklist = () => { setEditItems([...dailyItems]); setEditingChecklist(true); };
  const saveChecklist = () => { updateDailyItems(editItems.filter(i => i.label.trim())); setEditingChecklist(false); };

  // ===== SCORE =====
  const scores = useMemo(() => {
    // Behavior score (0-100): what you did today, across 4 pillars (25 each).
    const workoutDone = dailyChecks['workout'] || false;
    const moveDone = dailyChecks['move'] || false;
    const mobilityDone = dailyChecks['mobility'] || false;
    const exercisePts = (workoutDone ? 15 : 0) + (moveDone ? 5 : 0) + (mobilityDone ? 5 : 0); // 25 max

    const nutritionPts = Math.min(25, todayMeals.length * 6); // 25 max

    const sleepEntry = data?.sleepLog?.[todayStr] || {};
    const sleepPts = sleepEntry.hours ? (sleepEntry.hours >= 7 ? 25 : sleepEntry.hours >= 6 ? 15 : 6) : (dailyChecks['sleep'] ? 25 : 0); // 25 max

    const lastMeal = todayFasting.lastMealYesterday || '';
    const firstMeal = todayFasting.firstMealToday || '';
    let fastPts = 0;
    if (lastMeal && firstMeal) {
      const [lh, lm] = lastMeal.split(':').map(Number);
      const [fh, fm] = firstMeal.split(':').map(Number);
      const hrs = ((24 * 60 - (lh * 60 + lm)) + (fh * 60 + fm)) / 60;
      fastPts = hrs >= fastingSettings.targetFastHours ? 25 : hrs >= 12 ? 12 : 0;
    } // 25 max

    const behavior = Math.min(100, exercisePts + nutritionPts + sleepPts + fastPts);
    return { behavior };
  }, [dailyChecks, todayMeals, todayFasting, data?.sleepLog, fastingSettings]);

  // Body systems display (Cardio, Kidney, etc.) moved to Medical Overview — they're biology indicators, not actionable behavior.

  // keyNumbers (Weight/BF/ApoB/eGFR/VO2/BP/RHR) moved to Medical's Biology Snapshot section.

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
    { key: 'fasting', label: 'Fasting', done: fastingStatus.metGoal },
  ];

  const scoreColor = (s) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = (s) => s >= 80 ? 'from-green-900/40 to-emerald-900/40 border-green-700/50' :
    s >= 60 ? 'from-yellow-900/40 to-amber-900/40 border-yellow-700/50' :
    'from-red-900/40 to-rose-900/40 border-red-700/50';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4 pb-24 md:pb-6">

      {/* ══════ TODAY'S BEHAVIOR ══════
           Dashboard is behavior + activity focused. Biology score, body systems,
           and lab numbers live on the Medical tab now. */}
      <div className={`rounded-xl border p-4 bg-gradient-to-br ${scoreBg(scores.behavior)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Today's Behavior</div>
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
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className={`text-4xl font-bold ${scoreColor(scores.behavior)}`}>{scores.behavior}</span>
          <span className="text-slate-500 text-sm">/ 100 behavior score</span>
        </div>

        {/* 5 behavior pillars */}
        {(() => {
          // Exercise: auto-credit from Apple Health (any of: 30+ min exercise minutes,
          // a swim, or 2+ miles walked/ran) — falls back to manual checkbox.
          const todayActivity = dailyMetricsByDate?.[todayStr]?.activity || {};
          const exerciseMin = todayActivity.exerciseMinutes || 0;
          const swam = (todayActivity.swimDistanceMeters || 0) > 0;
          const walked = (todayActivity.distanceMiles || 0) >= 2;
          const autoExercise = exerciseMin >= 30 || swam || walked;
          const partialExercise = exerciseMin >= 15;
          const exerciseValue = (autoExercise || dailyChecks['exercise']) ? 25 : (partialExercise ? 12 : 0);
          const pillars = [
            { label: 'Exercise', value: exerciseValue, max: 25 },
            { label: 'Nutrition', value: Math.min(25, todayMeals.length * 6), max: 25 },
            { label: 'Sleep', value: (() => { const s = data?.sleepLog?.[todayStr] || {}; return s.hours ? (s.hours >= 7 ? 25 : s.hours >= 6 ? 15 : 6) : (dailyChecks['sleep'] ? 25 : 0); })(), max: 25 },
            { label: 'Fasting', value: (() => { const f = todayFasting; if (!f.lastMealYesterday || !f.firstMealToday) return 0; const [lh, lm] = f.lastMealYesterday.split(':').map(Number); const [fh, fm] = f.firstMealToday.split(':').map(Number); const hrs = ((24 * 60 - (lh * 60 + lm)) + (fh * 60 + fm)) / 60; return hrs >= fastingSettings.targetFastHours ? 25 : hrs >= 12 ? 12 : 0; })(), max: 25 },
          ];
          return (
            <div className="grid grid-cols-4 gap-1.5">
              {pillars.map(p => {
                const pct = (p.value / p.max) * 100;
                const color = pct >= 90 ? 'bg-emerald-500' : pct >= 50 ? 'bg-yellow-500' : pct > 0 ? 'bg-orange-500' : 'bg-slate-600';
                return (
                  <div key={p.label} className="text-center">
                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden mb-1">
                      <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] text-slate-400">{p.label}</div>
                    <div className={`text-xs font-semibold ${pct >= 90 ? 'text-emerald-400' : pct >= 50 ? 'text-yellow-400' : pct > 0 ? 'text-orange-400' : 'text-slate-500'}`}>{p.value}</div>
                  </div>
                );
              })}
            </div>
          );
        })()}
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
        // Curated tile set — only metrics Mike actually wants on the dashboard.
        // Stand hours, floors climbed, daylight minutes, pool temp deliberately omitted.
        // env left available for the future but not rendered.
        void env;
        if (a.steps != null) tiles.push({ label: 'Steps', value: Math.round(a.steps).toLocaleString(), sub: a.distanceMiles ? `${a.distanceMiles.toFixed(2)} mi` : null });
        if (a.exerciseMinutes != null) tiles.push({ label: 'Exercise', value: Math.round(a.exerciseMinutes), sub: 'min' });
        if (a.activeEnergyKcal != null) tiles.push({ label: 'Active Cal', value: Math.round(a.activeEnergyKcal), sub: 'kcal' });
        if (a.swimDistanceMeters != null) tiles.push({ label: 'Swim', value: Math.round(a.swimDistanceMeters).toLocaleString(), sub: `yds${a.swimStrokes ? ` · ${Math.round(a.swimStrokes)} strokes` : ''}` });
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

      {/* ══════ APPLE HEALTH TRENDS (7-day rolling, weekly targets, sparklines) ══════ */}
      {(() => {
        // Pull all the series we'll use; if nothing is synced yet, hide the whole panel.
        const stepsSum = appleSum(dailyMetricsByDate, 'activity.steps', 7);
        const stepsAvg = appleAvg(dailyMetricsByDate, 'activity.steps', 7);
        const stepsSeries = appleSeries(dailyMetricsByDate, 'activity.steps', 14);
        const exerciseSum = appleSum(dailyMetricsByDate, 'activity.exerciseMinutes', 7);
        const exerciseSeries = appleSeries(dailyMetricsByDate, 'activity.exerciseMinutes', 14);
        const hrvLatest = appleLatest(dailyMetricsByDate, 'vitals.hrv');
        const hrvAvg = appleAvg(dailyMetricsByDate, 'vitals.hrv', 7);
        const hrvSeries = appleSeries(dailyMetricsByDate, 'vitals.hrv', 30);
        const hrvTrend = appleTrend(dailyMetricsByDate, 'vitals.hrv', 14);
        const rhrLatest = appleLatest(dailyMetricsByDate, 'vitals.heartRateRest');
        const rhrAvg = appleAvg(dailyMetricsByDate, 'vitals.heartRateRest', 7);
        const rhrSeries = appleSeries(dailyMetricsByDate, 'vitals.heartRateRest', 30);
        const rhrTrend = appleTrend(dailyMetricsByDate, 'vitals.heartRateRest', 14);
        const vo2Latest = appleLatest(dailyMetricsByDate, 'fitness.vo2max');
        const vo2Series = appleSeries(dailyMetricsByDate, 'fitness.vo2max', 90);
        const vo2Trend = appleTrend(dailyMetricsByDate, 'fitness.vo2max', 60);

        const anyData = stepsSum > 0 || exerciseSum > 0 || hrvLatest || rhrLatest || vo2Latest;
        if (!anyData) return null;

        // Compact trend tile. Each shows: label, latest/avg, sparkline, target/direction.
        const Sparkline = ({ series, color }) => {
          const { d, viewBox } = sparklinePath(series, 80, 20);
          if (!d) return <div className="h-5" />;
          return (
            <svg viewBox={viewBox} className="w-full h-5" preserveAspectRatio="none">
              <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          );
        };

        const arrowColor = (direction, isGood) => {
          if (direction === 'flat') return 'text-slate-400';
          // For RHR + steps direction matters opposite ways. Caller passes isGood.
          return isGood ? 'text-emerald-400' : 'text-orange-400';
        };

        const tiles = [];

        // STEPS — 7-day total, daily avg, vs 70k weekly (10k × 7) target
        if (stepsSum > 0) {
          const weeklyTarget = 70000;
          const pct = Math.min(100, Math.round((stepsSum / weeklyTarget) * 100));
          tiles.push(
            <div key="steps" className="bg-slate-900/40 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Steps · 7d</div>
                <div className="text-[10px] text-slate-500">{Math.round(stepsAvg.avg || 0).toLocaleString()}/day</div>
              </div>
              <div className="text-xl font-bold text-white">{Math.round(stepsSum).toLocaleString()}<span className="text-xs text-slate-500"> / 70k</span></div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                <div className={`h-1.5 rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-orange-500'}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-1.5"><Sparkline series={stepsSeries} color="#3b82f6" /></div>
            </div>
          );
        }

        // EXERCISE MINUTES — 7-day total vs 150-min target
        if (exerciseSum > 0 || exerciseSeries.length > 0) {
          const target = healthPlan?.exerciseTargets?.cardioMinutes || 150;
          const pct = Math.min(100, Math.round((exerciseSum / target) * 100));
          tiles.push(
            <div key="exercise" className="bg-slate-900/40 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Exercise · 7d</div>
                <div className={`text-[10px] font-medium ${pct >= 100 ? 'text-emerald-400' : pct >= 50 ? 'text-yellow-400' : 'text-orange-400'}`}>{pct}%</div>
              </div>
              <div className="text-xl font-bold text-white">{Math.round(exerciseSum)}<span className="text-xs text-slate-500"> / {target} min</span></div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                <div className={`h-1.5 rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-orange-500'}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-1.5"><Sparkline series={exerciseSeries} color="#22c55e" /></div>
            </div>
          );
        }

        // HRV — latest + 7-day avg + 30-day spark, trend up = good for HRV
        if (hrvLatest) {
          tiles.push(
            <div key="hrv" className="bg-slate-900/40 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">HRV</div>
                <div className={`text-[10px] font-medium ${arrowColor(hrvTrend.direction, hrvTrend.direction === 'up')}`}>
                  {hrvTrend.arrow}{hrvTrend.pct != null ? ` ${Math.abs(hrvTrend.pct).toFixed(0)}%` : ''}
                </div>
              </div>
              <div className="text-xl font-bold text-white">{Math.round(hrvLatest.value)}<span className="text-xs text-slate-500"> ms</span></div>
              <div className="text-[10px] text-slate-500">7d avg {Math.round(hrvAvg.avg || 0)} ms</div>
              <div className="mt-1.5"><Sparkline series={hrvSeries} color="#10b981" /></div>
            </div>
          );
        }

        // Resting HR — latest + 7-day avg + 30-day spark, trend down = good for RHR
        if (rhrLatest) {
          tiles.push(
            <div key="rhr" className="bg-slate-900/40 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">Resting HR</div>
                <div className={`text-[10px] font-medium ${arrowColor(rhrTrend.direction, rhrTrend.direction === 'down')}`}>
                  {rhrTrend.arrow}{rhrTrend.pct != null ? ` ${Math.abs(rhrTrend.pct).toFixed(0)}%` : ''}
                </div>
              </div>
              <div className="text-xl font-bold text-white">{Math.round(rhrLatest.value)}<span className="text-xs text-slate-500"> bpm</span></div>
              <div className="text-[10px] text-slate-500">7d avg {Math.round(rhrAvg.avg || 0)} bpm</div>
              <div className="mt-1.5"><Sparkline series={rhrSeries} color="#f97316" /></div>
            </div>
          );
        }

        // VO2 max — latest + 90-day spark, trend up = good
        if (vo2Latest) {
          tiles.push(
            <div key="vo2" className="bg-slate-900/40 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">VO₂ Max</div>
                <div className={`text-[10px] font-medium ${arrowColor(vo2Trend.direction, vo2Trend.direction === 'up')}`}>
                  {vo2Trend.arrow}{vo2Trend.pct != null ? ` ${Math.abs(vo2Trend.pct).toFixed(0)}%` : ''}
                </div>
              </div>
              <div className="text-xl font-bold text-white">{vo2Latest.value.toFixed(1)}<span className="text-xs text-slate-500"> ml/kg/min</span></div>
              <div className="text-[10px] text-slate-500">{vo2Latest.date}</div>
              <div className="mt-1.5"><Sparkline series={vo2Series} color="#06b6d4" /></div>
            </div>
          );
        }

        if (tiles.length === 0) return null;
        return (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs text-slate-400 uppercase tracking-wide font-semibold">⌚ 7-Day Trends</h3>
              <a href="/health" className="text-[10px] text-slate-500 hover:text-slate-300">Full charts →</a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {tiles}
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

      {/* ══════ THIS WEEK IN TRAINING (combined: tri bike+swim + active running plan) ══════ */}
      {(() => {
        const triPlan = sharedFitness?.trainingPlans?.[triEventId];
        const triEvent = sharedFitness?.events?.find(e => e.id === triEventId);
        // "Current" week = the one whose date range includes today. If none (plan
        // hasn't started yet, or we're between weeks), fall back to the next upcoming
        // week so the widget still shows something useful.
        const currentTriWeek = triPlan?.find(w => w.startDate <= todayStr && w.endDate >= todayStr)
                            || triPlan?.find(w => w.startDate >= todayStr);
        const isUpcoming = currentTriWeek && currentTriWeek.startDate > todayStr;

        // Find runs from any non-tri shared event whose week overlaps `currentTriWeek`.
        // Matches by exact start date OR if their range contains the tri week's range.
        const weekRuns = [];
        for (const event of (sharedFitness?.events || [])) {
          if (event.id === triEventId) continue;
          const runPlan = sharedFitness?.trainingPlans?.[event.id];
          if (!runPlan) continue;
          // Try same-week match first; fall back to upcoming runs if tri is upcoming
          let matching = currentTriWeek
            ? runPlan.find(w => w.startDate === currentTriWeek.startDate || (w.startDate <= currentTriWeek.startDate && w.endDate >= currentTriWeek.endDate))
            : runPlan.find(w => w.startDate <= todayStr && w.endDate >= todayStr) || runPlan.find(w => w.startDate >= todayStr);
          if (matching?.runs) {
            for (const r of matching.runs) {
              weekRuns.push({ ...r, _eventId: event.id, _weekId: matching.id, _eventName: event.name });
            }
          }
        }

        if (!currentTriWeek && weekRuns.length === 0) return null;

        const tile = (label, emoji, done, distance, onToggle) => (
          <button onClick={onToggle}
            className={`flex items-center gap-2 p-2 rounded-lg text-xs text-left transition w-full ${
              done ? 'bg-emerald-900/30 border border-emerald-700/40' : 'bg-slate-700/40 border border-slate-700 hover:bg-slate-700'
            }`}>
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}`}>
              {done && <span className="text-white text-[10px] font-bold">✓</span>}
            </span>
            <span>{emoji}</span>
            <div className="flex-1 min-w-0">
              <div className={`font-medium truncate ${done ? 'text-emerald-300 line-through' : 'text-white'}`}>{label}</div>
              {distance && <div className="text-[10px] text-slate-400 truncate">{distance}</div>}
            </div>
          </button>
        );

        const allWorkouts = [
          ...weekRuns.map(r => ({ kind: 'run', w: r })),
          ...(currentTriWeek?.bikes || []).map(b => ({ kind: 'bike', w: b })),
          ...(currentTriWeek?.swims || []).map(s => ({ kind: 'swim', w: s })),
        ];
        const doneCount = allWorkouts.filter(x => x.w.mike).length;

        return (
          <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-700/40 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-blue-300/80 font-semibold">{isUpcoming ? 'Next Up in Training' : 'This Week in Training'}</div>
                <div className="text-base font-bold text-white">
                  {currentTriWeek ? `Week ${currentTriWeek.weekNumber} of ${triPlan.length} · ${currentTriWeek.phase}` : 'Run plan only'}
                  {isUpcoming && <span className="text-xs text-blue-300/80 ml-2 font-normal">starts {currentTriWeek.startDate}</span>}
                  {triEvent && <span className="text-xs text-slate-400 ml-2 font-normal">→ {triEvent.name}</span>}
                </div>
                {currentTriWeek?.weekNotes && <div className="text-xs text-slate-400 mt-0.5">{currentTriWeek.weekNotes}</div>}
              </div>
              <a href="/triathlon" className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium whitespace-nowrap">View full plan →</a>
            </div>
            <div className="text-xs text-slate-400 mb-2">{doneCount}/{allWorkouts.length} workouts complete</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allWorkouts.map(({ kind, w }) => {
                const isRun = kind === 'run';
                const onClick = () => isRun
                  ? toggleSharedWorkout(w._eventId, w._weekId, 'runs', w.id, 'mike')
                  : toggleSharedWorkout(triEventId, currentTriWeek.id, kind === 'bike' ? 'bikes' : 'swims', w.id, 'mike');
                const emoji = isRun ? '🏃' : kind === 'bike' ? '🚴' : '🏊';
                const distance = w.distance + (w.duration ? ` · ${w.duration}` : '');
                return (
                  <div key={`${kind}-${w._eventId || ''}-${w.id}`}>
                    {tile(w.label, emoji, !!w.mike, distance, onClick)}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

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

      {/* Water tracker removed — wasn't useful in practice. Old waterLog data still exists in Firestore but is no longer read or rendered. */}


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
