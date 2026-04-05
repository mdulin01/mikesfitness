import { useState, useMemo } from 'react';
import { exercisePlan, motivationalQuotes } from '../data/exercisePlan';
import { healthPlan } from '../data/healthPlan';
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

// Keep for backward compat with customDailyItems
const DEFAULT_DAILY_ITEMS = ALL_HABIT_ITEMS;

// Collapsible section wrapper
function Section({ title, emoji, defaultOpen = true, rightAction, children }) {
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

const FIBER_FOODS = [
  { id: 'oatmeal', label: 'Oatmeal', emoji: '🥣' },
  { id: 'lentils', label: 'Lentils', emoji: '🫘' },
  { id: 'beans', label: 'Beans', emoji: '🫘' },
  { id: 'broccoli', label: 'Broccoli', emoji: '🥦' },
  { id: 'berries', label: 'Berries', emoji: '🫐' },
  { id: 'chia', label: 'Chia seeds', emoji: '🌱' },
  { id: 'avocado', label: 'Avocado', emoji: '🥑' },
  { id: 'almonds', label: 'Almonds', emoji: '🥜' },
  { id: 'sweet-potato', label: 'Sweet potato', emoji: '🍠' },
  { id: 'whole-wheat', label: 'Whole wheat', emoji: '🌾' },
];

export default function Dashboard({
  data, toggleDayCompletion, getWeekKey, toggleDailyItem, setActiveSection,
  toggleMedCheck, saveFastingEntry, saveFiberEntry,
  getMonthKey,
  updateDailyItems, ...rest
}) {
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

  // (fiber tracking moved into medSchedule — Benefiber + Psyllium)

  // Exercise log
  const [showExerciseLog, setShowExerciseLog] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({ type: 'walk', duration: '', notes: '' });

  // Fasting meal-time inputs
  const [fastingEditMode, setFastingEditMode] = useState(false);

  // (medsExpanded/supplementsExpanded removed — now using time-based groups)

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

  // Fitness events from appointments (shared with Events page and Training page)
  const fitnessEvents = (data?.appointments || [])
    .filter(a => a.category === 'fitness' && a.date && a.status === 'scheduled' && a.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcomingAppts = (data?.appointments || [])
    .filter(a => a.date && a.date >= todayStr && a.status === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const needsScheduling = (data?.appointments || []).filter(a => a.status === 'needs-scheduling');

  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const daysUntil = (d) => Math.ceil((new Date(d) - new Date(todayStr)) / 86400000);

  // Meds & Supplements computed — using medSchedule grouped by time
  const allScheduleItems = (healthPlan.medSchedule || []).flatMap(g => g.items.filter(i => !i.optional));
  const scheduleCheckedCount = allScheduleItems.filter(i => medChecks[i.name]).length;
  const totalMedItems = allScheduleItems.length;
  const totalMedChecked = scheduleCheckedCount;
  const allDone = totalMedChecked === totalMedItems;
  // backward compat for health score
  const medsTakenCount = healthPlan.medications.filter(m => medChecks[m.name]).length;
  const supsTakenCount = healthPlan.supplements.filter(s => medChecks[s.name]).length;

  const dailyProgress = Object.values(dailyChecks).filter(Boolean).length;
  const dailyTotal = dailyItems.length;

  // Eat Healthy ring
  const healthyMealCount = todayMeals.length;
  const healthyMealTarget = 2;
  const eatHealthyPct = Math.min(1, healthyMealCount / healthyMealTarget);

  const startEditChecklist = () => { setEditItems([...dailyItems]); setEditingChecklist(true); };
  const saveChecklist = () => { updateDailyItems(editItems.filter(i => i.label.trim())); setEditingChecklist(false); };

  // ===== HEALTH SCORE (0-100) =====
  const healthScore = useMemo(() => {
    // Exercise (20 pts): did you work out today?
    const workoutDone = completions[todayDow] || dailyChecks['workout'] || false;
    const exercisePts = workoutDone ? 20 : (dailyChecks['move'] ? 10 : 0);

    // Nutrition (20 pts): meals logged + fiber (Benefiber AM + Psyllium PM)
    const mealPts = Math.min(10, todayMeals.length * 5);
    const fiberPts = (medChecks['Benefiber'] ? 5 : 0) + (medChecks['Psyllium'] ? 5 : 0);
    const nutritionPts = mealPts + fiberPts;

    // Sleep (20 pts): sleep habit checked
    const sleepPts = dailyChecks['sleep'] ? 20 : 0;

    // Med adherence (20 pts): proportional to meds+supplements taken
    const totalMeds = healthPlan.medications.length + healthPlan.supplements.length;
    const takenMeds = medsTakenCount + supsTakenCount;
    const medPts = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 20) : 0;

    // Weight/Labs trend (20 pts): based on weight trend toward goal
    const weights = data?.weightEntries || [];
    let trendPts = 10; // default neutral
    if (weights.length >= 2) {
      const sorted = [...weights].sort((a, b) => b.date.localeCompare(a.date));
      const latest = sorted[0].weight;
      const target = healthPlan.weightGoals?.target || 185;
      const prev = sorted[1].weight;
      // Moving toward target = good
      if (Math.abs(latest - target) < Math.abs(prev - target)) trendPts = 20;
      else if (Math.abs(latest - target) === Math.abs(prev - target)) trendPts = 10;
      else trendPts = 5;
    }

    return {
      total: exercisePts + nutritionPts + sleepPts + medPts + trendPts,
      exercise: exercisePts,
      nutrition: nutritionPts,
      sleep: sleepPts,
      meds: medPts,
      trend: trendPts,
    };
  }, [completions, todayDow, dailyChecks, todayMeals, medChecks, medsTakenCount, supsTakenCount, data?.weightEntries]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5 pb-24 md:pb-6">
      {/* Greeting + Streak */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, Mike
          </h1>
          <p className="text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        {streak > 0 && (
          <div className="bg-gradient-to-br from-orange-500 to-red-600 px-3 py-2 rounded-xl text-center">
            <div className="text-xl font-bold text-white">🔥 {streak}</div>
            <div className="text-xs text-orange-100">day streak</div>
          </div>
        )}
      </div>

      {/* Health Score */}
      <div className={`rounded-xl border p-4 ${
        healthScore.total >= 80 ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-700/50' :
        healthScore.total >= 50 ? 'bg-gradient-to-r from-yellow-900/50 to-amber-900/50 border-yellow-700/50' :
        'bg-gradient-to-r from-red-900/50 to-rose-900/50 border-red-700/50'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-3xl font-bold text-white">{healthScore.total}<span className="text-lg text-slate-400">/100</span></div>
            <div className="text-xs text-slate-400">Today's Health Score</div>
          </div>
          <div className="text-4xl">{healthScore.total >= 80 ? '🟢' : healthScore.total >= 50 ? '🟡' : '🔴'}</div>
        </div>
        <div className="grid grid-cols-5 gap-1 text-center text-xs">
          {[
            { label: 'Exercise', pts: healthScore.exercise, max: 20 },
            { label: 'Nutrition', pts: healthScore.nutrition, max: 20 },
            { label: 'Sleep', pts: healthScore.sleep, max: 20 },
            { label: 'Meds', pts: healthScore.meds, max: 20 },
            { label: 'Trend', pts: healthScore.trend, max: 20 },
          ].map(s => (
            <div key={s.label}>
              <div className="h-1.5 bg-slate-700 rounded-full mb-1">
                <div className={`h-full rounded-full ${s.pts >= s.max * 0.8 ? 'bg-green-500' : s.pts >= s.max * 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${(s.pts / s.max) * 100}%` }} />
              </div>
              <span className="text-slate-500">{s.label}</span>
              <div className="text-slate-300 font-medium">{s.pts}/{s.max}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-800/50 rounded-xl p-4">
        <p className="text-sm text-blue-200 italic">"{quote.text}"</p>
        {(quote.author || quote.source) && (
          <p className="text-xs text-blue-400 mt-1">— {quote.author || quote.source}</p>
        )}
      </div>

      {/* Progress Ring Row — 4 rings */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 text-center">
          <div className="relative w-14 h-14 mx-auto mb-1">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                strokeDasharray={`${(daysCompleted / 7) * 100} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-400">{daysCompleted}/7</div>
          </div>
          <div className="text-xs text-slate-400">Workout</div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 text-center">
          <div className="relative w-14 h-14 mx-auto mb-1">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                strokeDasharray={`${eatHealthyPct * 100} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-emerald-400">{healthyMealCount}/{healthyMealTarget}</div>
          </div>
          <div className="text-xs text-slate-400">Eat Healthy</div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 text-center">
          <div className="relative w-14 h-14 mx-auto mb-1">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={allDone ? '#22c55e' : '#f59e0b'} strokeWidth="3"
                strokeDasharray={`${(totalMedChecked / totalMedItems) * 100} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg">{allDone ? '✅' : '💊'}</div>
          </div>
          <div className="text-xs text-slate-400">Take Meds</div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 text-center">
          <div className="relative w-14 h-14 mx-auto mb-1">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3"
                strokeDasharray={`${(dailyProgress / dailyTotal) * 100} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-green-400">{dailyProgress}/{dailyTotal}</div>
          </div>
          <div className="text-xs text-slate-400">Healthy Habits</div>
        </div>
      </div>

      {/* Today's Workout */}
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
              }`}
            >
              {completions[todayDow] ? '✓ Done!' : 'Mark Done'}
            </button>
          </div>
          {/* Quick exercise log */}
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
                }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500">
                  Save
                </button>
                <button onClick={() => setShowExerciseLog(false)}
                  className="px-3 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-500">Cancel</button>
              </div>
              {/* Today's logged exercises */}
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

      {/* Today's Healthy Habits — Categorized */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-semibold text-white">✅ Today's Habits</h2>
          <button onClick={startEditChecklist} className="text-xs text-blue-400 hover:underline">Edit ✏️</button>
        </div>
        <div className="px-4 pb-4 -mt-1 space-y-3">
          {/* Critical — large, red border if missed */}
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
          {/* Important */}
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
          {/* Optional */}
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

      {/* Meds & Supplements — by time of day */}
      <Section title="Meds & Supplements" emoji="💊" defaultOpen={true}>
        <div className="space-y-2">
          {(healthPlan.medSchedule || []).map(group => {
            const required = group.items.filter(i => !i.optional);
            const checkedInGroup = required.filter(i => medChecks[i.name]).length;
            const groupDone = checkedInGroup === required.length;
            return (
              <div key={group.time}>
                <div className={`p-3 rounded-lg transition-all ${
                  groupDone ? 'bg-green-900/30 border border-green-700' : 'bg-slate-700/50 border border-slate-600'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{group.emoji}</span>
                    <span className={`text-sm font-medium ${groupDone ? 'text-green-400' : 'text-slate-300'}`}>
                      {group.label}
                    </span>
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
              </div>
            );
          })}
        </div>

        {/* Overall progress */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-slate-700 rounded-full h-2">
            <div className={`rounded-full h-2 transition-all ${allDone ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{ width: `${totalMedItems > 0 ? (totalMedChecked / totalMedItems) * 100 : 0}%` }} />
          </div>
          <span className="text-xs text-slate-400">{totalMedChecked}/{totalMedItems}</span>
        </div>
        {allDone && (
          <div className="mt-2 text-center p-2 bg-green-900/30 border border-green-700 rounded-lg">
            <span className="text-green-400 text-sm font-medium">All meds & supplements taken!</span>
          </div>
        )}
      </Section>

      {/* Nutrition Summary */}
      <Section title="Today's Nutrition" emoji="🍽️" defaultOpen={true}>
        <div className="flex justify-end -mt-2 mb-2">
          <button onClick={() => setActiveSection('nutrition')} className="text-sm text-blue-400 hover:underline">Log meals →</button>
        </div>
        {todayMeals.length === 0 ? (
          <button onClick={() => setActiveSection('nutrition')} className="w-full p-4 bg-slate-700/30 border border-dashed border-slate-600 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition-colors">
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
          </div>
        )}
      </Section>

      {/* Intermittent Fasting Tracker */}
      <Section title="Intermittent Fasting" emoji="⏱️" defaultOpen={true}>
        {(() => {
          const yesterdayStr = offsetDateStr(todayStr, -1);
          const lastMeal = todayFasting.lastMealYesterday || '';
          const firstMeal = todayFasting.firstMealToday || '';

          // Calculate fasting hours from last meal yesterday to first meal today
          let fastHours = 0;
          let fastMins = 0;
          let hasBothMeals = false;
          if (lastMeal && firstMeal) {
            hasBothMeals = true;
            const [lh, lm] = lastMeal.split(':').map(Number);
            const [fh, fm] = firstMeal.split(':').map(Number);
            // Last meal was yesterday, first meal is today
            const lastMealMins = lh * 60 + lm;
            const firstMealMins = fh * 60 + fm;
            const totalMins = (24 * 60 - lastMealMins) + firstMealMins;
            fastHours = Math.floor(totalMins / 60);
            fastMins = totalMins % 60;
          }
          const totalFastDecimal = fastHours + fastMins / 60;
          const targetHours = fastingSettings.targetFastHours;
          const pct = hasBothMeals ? Math.min(1, totalFastDecimal / targetHours) : 0;
          const metGoal = hasBothMeals && totalFastDecimal >= targetHours;

          // Quick presets for common meal times
          const lastMealPresets = ['18:00', '19:00', '20:00', '21:00'];
          const firstMealPresets = ['10:00', '11:00', '12:00', '13:00'];

          return (
            <div className="space-y-3">
              {/* Status */}
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                metGoal ? 'bg-green-900/30 border border-green-700' :
                hasBothMeals ? 'bg-amber-900/30 border border-amber-700' :
                'bg-slate-700/50 border border-slate-600'
              }`}>
                <div className="text-2xl">{metGoal ? '✅' : hasBothMeals ? '⏱️' : '🍽️'}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {metGoal ? `${fastHours}h ${fastMins}m fast — Goal met!` :
                     hasBothMeals ? `${fastHours}h ${fastMins}m fast (goal: ${targetHours}h)` :
                     'Log your meals to track fasting'}
                  </div>
                  {hasBothMeals && (
                    <div className="text-xs text-slate-400">
                      Last meal yesterday {lastMeal} → First meal today {firstMeal}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {hasBothMeals && (
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className={`rounded-full h-2 transition-all ${metGoal ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${pct * 100}%` }} />
                </div>
              )}

              {/* Meal time inputs */}
              <div className="grid grid-cols-2 gap-3">
                {/* Last meal yesterday */}
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
                {/* First meal today */}
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

              {/* Reset */}
              {(lastMeal || firstMeal) && (
                <button onClick={() => saveFastingEntry(todayStr, { lastMealYesterday: null, firstMealToday: null, fastStart: null, fastEnd: null })}
                  className="text-xs text-slate-500 hover:text-slate-400">Reset</button>
              )}

              {/* Target info */}
              <div className="text-xs text-slate-500">
                Goal: {targetHours}h fast · Typical: eat by {fastingSettings.typicalFastStart}, resume at {fastingSettings.typicalFeedingStart}
              </div>
            </div>
          );
        })()}
      </Section>

      {/* This Week's Schedule */}
      <Section title="This Week" emoji="📅" defaultOpen={true}>
        <div className="flex justify-end -mt-2 mb-2">
          <button onClick={() => setActiveSection('training')} className="text-sm text-blue-400 hover:underline">View all →</button>
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

      {/* Race Calendar — uses fitness events from appointments (shared data) */}
      <Section title="Race Calendar" emoji="🏁" defaultOpen={true}>
        {fitnessEvents.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming races. Add one from Events or Training.</p>
        ) : (
          <div className="space-y-2">
            {fitnessEvents.map(event => {
              const type = ALL_EVENT_TYPES.find(t => t.id === event.type);
              const days = daysUntil(event.date);
              const totalDays = Math.ceil((new Date(event.date) - new Date('2026-01-01')) / 86400000);
              const elapsed = totalDays - days;
              const pct = Math.max(0, Math.min(100, (elapsed / totalDays) * 100));
              const color = type?.color || '#3b82f6';
              return (
                <div key={event.id} className="p-3 rounded-lg" style={{ background: color + '15', borderLeft: `3px solid ${color}` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{type?.emoji || '🏅'}</span>
                    <div className="flex-1">
                      <div className="font-medium text-white">{event.notes || type?.label || 'Event'}</div>
                      <div className="text-xs text-slate-400">{event.location} · {formatDate(event.date)} · {days} days away</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="rounded-full h-1.5 transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Upcoming Events */}
      <Section title="Upcoming Events" emoji="📋" defaultOpen={true}>
        <div className="flex justify-end -mt-2 mb-2">
          <button onClick={() => setActiveSection('events')} className="text-sm text-blue-400 hover:underline">View all →</button>
        </div>
        {upcomingAppts.length === 0 && needsScheduling.length === 0 ? (
          <p className="text-slate-500 text-sm">No upcoming events</p>
        ) : (
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
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    type.category === 'medical' ? 'bg-blue-900/40 text-blue-400' :
                    type.category === 'fitness' ? 'bg-green-900/40 text-green-400' :
                    'bg-purple-900/40 text-purple-400'
                  }`}>{type.category}</span>
                </div>
              );
            })}
            {needsScheduling.length > 0 && (
              <div className="p-3 bg-amber-900/30 border border-amber-700 rounded-lg">
                <div className="text-sm font-medium text-amber-400">⚠️ {needsScheduling.length} event{needsScheduling.length > 1 ? 's' : ''} need scheduling</div>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ========== MODALS ========== */}

      {/* Edit Checklist Modal */}
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
