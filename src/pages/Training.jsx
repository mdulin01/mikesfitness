import { useState } from 'react';
import { exercisePlan } from '../data/exercisePlan';

export default function Training({ data, toggleDayCompletion, getWeekKey }) {
  const [view, setView] = useState('week'); // 'week' | 'workouts' | 'cardio'
  const weekKey = getWeekKey();
  const completions = data?.weeklyCompletions?.[weekKey] || {};
  const todayDow = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  // Navigate weeks
  const [weekOffset, setWeekOffset] = useState(0);
  const getOffsetWeekKey = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset * 7);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d - jan1) / 86400000);
    const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  };
  const currentWeekKey = getOffsetWeekKey(weekOffset);
  const currentCompletions = data?.weeklyCompletions?.[currentWeekKey] || {};

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-white">Training</h1>

      {/* Tab bar */}
      <div className="flex gap-2 bg-slate-700/50 rounded-lg p-1">
        {[
          { id: 'week', label: 'This Week' },
          { id: 'workouts', label: 'Workouts' },
          { id: 'cardio', label: 'Cardio' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              view === tab.id ? 'bg-slate-600 text-blue-400 shadow-sm' : 'text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'week' && (
        <>
          {/* Week navigator */}
          <div className="flex items-center justify-between">
            <button onClick={() => setWeekOffset(o => o - 1)} className="p-2 text-slate-400 hover:text-slate-200">← Prev</button>
            <div className="text-sm font-medium text-slate-300">
              {currentWeekKey} {weekOffset === 0 && <span className="text-blue-400">(current)</span>}
            </div>
            <button onClick={() => setWeekOffset(o => o + 1)} className="p-2 text-slate-400 hover:text-slate-200">Next →</button>
          </div>

          {/* Weekly schedule with checkoffs */}
          <div className="space-y-2">
            {exercisePlan.weeklySchedule.map(day => {
              const key = day.day.toLowerCase();
              const done = currentCompletions[key];
              const isToday = key === todayDow && weekOffset === 0;
              return (
                <button
                  key={key}
                  onClick={() => toggleDayCompletion(key, currentWeekKey)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                    done ? 'bg-green-900/30 border border-green-700' :
                    isToday ? 'bg-blue-900/30 border border-blue-700' :
                    'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    done ? 'border-green-500 bg-green-500' : 'border-slate-500'
                  }`}>
                    {done ? <span className="text-white text-sm">✓</span> : <span className="text-xl">{day.emoji}</span>}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white">{day.day}</div>
                    <div className="text-sm text-slate-400">{day.exercise}</div>
                  </div>
                  {isToday && <span className="text-xs font-medium text-blue-400 bg-blue-900/50 px-2 py-1 rounded-full">Today</span>}
                </button>
              );
            })}
          </div>

          {/* Weekly summary */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
            <div className="text-lg font-bold text-white">
              {Object.values(currentCompletions).filter(Boolean).length} / 7 days completed
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 rounded-full h-2 transition-all"
                style={{ width: `${(Object.values(currentCompletions).filter(Boolean).length / 7) * 100}%` }}
              />
            </div>
          </div>

          {/* Targets */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-2">Daily Targets</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <div className="font-medium text-white">👟 Steps</div>
                <div className="text-slate-400">{exercisePlan.dailyTargets.steps.toLocaleString()}/day</div>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <div className="font-medium text-white">🧘 Mobility</div>
                <div className="text-slate-400">{exercisePlan.dailyTargets.mobility}</div>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <div className="font-medium text-white">⏱️ Total Weekly</div>
                <div className="text-slate-400">{exercisePlan.totalHoursPerWeek} hrs/week</div>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <div className="font-medium text-white">🚶 Walking</div>
                <div className="text-slate-400">After dinner</div>
              </div>
            </div>
          </div>
        </>
      )}

      {view === 'workouts' && (
        <div className="space-y-4">
          {[exercisePlan.workoutA, exercisePlan.workoutB].map(workout => (
            <div key={workout.name} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h3 className="font-semibold text-white mb-1">{workout.name}</h3>
              <p className="text-xs text-slate-400 mb-3">Alternate A and B on strength days. If it feels easy, it's not doing much.</p>
              <div className="space-y-2">
                {workout.exercises.map(ex => (
                  <div key={ex.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="font-medium text-sm text-white">{ex.name}</span>
                    <span className="text-sm text-slate-400">{ex.sets} × {ex.reps}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Key rule */}
          <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-4">
            <div className="font-medium text-amber-400 text-sm">💡 Key Rule</div>
            <p className="text-sm text-amber-300 mt-1">Focus on big muscle groups. This is anti-aging medicine. You want moderately heavy — if it feels easy, it's not doing much.</p>
          </div>
        </div>
      )}

      {view === 'cardio' && (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-1">Zone 2 Cardio (2x/week)</h3>
            <p className="text-sm text-slate-400 mb-3">{exercisePlan.cardioZone2.description}</p>
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-3">
              <div className="text-sm font-medium text-blue-400">How to know you're in Zone 2:</div>
              <div className="text-sm text-blue-300">{exercisePlan.cardioZone2.howToKnow}</div>
            </div>
            <div className="text-sm text-slate-300">
              <div className="font-medium mb-1">Examples:</div>
              <div className="flex flex-wrap gap-2">
                {exercisePlan.cardioZone2.examples.map(ex => (
                  <span key={ex} className="bg-slate-700 px-3 py-1 rounded-full text-xs text-slate-300">{ex}</span>
                ))}
              </div>
              <div className="mt-2 text-slate-400">Duration: {exercisePlan.cardioZone2.duration}</div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-1">VO2 Max Intervals (1x/week)</h3>
            <p className="text-sm text-slate-400 mb-3">This keeps you from becoming the person who gets winded.</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                <span className="text-slate-300">Warm up</span><span className="text-slate-400">{exercisePlan.vo2MaxIntervals.warmup}</span>
              </div>
              <div className="flex justify-between p-2 bg-orange-900/30 rounded">
                <span className="font-medium text-orange-300">Intervals</span><span className="text-slate-400">{exercisePlan.vo2MaxIntervals.intervals}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-700/50 rounded">
                <span className="text-slate-300">Cool down</span><span className="text-slate-400">{exercisePlan.vo2MaxIntervals.cooldown}</span>
              </div>
            </div>
          </div>

          {/* Race training */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-3">Race Training</h3>
            {(data?.trainingEvents || []).map(event => {
              const daysUntil = Math.ceil((new Date(event.date) - new Date()) / 86400000);
              const weeksUntil = Math.ceil(daysUntil / 7);
              return (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg mb-2" style={{ background: event.color + '20' }}>
                  <span className="text-2xl">{event.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium text-white">{event.name}</div>
                    <div className="text-xs text-slate-400">{daysUntil} days ({weeksUntil} weeks) away</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
