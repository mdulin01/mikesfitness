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
      <h1 className="text-2xl font-bold text-gray-900">Training</h1>

      {/* Tab bar */}
      <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'week', label: 'This Week' },
          { id: 'workouts', label: 'Workouts' },
          { id: 'cardio', label: 'Cardio' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              view === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
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
            <button onClick={() => setWeekOffset(o => o - 1)} className="p-2 text-gray-500 hover:text-gray-700">← Prev</button>
            <div className="text-sm font-medium text-gray-700">
              {currentWeekKey} {weekOffset === 0 && <span className="text-blue-600">(current)</span>}
            </div>
            <button onClick={() => setWeekOffset(o => o + 1)} className="p-2 text-gray-500 hover:text-gray-700">Next →</button>
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
                    done ? 'bg-green-50 border border-green-200' :
                    isToday ? 'bg-blue-50 border border-blue-300' :
                    'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    done ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}>
                    {done ? <span className="text-white text-sm">✓</span> : <span className="text-xl">{day.emoji}</span>}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{day.day}</div>
                    <div className="text-sm text-gray-500">{day.exercise}</div>
                  </div>
                  {isToday && <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Today</span>}
                </button>
              );
            })}
          </div>

          {/* Weekly summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-lg font-bold text-gray-900">
              {Object.values(currentCompletions).filter(Boolean).length} / 7 days completed
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 rounded-full h-2 transition-all"
                style={{ width: `${(Object.values(currentCompletions).filter(Boolean).length / 7) * 100}%` }}
              />
            </div>
          </div>

          {/* Targets */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-2">Daily Targets</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">👟 Steps</div>
                <div className="text-gray-500">{exercisePlan.dailyTargets.steps.toLocaleString()}/day</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">🧘 Mobility</div>
                <div className="text-gray-500">{exercisePlan.dailyTargets.mobility}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">⏱️ Total Weekly</div>
                <div className="text-gray-500">{exercisePlan.totalHoursPerWeek} hrs/week</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">🚶 Walking</div>
                <div className="text-gray-500">After dinner</div>
              </div>
            </div>
          </div>
        </>
      )}

      {view === 'workouts' && (
        <div className="space-y-4">
          {[exercisePlan.workoutA, exercisePlan.workoutB].map(workout => (
            <div key={workout.name} className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-1">{workout.name}</h3>
              <p className="text-xs text-gray-500 mb-3">Alternate A and B on strength days. If it feels easy, it's not doing much.</p>
              <div className="space-y-2">
                {workout.exercises.map(ex => (
                  <div key={ex.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-sm text-gray-900">{ex.name}</span>
                    <span className="text-sm text-gray-500">{ex.sets} × {ex.reps}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Key rule */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="font-medium text-amber-800 text-sm">💡 Key Rule</div>
            <p className="text-sm text-amber-700 mt-1">Focus on big muscle groups. This is anti-aging medicine. You want moderately heavy — if it feels easy, it's not doing much.</p>
          </div>
        </div>
      )}

      {view === 'cardio' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-1">Zone 2 Cardio (2x/week)</h3>
            <p className="text-sm text-gray-500 mb-3">{exercisePlan.cardioZone2.description}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="text-sm font-medium text-blue-800">How to know you're in Zone 2:</div>
              <div className="text-sm text-blue-700">{exercisePlan.cardioZone2.howToKnow}</div>
            </div>
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-1">Examples:</div>
              <div className="flex flex-wrap gap-2">
                {exercisePlan.cardioZone2.examples.map(ex => (
                  <span key={ex} className="bg-gray-100 px-3 py-1 rounded-full text-xs">{ex}</span>
                ))}
              </div>
              <div className="mt-2 text-gray-500">Duration: {exercisePlan.cardioZone2.duration}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-1">VO2 Max Intervals (1x/week)</h3>
            <p className="text-sm text-gray-500 mb-3">This keeps you from becoming the person who gets winded.</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Warm up</span><span className="text-gray-500">{exercisePlan.vo2MaxIntervals.warmup}</span>
              </div>
              <div className="flex justify-between p-2 bg-orange-50 rounded">
                <span className="font-medium">Intervals</span><span className="text-gray-500">{exercisePlan.vo2MaxIntervals.intervals}</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Cool down</span><span className="text-gray-500">{exercisePlan.vo2MaxIntervals.cooldown}</span>
              </div>
            </div>
          </div>

          {/* Race training */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Race Training</h3>
            {(data?.trainingEvents || []).map(event => {
              const daysUntil = Math.ceil((new Date(event.date) - new Date()) / 86400000);
              const weeksUntil = Math.ceil(daysUntil / 7);
              return (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg mb-2" style={{ background: event.color + '10' }}>
                  <span className="text-2xl">{event.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium">{event.name}</div>
                    <div className="text-xs text-gray-500">{daysUntil} days ({weeksUntil} weeks) away</div>
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
