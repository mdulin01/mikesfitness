import { useState, useMemo } from 'react';
import { exercisePlan, motivationalQuotes } from '../data/exercisePlan';
import { healthPlan } from '../data/healthPlan';
import { APPOINTMENT_TYPES } from '../constants';

const today = () => new Date().toISOString().split('T')[0];
const dayOfWeek = () => new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

// Default daily items — can be customized
const DEFAULT_DAILY_ITEMS = [
  { key: 'workout', label: 'Workout', emoji: '💪', editable: false },
  { key: 'steps', label: '10,000 steps', emoji: '👟' },
  { key: 'mobility', label: '10 min mobility', emoji: '🧘' },
  { key: 'water', label: '3L water', emoji: '💧' },
  { key: 'sleep', label: '7+ hours sleep', emoji: '😴' },
  { key: 'creatine', label: 'Creatine', emoji: '💊' },
];

export default function Dashboard({
  data, toggleDayCompletion, getWeekKey, toggleDailyItem, setActiveSection,
  toggleMedCheck, addMeal, deleteMeal,
  getMonthKey, toggleMonthlyGoalCheck, addMonthlyGoal, removeMonthlyGoal,
  updateDailyItems,
}) {
  const weekKey = getWeekKey();
  const completions = data?.weeklyCompletions?.[weekKey] || {};
  const todayStr = today();
  const monthKey = getMonthKey();
  const dailyChecks = data?.dailyChecklist?.[todayStr] || {};
  const medChecks = data?.medicationChecks?.[todayStr] || {};
  const todayMeals = data?.mealLog?.[todayStr] || [];
  const monthGoals = data?.monthlyGoals?.[monthKey] || { goals: [], dailyChecks: {} };
  const monthDailyChecks = monthGoals.dailyChecks?.[todayStr] || {};
  const daysCompleted = Object.values(completions).filter(Boolean).length;
  const todayDow = dayOfWeek();
  const todayPlan = exercisePlan.weeklySchedule.find(d => d.day.toLowerCase() === todayDow);
  const latestWeight = (data?.weightEntries || [])[0];

  // Custom daily items
  const dailyItems = data?.customDailyItems || DEFAULT_DAILY_ITEMS;

  // Meal logging
  const [showMealModal, setShowMealModal] = useState(false);
  const [mealForm, setMealForm] = useState({ type: 'breakfast', description: '', notes: '' });

  // Monthly goal add
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ label: '', emoji: '🎯' });

  // Edit checklist
  const [editingChecklist, setEditingChecklist] = useState(false);
  const [editItems, setEditItems] = useState([]);

  // Motivational quote (changes daily)
  const quote = useMemo(() => {
    const dayIndex = Math.floor(Date.now() / 86400000) % motivationalQuotes.length;
    return motivationalQuotes[dayIndex];
  }, []);

  // Calculate streaks
  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    d.setDate(d.getDate() - 1); // start from yesterday
    while (true) {
      const dateStr = d.toISOString().split('T')[0];
      const checks = data?.dailyChecklist?.[dateStr] || {};
      const completed = Object.values(checks).filter(Boolean).length;
      if (completed >= 3) { // at least 3 items checked = counts as active day
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    // Check today too
    const todayChecked = Object.values(dailyChecks).filter(Boolean).length;
    if (todayChecked >= 3) count++;
    return count;
  }, [data, dailyChecks]);

  // Monthly goal progress
  const monthProgress = useMemo(() => {
    if (!monthGoals.goals.length) return { daysClean: 0, totalDays: 0 };
    const now = new Date();
    const totalDays = now.getDate();
    let perfectDays = 0;
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${monthKey}-${String(i).padStart(2, '0')}`;
      const checks = monthGoals.dailyChecks?.[dateStr] || {};
      const allChecked = monthGoals.goals.every(g => checks[g.id]);
      if (allChecked) perfectDays++;
    }
    return { daysClean: perfectDays, totalDays };
  }, [monthGoals, monthKey]);

  const upcomingAppts = (data?.appointments || [])
    .filter(a => a.date && a.date >= todayStr && a.status === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const needsScheduling = (data?.appointments || []).filter(a => a.status === 'needs-scheduling');

  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const daysUntil = (d) => Math.ceil((new Date(d) - new Date(todayStr)) / 86400000);

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { id: 'lunch', label: 'Lunch', emoji: '☀️' },
    { id: 'dinner', label: 'Dinner', emoji: '🌙' },
    { id: 'snack', label: 'Snack', emoji: '🍎' },
  ];

  const submitMeal = (e) => {
    e.preventDefault();
    if (!mealForm.description) return;
    addMeal(todayStr, { ...mealForm, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
    setMealForm({ type: 'breakfast', description: '', notes: '' });
    setShowMealModal(false);
  };

  const submitGoal = (e) => {
    e.preventDefault();
    if (!goalForm.label) return;
    addMonthlyGoal(monthKey, { label: goalForm.label, emoji: goalForm.emoji });
    setGoalForm({ label: '', emoji: '🎯' });
    setShowGoalModal(false);
  };

  const startEditChecklist = () => {
    setEditItems([...dailyItems]);
    setEditingChecklist(true);
  };

  const saveChecklist = () => {
    updateDailyItems(editItems.filter(i => i.label.trim()));
    setEditingChecklist(false);
  };

  const allMedsTaken = healthPlan.medications.every(m => medChecks[m.name]);
  const dailyProgress = Object.values(dailyChecks).filter(Boolean).length;
  const dailyTotal = dailyItems.length;

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

      {/* Progress Ring Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                strokeDasharray={`${(daysCompleted / 7) * 100} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-blue-400">{daysCompleted}/7</div>
          </div>
          <div className="text-xs text-slate-400">Workouts</div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3"
                strokeDasharray={`${(dailyProgress / dailyTotal) * 100} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-green-400">{dailyProgress}/{dailyTotal}</div>
          </div>
          <div className="text-xs text-slate-400">Today</div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={allMedsTaken ? '#22c55e' : '#f59e0b'} strokeWidth="3"
                strokeDasharray={`${(Object.values(medChecks).filter(Boolean).length / Math.max(healthPlan.medications.length, 1)) * 100} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg">{allMedsTaken ? '✅' : '💊'}</div>
          </div>
          <div className="text-xs text-slate-400">Meds</div>
        </div>
      </div>

      {/* Today's Workout */}
      {todayPlan && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{todayPlan.emoji}</div>
            <div className="flex-1">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Today's Workout</div>
              <div className="font-medium text-white">{todayPlan.exercise}</div>
            </div>
            <button
              onClick={() => toggleDayCompletion(todayDow, weekKey)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                completions[todayDow]
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              {completions[todayDow] ? '✓ Done!' : 'Mark Done'}
            </button>
          </div>
        </div>
      )}

      {/* Daily Checklist */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Daily Checklist</h2>
          <button onClick={startEditChecklist} className="text-xs text-blue-400 hover:underline">Edit ✏️</button>
        </div>
        <div className="space-y-2">
          {dailyItems.map(item => (
            <button
              key={item.key}
              onClick={() => toggleDailyItem(todayStr, item.key)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                dailyChecks[item.key]
                  ? 'bg-green-900/30 border border-green-700'
                  : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                dailyChecks[item.key] ? 'border-green-500 bg-green-500' : 'border-slate-500'
              }`}>
                {dailyChecks[item.key] && <span className="text-white text-xs">✓</span>}
              </div>
              <span className={`text-sm ${dailyChecks[item.key] ? 'text-green-400 line-through' : 'text-slate-300'}`}>
                {item.emoji} {item.label}
              </span>
            </button>
          ))}
        </div>
        {dailyProgress === dailyTotal && dailyTotal > 0 && (
          <div className="mt-3 text-center p-2 bg-green-900/30 border border-green-700 rounded-lg">
            <span className="text-green-400 text-sm font-medium">🎉 All items completed! Great job today!</span>
          </div>
        )}
      </div>

      {/* Medication Check-In */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-white mb-3">💊 Medication Check-In</h2>
        <div className="space-y-2">
          {healthPlan.medications.map(med => (
            <button
              key={med.name}
              onClick={() => toggleMedCheck(todayStr, med.name)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                medChecks[med.name]
                  ? 'bg-green-900/30 border border-green-700'
                  : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                medChecks[med.name] ? 'border-green-500 bg-green-500' : 'border-slate-500'
              }`}>
                {medChecks[med.name] && <span className="text-white text-xs">✓</span>}
              </div>
              <div className="flex-1 text-left">
                <span className={`text-sm ${medChecks[med.name] ? 'text-green-400 line-through' : 'text-slate-300'}`}>
                  {med.name}
                </span>
              </div>
              <span className="text-xs text-slate-500">{med.category}</span>
            </button>
          ))}
        </div>
        {allMedsTaken && (
          <div className="mt-3 text-center p-2 bg-green-900/30 border border-green-700 rounded-lg">
            <span className="text-green-400 text-sm font-medium">✅ All medications taken today!</span>
          </div>
        )}
      </div>

      {/* Monthly Goals */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">🎯 Monthly Goals — {new Date().toLocaleDateString('en-US', { month: 'long' })}</h2>
          <button onClick={() => setShowGoalModal(true)} className="text-xs text-blue-400 hover:underline">+ Add</button>
        </div>
        {monthGoals.goals.length === 0 ? (
          <p className="text-sm text-slate-500">No monthly goals set. Add one to start tracking!</p>
        ) : (
          <>
            <div className="space-y-2 mb-3">
              {monthGoals.goals.map(goal => (
                <div key={goal.id} className="flex items-center gap-3">
                  <button
                    onClick={() => toggleMonthlyGoalCheck(monthKey, todayStr, goal.id)}
                    className={`flex-1 flex items-center gap-3 p-3 rounded-lg transition-all ${
                      monthDailyChecks[goal.id]
                        ? 'bg-green-900/30 border border-green-700'
                        : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      monthDailyChecks[goal.id] ? 'border-green-500 bg-green-500' : 'border-slate-500'
                    }`}>
                      {monthDailyChecks[goal.id] && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className={`text-sm ${monthDailyChecks[goal.id] ? 'text-green-400' : 'text-slate-300'}`}>
                      {goal.emoji} {goal.label}
                    </span>
                  </button>
                  <button onClick={() => removeMonthlyGoal(monthKey, goal.id)} className="text-slate-600 hover:text-red-400 text-xs p-1">×</button>
                </div>
              ))}
            </div>
            {/* Progress bar for the month */}
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Month progress</span>
                <span>{monthProgress.daysClean}/{monthProgress.totalDays} perfect days</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div className="bg-green-500 rounded-full h-2 transition-all"
                  style={{ width: `${monthProgress.totalDays ? (monthProgress.daysClean / monthProgress.totalDays) * 100 : 0}%` }} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Meal Log */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">🍽️ Today's Meals</h2>
          <button onClick={() => setShowMealModal(true)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium">+ Log Meal</button>
        </div>
        {todayMeals.length === 0 ? (
          <p className="text-sm text-slate-500">No meals logged yet today. Tap + to start tracking.</p>
        ) : (
          <div className="space-y-2">
            {todayMeals.map(meal => {
              const mt = mealTypes.find(t => t.id === meal.type) || mealTypes[0];
              return (
                <div key={meal.id} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-lg">{mt.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{meal.description}</div>
                    <div className="text-xs text-slate-400">{mt.label} · {meal.time}</div>
                    {meal.notes && <div className="text-xs text-slate-500 mt-1">{meal.notes}</div>}
                  </div>
                  <button onClick={() => deleteMeal(todayStr, meal.id)} className="text-slate-600 hover:text-red-400 text-xs p-1">×</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* This Week's Schedule */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">This Week</h2>
          <button onClick={() => setActiveSection('training')} className="text-sm text-blue-400 hover:underline">View all →</button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {exercisePlan.weeklySchedule.map((day) => {
            const key = day.day.toLowerCase();
            const isToday = key === todayDow;
            const done = completions[key];
            return (
              <button
                key={key}
                onClick={() => toggleDayCompletion(key, weekKey)}
                className={`p-2 rounded-lg text-center transition-all ${
                  done ? 'bg-green-900/40 border border-green-700' :
                  isToday ? 'bg-blue-900/40 border border-blue-600' :
                  'bg-slate-700/50 border border-slate-600'
                }`}
              >
                <div className="text-lg">{day.emoji}</div>
                <div className="text-xs font-medium mt-1 text-slate-300">{day.day.slice(0, 3)}</div>
                {done && <div className="text-green-400 text-xs">✓</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Race Calendar */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-white mb-3">Race Calendar</h2>
        <div className="space-y-2">
          {(data?.trainingEvents || []).map(event => {
            const days = daysUntil(event.date);
            const totalDays = Math.ceil((new Date(event.date) - new Date('2026-01-01')) / 86400000);
            const elapsed = totalDays - days;
            const pct = Math.max(0, Math.min(100, (elapsed / totalDays) * 100));
            return (
              <div key={event.id} className="p-3 rounded-lg" style={{ background: event.color + '15', borderLeft: `3px solid ${event.color}` }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{event.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium text-white">{event.name}</div>
                    <div className="text-xs text-slate-400">{event.location} · {formatDate(event.date)} · {days} days away</div>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="rounded-full h-1.5 transition-all" style={{ width: `${pct}%`, background: event.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Upcoming Appointments</h2>
          <button onClick={() => setActiveSection('appointments')} className="text-sm text-blue-400 hover:underline">View all →</button>
        </div>
        {upcomingAppts.length === 0 && needsScheduling.length === 0 ? (
          <p className="text-slate-500 text-sm">No upcoming appointments</p>
        ) : (
          <div className="space-y-2">
            {upcomingAppts.map(appt => {
              const type = APPOINTMENT_TYPES.find(t => t.id === appt.type) || APPOINTMENT_TYPES[7];
              return (
                <div key={appt.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-xl">{type.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200">{type.label}</div>
                    <div className="text-xs text-slate-400">{formatDate(appt.date)} · {daysUntil(appt.date)} days</div>
                  </div>
                </div>
              );
            })}
            {needsScheduling.length > 0 && (
              <div className="p-3 bg-amber-900/30 border border-amber-700 rounded-lg">
                <div className="text-sm font-medium text-amber-400">
                  ⚠️ {needsScheduling.length} appointment{needsScheduling.length > 1 ? 's' : ''} need scheduling
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========== MODALS ========== */}

      {/* Meal Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowMealModal(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Log Meal</h3>
            <form onSubmit={submitMeal} className="space-y-3">
              <div className="flex gap-2">
                {mealTypes.map(t => (
                  <button key={t.id} type="button"
                    onClick={() => setMealForm(f => ({ ...f, type: t.id }))}
                    className={`flex-1 p-2 rounded-lg text-center text-xs transition-all ${
                      mealForm.type === t.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-lg">{t.emoji}</div>
                    {t.label}
                  </button>
                ))}
              </div>
              <input type="text" placeholder="What did you eat?" value={mealForm.description}
                onChange={e => setMealForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" required />
              <input type="text" placeholder="Notes (optional)" value={mealForm.notes}
                onChange={e => setMealForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowMealModal(false)} className="flex-1 py-2 border border-slate-600 rounded-lg text-sm text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Monthly Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowGoalModal(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Add Monthly Goal</h3>
            <form onSubmit={submitGoal} className="space-y-3">
              <div className="flex gap-2">
                {['🎯', '🚫', '✅', '💪', '🧠', '❤️', '🏃', '🥗'].map(e => (
                  <button key={e} type="button"
                    onClick={() => setGoalForm(f => ({ ...f, emoji: e }))}
                    className={`p-2 rounded text-lg ${goalForm.emoji === e ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >{e}</button>
                ))}
              </div>
              <input type="text" placeholder="Goal description (e.g., No alcohol)" value={goalForm.label}
                onChange={e => setGoalForm(f => ({ ...f, label: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" required />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowGoalModal(false)} className="flex-1 py-2 border border-slate-600 rounded-lg text-sm text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Add Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Checklist Modal */}
      {editingChecklist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingChecklist(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Edit Daily Checklist</h3>
            <div className="space-y-2 mb-4">
              {editItems.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="text" value={item.emoji} onChange={e => {
                    const items = [...editItems];
                    items[i] = { ...items[i], emoji: e.target.value };
                    setEditItems(items);
                  }} className="w-12 bg-slate-700 border border-slate-600 rounded p-2 text-sm text-white text-center" />
                  <input type="text" value={item.label} onChange={e => {
                    const items = [...editItems];
                    items[i] = { ...items[i], label: e.target.value };
                    setEditItems(items);
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
