import { useState, useRef, useEffect } from 'react';
import { exercisePlan } from '../data/exercisePlan';

export default function Training({ data, toggleDayCompletion, getWeekKey, saveWeekNotes, addSwimEntry }) {
  const [view, setView] = useState('week'); // 'week' | 'workouts' | 'cardio' | 'swimming'
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
  const currentWeekNotes = data?.weekNotes?.[currentWeekKey] || {};

  // Week notes with debounced save
  const [localNotes, setLocalNotes] = useState(currentWeekNotes.notes || '');
  const [localHighlights, setLocalHighlights] = useState(currentWeekNotes.highlights || '');
  const notesTimerRef = useRef(null);

  useEffect(() => {
    setLocalNotes(currentWeekNotes.notes || '');
    setLocalHighlights(currentWeekNotes.highlights || '');
  }, [currentWeekKey, currentWeekNotes.notes, currentWeekNotes.highlights]);

  const handleNotesChange = (field, value) => {
    if (field === 'notes') setLocalNotes(value);
    else setLocalHighlights(value);
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(() => {
      saveWeekNotes(currentWeekKey, { [field]: value });
    }, 800);
  };

  // Swimming log modal
  const [showSwimModal, setShowSwimModal] = useState(false);
  const [swimForm, setSwimForm] = useState({
    date: new Date().toISOString().split('T')[0],
    laps: '', distance: '', duration: '', notes: '',
  });

  const submitSwim = (e) => {
    e.preventDefault();
    if (!swimForm.laps && !swimForm.distance) return;
    addSwimEntry({
      ...swimForm,
      laps: swimForm.laps ? parseInt(swimForm.laps) : null,
      distance: swimForm.distance ? parseInt(swimForm.distance) : null,
      duration: swimForm.duration ? parseInt(swimForm.duration) : null,
    });
    setSwimForm({ date: new Date().toISOString().split('T')[0], laps: '', distance: '', duration: '', notes: '' });
    setShowSwimModal(false);
  };

  const daysCompletedThisWeek = Object.values(currentCompletions).filter(Boolean).length;
  const recentSwims = (data?.swimmingLog || []).slice(0, 10);
  const totalLapsAllTime = (data?.swimmingLog || []).reduce((sum, s) => sum + (s.laps || 0), 0);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-white">Training</h1>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1 overflow-x-auto">
        {[
          { id: 'week', label: 'This Week' },
          { id: 'workouts', label: 'Workouts' },
          { id: 'cardio', label: 'Cardio' },
          { id: 'swimming', label: '🏊 Swim' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
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

          {/* Weekly summary with celebration */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
            <div className="text-lg font-bold text-white">
              {daysCompletedThisWeek === 7 ? '🎉 ' : ''}{daysCompletedThisWeek} / 7 days completed
              {daysCompletedThisWeek === 7 && ' — Perfect week!'}
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 mt-2">
              <div
                className={`rounded-full h-3 transition-all ${daysCompletedThisWeek === 7 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-green-500'}`}
                style={{ width: `${(daysCompletedThisWeek / 7) * 100}%` }}
              />
            </div>
            {daysCompletedThisWeek >= 5 && daysCompletedThisWeek < 7 && (
              <p className="text-xs text-green-400 mt-2">Almost there! {7 - daysCompletedThisWeek} more to go!</p>
            )}
          </div>

          {/* Week Notes & Highlights (mikeandadam style) */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-3">📝 Week Notes</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Highlights / wins this week</label>
                <textarea
                  value={localHighlights}
                  onChange={e => handleNotesChange('highlights', e.target.value)}
                  placeholder="What went well? Any PRs, breakthroughs, or good moments?"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Notes / adjustments</label>
                <textarea
                  value={localNotes}
                  onChange={e => handleNotesChange('notes', e.target.value)}
                  placeholder="How did you feel? Anything to change next week?"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 resize-none"
                  rows={2}
                />
              </div>
            </div>
            {currentWeekNotes.updatedAt && (
              <p className="text-xs text-slate-600 mt-2">Last saved {new Date(currentWeekNotes.updatedAt).toLocaleString()}</p>
            )}
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
                    <div className="text-xs text-slate-400">{event.location} · {daysUntil} days ({weeksUntil} weeks) away</div>
                  </div>
                </div>
              );
            })}
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
        </div>
      )}

      {view === 'swimming' && (
        <div className="space-y-4">
          {/* Swimming overview */}
          <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-700/50 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-2">🏊 Swimming</h3>
            <p className="text-sm text-slate-300 mb-3">{exercisePlan.swimming.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-cyan-400">{totalLapsAllTime.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Total laps logged</div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-cyan-400">{recentSwims.length}</div>
                <div className="text-xs text-slate-400">Sessions logged</div>
              </div>
            </div>
          </div>

          {/* Log swim */}
          <button onClick={() => setShowSwimModal(true)}
            className="w-full bg-cyan-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-cyan-500 transition-colors">
            + Log Swim Session
          </button>

          {/* Swim workouts */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-3">Swim Workouts</h3>
            <div className="space-y-2">
              {exercisePlan.swimming.workouts.map(w => (
                <div key={w.name} className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm text-white">{w.name}</span>
                    <span className="text-xs text-cyan-400 bg-cyan-900/40 px-2 py-1 rounded-full">{w.duration}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{w.description}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="text-xs text-slate-400"><strong className="text-slate-300">Weekly goal:</strong> {exercisePlan.swimming.weeklyGoal}</div>
              <div className="text-xs text-slate-500 mt-1">{exercisePlan.swimming.notes}</div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-2">Why Swimming?</h3>
            <div className="flex flex-wrap gap-2">
              {exercisePlan.swimming.benefits.map(b => (
                <span key={b} className="bg-cyan-900/30 text-cyan-300 px-3 py-1 rounded-full text-xs">{b}</span>
              ))}
            </div>
          </div>

          {/* Recent swims */}
          {recentSwims.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h3 className="font-semibold text-white mb-3">Recent Swims</h3>
              <div className="space-y-2">
                {recentSwims.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg text-sm">
                    <div>
                      <div className="font-medium text-white">{s.laps ? `${s.laps} laps` : `${s.distance}m`}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {s.duration && ` · ${s.duration} min`}
                      </div>
                    </div>
                    {s.notes && <div className="text-xs text-slate-500 text-right max-w-[120px] truncate">{s.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Swim Log Modal */}
      {showSwimModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSwimModal(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">🏊 Log Swim Session</h3>
            <form onSubmit={submitSwim} className="space-y-3">
              <input type="date" value={swimForm.date} onChange={e => setSwimForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
              <input type="number" placeholder="Laps" value={swimForm.laps}
                onChange={e => setSwimForm(f => ({ ...f, laps: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <input type="number" placeholder="Distance (meters, optional)" value={swimForm.distance}
                onChange={e => setSwimForm(f => ({ ...f, distance: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <input type="number" placeholder="Duration (minutes, optional)" value={swimForm.duration}
                onChange={e => setSwimForm(f => ({ ...f, duration: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <input type="text" placeholder="Notes (optional)" value={swimForm.notes}
                onChange={e => setSwimForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowSwimModal(false)} className="flex-1 py-2 border border-slate-600 rounded-lg text-sm text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
