import { useState, useMemo } from 'react';
import { exercisePlan, motivationalQuotes } from '../data/exercisePlan';
import { healthPlan } from '../data/healthPlan';
import { ALL_EVENT_TYPES, MEAL_TYPES } from '../constants';
import { toLocalDateStr } from '../utils/dateUtils';

const today = () => toLocalDateStr();
const dayOfWeek = () => new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

const DEFAULT_DAILY_ITEMS = [
  { key: 'move', label: 'Move', emoji: '🏃' },
  { key: 'mobility', label: '10 min mobility', emoji: '🧘' },
  { key: 'water', label: '3L water', emoji: '💧' },
  { key: 'sleep', label: '7+ hours sleep', emoji: '😴' },
  { key: 'social', label: 'Social', emoji: '👥' },
  { key: 'cognitive', label: 'Cognitive', emoji: '🧠' },
  { key: 'no-alcohol', label: 'No Alcohol', emoji: '🚫🍺' },
  { key: 'no-sweets', label: 'No Sweets', emoji: '🚫🍰' },
];

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
  const fastActive = todayFasting.fastStart && !todayFasting.fastEnd;

  // Fiber data
  const todayFiber = data?.fiberLog?.[todayStr] || {};

  // Collapsible sections
  const [medsExpanded, setMedsExpanded] = useState(false);
  const [supplementsExpanded, setSupplementsExpanded] = useState(false);

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

  // Meds & Supplements computed
  const allMedsTaken = healthPlan.medications.every(m => medChecks[m.name]);
  const medsTakenCount = healthPlan.medications.filter(m => medChecks[m.name]).length;
  const allSupsTaken = healthPlan.supplements.every(s => medChecks[s.name]);
  const supsTakenCount = healthPlan.supplements.filter(s => medChecks[s.name]).length;
  const fiberMorning = todayFiber.morning || false;
  const fiberEvening = todayFiber.evening || false;
  const fiberCount = (fiberMorning ? 1 : 0) + (fiberEvening ? 1 : 0);
  const totalMedItems = healthPlan.medications.length + healthPlan.supplements.length + 2; // +2 for fiber AM/PM
  const totalMedChecked = medsTakenCount + supsTakenCount + fiberCount;
  const allDone = totalMedChecked === totalMedItems;

  const dailyProgress = Object.values(dailyChecks).filter(Boolean).length;
  const dailyTotal = dailyItems.length;

  // Eat Healthy ring
  const healthyMealCount = todayMeals.length;
  const healthyMealTarget = 2;
  const eatHealthyPct = Math.min(1, healthyMealCount / healthyMealTarget);

  const startEditChecklist = () => { setEditItems([...dailyItems]); setEditingChecklist(true); };
  const saveChecklist = () => { updateDailyItems(editItems.filter(i => i.label.trim())); setEditingChecklist(false); };

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
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="font-medium text-white">{todayPlan.exercise}</div>
            </div>
            <button
              onClick={() => toggleDayCompletion(todayDow, weekKey)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                completions[todayDow] ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              {completions[todayDow] ? '✓ Done!' : 'Mark Done'}
            </button>
          </div>
        </Section>
      )}

      {/* Today's Healthy Habits */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-semibold text-white">✅ Today's Healthy Habits</h2>
          <button onClick={startEditChecklist} className="text-xs text-blue-400 hover:underline">Edit ✏️</button>
        </div>
        <div className="px-4 pb-4 -mt-1">
          <div className="space-y-2">
            {dailyItems.map(item => (
              <button key={item.key} onClick={() => toggleDailyItem(todayStr, item.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  dailyChecks[item.key] ? 'bg-green-900/30 border border-green-700' : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
                }`}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  dailyChecks[item.key] ? 'border-green-500 bg-green-500' : 'border-slate-500'
                }`}>{dailyChecks[item.key] && <span className="text-white text-xs">✓</span>}</div>
                <span className={`text-sm ${dailyChecks[item.key] ? 'text-green-400 line-through' : 'text-slate-300'}`}>{item.emoji} {item.label}</span>
              </button>
            ))}
          </div>
          {dailyProgress === dailyTotal && dailyTotal > 0 && (
            <div className="mt-3 text-center p-2 bg-green-900/30 border border-green-700 rounded-lg">
              <span className="text-green-400 text-sm font-medium">🎉 All habits completed! Great job today!</span>
            </div>
          )}
        </div>
      </div>

      {/* Meds & Supplements */}
      <Section title="Meds & Supplements" emoji="💊" defaultOpen={true}>
        <div className="space-y-2">
          {/* Medications group */}
          <div>
            <button onClick={() => setMedsExpanded(e => !e)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                allMedsTaken ? 'bg-green-900/30 border border-green-700' : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
              }`}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                allMedsTaken ? 'border-green-500 bg-green-500' : medsTakenCount > 0 ? 'border-yellow-500 bg-yellow-500/30' : 'border-slate-500'
              }`}>
                {allMedsTaken ? <span className="text-white text-xs">✓</span> : medsTakenCount > 0 ? <span className="text-yellow-300 text-xs">{medsTakenCount}</span> : null}
              </div>
              <span className={`text-sm flex-1 text-left ${allMedsTaken ? 'text-green-400' : 'text-slate-300'}`}>
                Medications ({medsTakenCount}/{healthPlan.medications.length})
              </span>
              <span className="text-slate-500 text-xs">{medsExpanded ? '▲' : '▼'}</span>
            </button>
            {medsExpanded && (
              <div className="ml-4 mt-1 space-y-1">
                {healthPlan.medications.map(med => (
                  <button key={med.name} onClick={() => toggleMedCheck(todayStr, med.name)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-sm ${
                      medChecks[med.name] ? 'bg-green-900/20 text-green-400' : 'text-slate-400 hover:bg-slate-700/50'
                    }`}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      medChecks[med.name] ? 'border-green-500 bg-green-500' : 'border-slate-500'
                    }`}>{medChecks[med.name] && <span className="text-white text-[10px]">✓</span>}</div>
                    <span className={medChecks[med.name] ? 'line-through' : ''}>{med.name}</span>
                    <span className="text-xs text-slate-600 ml-auto">{med.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fiber — Morning & Evening */}
          <div className={`p-3 rounded-lg transition-all ${
            fiberCount === 2 ? 'bg-green-900/30 border border-green-700' : 'bg-slate-700/50 border border-slate-600'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-slate-300">🌾 Fiber ({fiberCount}/2)</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => saveFiberEntry(todayStr, { morning: !fiberMorning })}
                className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-xs transition-all ${
                  fiberMorning ? 'bg-green-900/40 border border-green-700 text-green-400' : 'bg-slate-600/50 border border-slate-500 text-slate-400 hover:bg-slate-600'
                }`}>
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  fiberMorning ? 'border-green-500 bg-green-500' : 'border-slate-500'
                }`}>{fiberMorning && <span className="text-white text-[10px]">✓</span>}</div>
                AM
              </button>
              <button onClick={() => saveFiberEntry(todayStr, { evening: !fiberEvening })}
                className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-xs transition-all ${
                  fiberEvening ? 'bg-green-900/40 border border-green-700 text-green-400' : 'bg-slate-600/50 border border-slate-500 text-slate-400 hover:bg-slate-600'
                }`}>
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  fiberEvening ? 'border-green-500 bg-green-500' : 'border-slate-500'
                }`}>{fiberEvening && <span className="text-white text-[10px]">✓</span>}</div>
                PM
              </button>
            </div>
            {/* Fiber-rich foods eaten today */}
            <div className="mt-2 flex flex-wrap gap-1">
              {FIBER_FOODS.map(f => {
                const eaten = (todayFiber.foods || []).includes(f.id);
                return (
                  <button key={f.id} onClick={() => {
                    const foods = todayFiber.foods || [];
                    saveFiberEntry(todayStr, { foods: eaten ? foods.filter(x => x !== f.id) : [...foods, f.id] });
                  }}
                    className={`text-[10px] px-1.5 py-0.5 rounded-full transition-all ${
                      eaten ? 'bg-green-900/40 text-green-400 border border-green-700' : 'bg-slate-600/50 text-slate-500 hover:text-slate-300'
                    }`}>
                    {f.emoji} {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Supplements group */}
          <div>
            <button onClick={() => setSupplementsExpanded(e => !e)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                allSupsTaken ? 'bg-green-900/30 border border-green-700' : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
              }`}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                allSupsTaken ? 'border-green-500 bg-green-500' : supsTakenCount > 0 ? 'border-yellow-500 bg-yellow-500/30' : 'border-slate-500'
              }`}>
                {allSupsTaken ? <span className="text-white text-xs">✓</span> : supsTakenCount > 0 ? <span className="text-yellow-300 text-xs">{supsTakenCount}</span> : null}
              </div>
              <span className={`text-sm flex-1 text-left ${allSupsTaken ? 'text-green-400' : 'text-slate-300'}`}>
                Supplements ({supsTakenCount}/{healthPlan.supplements.length})
              </span>
              <span className="text-slate-500 text-xs">{supplementsExpanded ? '▲' : '▼'}</span>
            </button>
            {supplementsExpanded && (
              <div className="ml-4 mt-1 space-y-1">
                {healthPlan.supplements.map(sup => (
                  <button key={sup.name} onClick={() => toggleMedCheck(todayStr, sup.name)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-sm ${
                      medChecks[sup.name] ? 'bg-green-900/20 text-green-400' : 'text-slate-400 hover:bg-slate-700/50'
                    }`}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      medChecks[sup.name] ? 'border-green-500 bg-green-500' : 'border-slate-500'
                    }`}>{medChecks[sup.name] && <span className="text-white text-[10px]">✓</span>}</div>
                    <span className={medChecks[sup.name] ? 'line-through' : ''}>{sup.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {allDone && (
          <div className="mt-3 text-center p-2 bg-green-900/30 border border-green-700 rounded-lg">
            <span className="text-green-400 text-sm font-medium">✅ All meds & supplements taken!</span>
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
          const now = new Date();
          let fastHours = 0;
          let fastMins = 0;
          if (todayFasting.fastStart) {
            const end = todayFasting.fastEnd ? new Date(todayFasting.fastEnd) : now;
            const start = new Date(todayFasting.fastStart);
            const diff = (end - start) / 1000 / 60;
            fastHours = Math.floor(diff / 60);
            fastMins = Math.floor(diff % 60);
          }
          const pct = Math.min(1, (fastHours + fastMins / 60) / fastingSettings.targetFastHours);
          const metGoal = (fastHours + fastMins / 60) >= fastingSettings.targetFastHours;

          return (
            <div className="space-y-3">
              {/* Status bar */}
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                fastActive ? 'bg-amber-900/30 border border-amber-700' :
                metGoal ? 'bg-green-900/30 border border-green-700' :
                'bg-slate-700/50 border border-slate-600'
              }`}>
                <div className="text-2xl">{fastActive ? '🔥' : metGoal ? '✅' : '🍽️'}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {fastActive ? 'Fasting' : metGoal ? 'Fast complete!' : todayFasting.fastEnd ? 'Feeding window' : 'Not started'}
                  </div>
                  {todayFasting.fastStart && (
                    <div className="text-xs text-slate-400">
                      {fastHours}h {fastMins}m {fastActive ? 'fasted' : 'total fast'} / {fastingSettings.targetFastHours}h goal
                    </div>
                  )}
                </div>
                {!todayFasting.fastStart ? (
                  <button onClick={() => saveFastingEntry(todayStr, { fastStart: new Date().toISOString() })}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-500">
                    Start Fast
                  </button>
                ) : fastActive ? (
                  <button onClick={() => saveFastingEntry(todayStr, { fastEnd: new Date().toISOString() })}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-500">
                    End Fast
                  </button>
                ) : (
                  <button onClick={() => saveFastingEntry(todayStr, { fastStart: null, fastEnd: null })}
                    className="px-3 py-1.5 bg-slate-600 text-white rounded-lg text-xs font-medium hover:bg-slate-500">
                    Reset
                  </button>
                )}
              </div>

              {/* Progress bar */}
              {todayFasting.fastStart && (
                <div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className={`rounded-full h-2 transition-all ${metGoal ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: `${pct * 100}%` }} />
                  </div>
                </div>
              )}

              {/* Feeding window info */}
              <div className="flex gap-2 text-xs text-slate-500">
                <span>Feeding: {fastingSettings.typicalFeedingStart} – {fastingSettings.typicalFastStart}</span>
                <span>·</span>
                <span>{fastingSettings.targetFastHours}:{String(fastingSettings.feedingWindowHours).padStart(2,'0')} fast:feed</span>
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
