import { exercisePlan } from '../data/exercisePlan';
import { healthPlan } from '../data/healthPlan';
import { APPOINTMENT_TYPES } from '../constants';

const today = () => new Date().toISOString().split('T')[0];
const dayOfWeek = () => new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

export default function Dashboard({ data, toggleDayCompletion, getWeekKey, toggleDailyItem, setActiveSection }) {
  const weekKey = getWeekKey();
  const completions = data?.weeklyCompletions?.[weekKey] || {};
  const dailyChecks = data?.dailyChecklist?.[today()] || {};
  const todayStr = today();
  const daysCompleted = Object.values(completions).filter(Boolean).length;
  const todayDow = dayOfWeek();
  const todayPlan = exercisePlan.weeklySchedule.find(d => d.day.toLowerCase() === todayDow);

  const upcomingAppts = (data?.appointments || [])
    .filter(a => a.date && a.date >= todayStr && a.status === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const needsScheduling = (data?.appointments || []).filter(a => a.status === 'needs-scheduling');
  const latestWeight = (data?.weightEntries || [])[0];

  const dailyItems = [
    { key: 'workout', label: todayPlan ? `${todayPlan.emoji} ${todayPlan.exercise}` : 'Rest day' },
    { key: 'steps', label: '👟 10,000 steps' },
    { key: 'mobility', label: '🧘 10 min mobility' },
    { key: 'water', label: '💧 3L water' },
    { key: 'sleep', label: '😴 7+ hours sleep' },
  ];

  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const daysUntil = (d) => Math.ceil((new Date(d) - new Date(todayStr)) / 86400000);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, Mike
        </h1>
        <p className="text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Today's Checklist */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-white mb-3">Today's Checklist</h2>
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
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{daysCompleted}/7</div>
          <div className="text-xs text-slate-500 mt-1">Workouts This Week</div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{latestWeight ? latestWeight.weight : '—'}</div>
          <div className="text-xs text-slate-500 mt-1">Current Weight{latestWeight ? ` (${formatDate(latestWeight.date)})` : ''}</div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{healthPlan.weightGoals.target}</div>
          <div className="text-xs text-slate-500 mt-1">Target Weight</div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {Object.values(dailyChecks).filter(Boolean).length}/{dailyItems.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Today's Items Done</div>
        </div>
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
                <div className="text-xs text-amber-500 mt-1">
                  {needsScheduling.map(a => APPOINTMENT_TYPES.find(t => t.id === a.type)?.label).join(', ')}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Training Events */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-white mb-3">Race Calendar</h2>
        <div className="space-y-2">
          {(data?.trainingEvents || []).map(event => (
            <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: event.color + '20', borderLeft: `3px solid ${event.color}` }}>
              <span className="text-2xl">{event.emoji}</span>
              <div className="flex-1">
                <div className="font-medium text-white">{event.name}</div>
                <div className="text-xs text-slate-400">{event.location} · {formatDate(event.date)} · {daysUntil(event.date)} days away</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
