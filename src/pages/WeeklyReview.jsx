import { useState, useMemo } from 'react';
import { healthPlan } from '../data/healthPlan';
import { toLocalDateStr, offsetDateStr } from '../utils/dateUtils';

function Section({ title, emoji, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/50 transition-colors"
      >
        <h2 className="font-semibold text-white">{emoji && `${emoji} `}{title}</h2>
        <span className="text-slate-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 pb-4 -mt-1 border-t border-slate-700">{children}</div>}
    </div>
  );
}

export default function WeeklyReview({ data, getWeekKey, getMonthKey, save, ...rest }) {
  const weekKey = getWeekKey();
  const weeklyData = data?.weeklyReview?.[weekKey] || {};

  // Form state
  const [form, setForm] = useState({
    sleepAvg: weeklyData.sleepAvg || '',
    bloodPressure: weeklyData.bloodPressure || '',
    alcohol: weeklyData.alcohol || false,
    notes: weeklyData.notes || '',
    nextWeekPlan: weeklyData.nextWeekPlan || '',
  });

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const getWeekDateRange = (offset = 0) => {
    const today = new Date();
    const todayStr = toLocalDateStr(today);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() - daysToMonday);

    const mondayStr = toLocalDateStr(mondayDate);
    const mondayAdjusted = offsetDateStr(mondayStr, offset * 7);

    const sundayStr = offsetDateStr(mondayAdjusted, 6);

    return { monday: mondayAdjusted, sunday: sundayStr };
  };

  const displayWeek = getWeekDateRange(currentWeekOffset);
  const displayWeekKey = `${displayWeek.monday.slice(0, 4)}-W${String(Math.ceil(parseInt(displayWeek.monday.slice(8)) / 7)).padStart(2, '0')}`;

  // Compute metrics for current week
  const metrics = useMemo(() => {
    const weekCompletions = data?.weeklyCompletions?.[weekKey] || {};
    const dailyChecklist = data?.dailyChecklist || {};
    const medicationChecks = data?.medicationChecks || {};
    const weightEntries = data?.weightEntries || [];
    const fiberLog = data?.fiberLog || {};

    // Workout summary
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const workoutsDone = days.filter(d => weekCompletions[d]).length;
    const workoutsPlanned = healthPlan.exerciseTargets.strengthDays;

    // Weight change this week
    const sortedWeights = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
    const weekStartStr = offsetDateStr(toLocalDateStr(), -6); // 7 days back
    const weightsThisWeek = sortedWeights.filter(w => w.date >= weekStartStr);
    let weightChange = null;
    if (weightsThisWeek.length >= 2) {
      const first = weightsThisWeek[0];
      const last = weightsThisWeek[weightsThisWeek.length - 1];
      weightChange = (last.weight - first.weight).toFixed(1);
    }

    // Avg habits completed per day (last 7 days)
    let habitsCompletedCount = 0;
    let daysWithData = 0;
    for (let i = 0; i < 7; i++) {
      const dateStr = offsetDateStr(toLocalDateStr(), -i);
      const dayChecklist = dailyChecklist[dateStr];
      if (dayChecklist) {
        daysWithData++;
        const completedToday = Object.values(dayChecklist).filter(v => v).length;
        habitsCompletedCount += completedToday;
      }
    }
    const avgHabitsPerDay = daysWithData > 0 ? (habitsCompletedCount / daysWithData).toFixed(1) : 0;

    // Med adherence % (10 total meds+supplements, last 7 days)
    const totalMeds = healthPlan.medications.length + healthPlan.supplements.length;
    let medDaysCompleted = 0;
    let medDaysTracked = 0;
    for (let i = 0; i < 7; i++) {
      const dateStr = offsetDateStr(toLocalDateStr(), -i);
      const dayMeds = medicationChecks[dateStr];
      if (dayMeds) {
        medDaysTracked++;
        const medsChecked = Object.values(dayMeds).filter(v => v).length;
        if (medsChecked === totalMeds) {
          medDaysCompleted++;
        }
      }
    }
    const medAdherence = medDaysTracked > 0 ? Math.round((medDaysCompleted / medDaysTracked) * 100) : 0;

    // Fiber adherence (days with morning + evening both true, last 7 days)
    let fiberDaysComplete = 0;
    for (let i = 0; i < 7; i++) {
      const dateStr = offsetDateStr(toLocalDateStr(), -i);
      const dayFiber = fiberLog[dateStr];
      if (dayFiber?.morning && dayFiber?.evening) {
        fiberDaysComplete++;
      }
    }

    return {
      workoutsDone,
      workoutsPlanned,
      weightChange,
      avgHabitsPerDay,
      medAdherence,
      fiberDaysComplete,
    };
  }, [data, weekKey]);

  const handleSave = () => {
    save({
      weeklyReview: {
        ...data.weeklyReview,
        [weekKey]: {
          sleepAvg: form.sleepAvg ? parseFloat(form.sleepAvg) : null,
          bloodPressure: form.bloodPressure,
          alcohol: form.alcohol,
          notes: form.notes,
          nextWeekPlan: form.nextWeekPlan,
        },
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-4 md:p-6 space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📊 Weekly Review</h1>
          <p className="text-sm text-slate-400 mt-1">
            {formatDate(displayWeek.monday)} – {formatDate(displayWeek.sunday)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentWeekOffset(o => o - 1)}
            className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={() => setCurrentWeekOffset(0)}
            className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentWeekOffset(o => o + 1)}
            className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Workout Summary */}
      <Section title="Workout Summary" emoji="💪" defaultOpen={true}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{metrics.workoutsDone}</div>
              <div className="text-xs text-slate-400 mt-1">Completed</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-slate-300">{metrics.workoutsPlanned}</div>
              <div className="text-xs text-slate-400 mt-1">Planned</div>
            </div>
          </div>

          {/* Day breakdown */}
          <div className="grid grid-cols-7 gap-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][idx];
              const completed = data?.weeklyCompletions?.[weekKey]?.[dayKey];
              return (
                <div
                  key={day}
                  className={`p-2 rounded text-center text-xs font-medium transition-colors ${
                    completed
                      ? 'bg-green-900/40 text-green-300'
                      : 'bg-slate-700/50 text-slate-400'
                  }`}
                >
                  {completed ? '✓' : '—'} {day}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Key Metrics Summary */}
      <Section title="Key Metrics" emoji="📈" defaultOpen={true}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Weight Change</div>
            <div className={`text-lg font-bold ${metrics.weightChange === null ? 'text-slate-400' : parseFloat(metrics.weightChange) <= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.weightChange === null ? '—' : `${parseFloat(metrics.weightChange) > 0 ? '+' : ''}${metrics.weightChange} lbs`}
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Avg Habits/Day</div>
            <div className="text-lg font-bold text-blue-400">{metrics.avgHabitsPerDay}</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Med Adherence</div>
            <div className="text-lg font-bold text-purple-400">{metrics.medAdherence}%</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Fiber Days</div>
            <div className="text-lg font-bold text-orange-400">{metrics.fiberDaysComplete}/7</div>
          </div>
        </div>
      </Section>

      {/* Editable Review Fields */}
      <Section title="Review Notes" emoji="✍️" defaultOpen={true}>
        <div className="space-y-4">
          {/* Sleep */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              😴 Average Sleep (hours)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="12"
              value={form.sleepAvg}
              onChange={e => setForm(f => ({ ...f, sleepAvg: e.target.value }))}
              placeholder="e.g., 7.5"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Blood Pressure */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              🩸 Average Blood Pressure
            </label>
            <input
              type="text"
              value={form.bloodPressure}
              onChange={e => setForm(f => ({ ...f, bloodPressure: e.target.value }))}
              placeholder="e.g., 120/80"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Alcohol */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              🍷 Alcohol This Week
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setForm(f => ({ ...f, alcohol: false }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !form.alcohol
                    ? 'bg-green-900/40 text-green-300 border border-green-600'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                No
              </button>
              <button
                onClick={() => setForm(f => ({ ...f, alcohol: true }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.alcohol
                    ? 'bg-amber-900/40 text-amber-300 border border-amber-600'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                Yes
              </button>
            </div>
          </div>

          {/* Week Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              📝 Week Notes
            </label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="How did the week go? What stood out?"
              rows="3"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Next Week Plan */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              🎯 Plan for Next Week
            </label>
            <textarea
              value={form.nextWeekPlan}
              onChange={e => setForm(f => ({ ...f, nextWeekPlan: e.target.value }))}
              placeholder="What are your goals and focus areas for next week?"
              rows="3"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-blue-500 transition-colors"
          >
            Save Review
          </button>
        </div>
      </Section>

      {/* Quick Stats */}
      <Section title="Quick Stats" emoji="🎯" defaultOpen={false}>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
            <span className="text-slate-300">Medications & Supplements</span>
            <span className="font-medium text-white">{healthPlan.medications.length + healthPlan.supplements.length} total</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
            <span className="text-slate-300">Daily Habits Tracked</span>
            <span className="font-medium text-white">~7-8</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
            <span className="text-slate-300">Weight Goal</span>
            <span className="font-medium text-green-400">{healthPlan.weightGoals.target} lbs</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
            <span className="text-slate-300">Sleep Goal</span>
            <span className="font-medium text-blue-400">{healthPlan.sleepGoals.hours}+ hours</span>
          </div>
        </div>
      </Section>
    </div>
  );
}
