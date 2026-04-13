import { useState, useRef, useEffect, useMemo } from 'react';
import { exercisePlan } from '../data/exercisePlan';
import { healthPlan } from '../data/healthPlan';
import { ALL_EVENT_TYPES, FITNESS_EVENT_TYPES } from '../constants';
import { toLocalDateStr } from '../utils/dateUtils';

const ACTIVITY_TYPES = [
  { id: 'weights', label: 'Weights', emoji: '🏋️' },
  { id: 'run', label: 'Run', emoji: '🏃' },
  { id: 'walk', label: 'Walk', emoji: '🚶' },
  { id: 'bike', label: 'Bike', emoji: '🚴' },
  { id: 'swim', label: 'Swim', emoji: '🏊' },
  { id: 'yoga', label: 'Yoga / Mobility', emoji: '🧘' },
  { id: 'hiit', label: 'HIIT / Intervals', emoji: '⚡' },
  { id: 'other', label: 'Other', emoji: '💪' },
];

// All exercises from workouts A & B plus common extras
const ALL_EXERCISES = [
  ...exercisePlan.workoutA.exercises.map(e => ({ ...e, source: 'A' })),
  ...exercisePlan.workoutB.exercises.map(e => ({ ...e, source: 'B' })),
  { id: 'curl', name: 'Bicep Curl', sets: 3, reps: '10', source: 'extra' },
  { id: 'tricep', name: 'Tricep Extension', sets: 3, reps: '10', source: 'extra' },
  { id: 'calf', name: 'Calf Raise', sets: 3, reps: '15', source: 'extra' },
  { id: 'leg-press', name: 'Leg Press', sets: 3, reps: '10', source: 'extra' },
  { id: 'chest-fly', name: 'Chest Fly', sets: 3, reps: '10', source: 'extra' },
  { id: 'face-pull', name: 'Face Pull', sets: 3, reps: '12', source: 'extra' },
  { id: 'farmers-carry', name: "Farmer's Carry", sets: 3, reps: '40 yards', source: 'extra' },
  { id: 'custom', name: 'Custom Exercise', sets: 3, reps: '10', source: 'extra' },
];

export default function Training({ data, toggleDayCompletion, getWeekKey, saveWeekNotes, addSwimEntry, saveWorkoutDetail, addAppointment, saveExerciseLog, saveStepsEntry, ...rest }) {
  const [view, setView] = useState('week');
  const [stepsInput, setStepsInput] = useState('');
  const weekKey = getWeekKey();
  const completions = data?.weeklyCompletions?.[weekKey] || {};
  const todayDow = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayStr = toLocalDateStr();
  const todaySteps = data?.stepsLog?.[toLocalDateStr()]?.steps;

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
  const currentWorkoutDetails = data?.workoutDetails?.[currentWeekKey] || {};

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

  // Expanded day for details
  const [expandedDay, setExpandedDay] = useState(null);
  const [activityForm, setActivityForm] = useState({ type: 'weights', distance: '', duration: '', notes: '' });
  const [effortRatingDayKey, setEffortRatingDayKey] = useState(null);
  const [recentActivityId, setRecentActivityId] = useState(null);

  const addActivity = (dayKey) => {
    if (!activityForm.type) return;
    const existing = currentWorkoutDetails[dayKey] || [];
    const activityId = Date.now();
    const updated = [...existing, {
      ...activityForm,
      id: activityId,
      distance: activityForm.distance || null,
      duration: activityForm.duration || null,
      effort: null, // Will be set via effort rating
    }];
    saveWorkoutDetail(currentWeekKey, dayKey, updated);
    setRecentActivityId(activityId);
    setEffortRatingDayKey(dayKey);
    setActivityForm({ type: 'weights', distance: '', duration: '', notes: '' });
  };

  const setActivityEffort = (dayKey, activityId, effort) => {
    const existing = currentWorkoutDetails[dayKey] || [];
    const updated = existing.map(a =>
      a.id === activityId ? { ...a, effort } : a
    );
    saveWorkoutDetail(currentWeekKey, dayKey, updated);
    setEffortRatingDayKey(null);
    setRecentActivityId(null);
  };

  const removeActivity = (dayKey, actId) => {
    const existing = currentWorkoutDetails[dayKey] || [];
    saveWorkoutDetail(currentWeekKey, dayKey, existing.filter(a => a.id !== actId));
  };

  // ========== LIFT LOG STATE ==========
  const [liftDate, setLiftDate] = useState(todayStr);
  const liftLog = data?.exerciseLog?.[liftDate] || [];
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');

  const addExerciseToLog = (exercise) => {
    const updated = [...liftLog, {
      id: Date.now(),
      exerciseId: exercise.id,
      exerciseName: exercise.id === 'custom' ? customExerciseName : exercise.name,
      targetSets: exercise.sets,
      targetReps: exercise.reps,
      sets: [{ weight: '', reps: '', id: Date.now() + 1 }],
      notes: '',
    }];
    saveExerciseLog(liftDate, updated);
    setShowExercisePicker(false);
    setCustomExerciseName('');
  };

  const updateSet = (exerciseIdx, setIdx, field, value) => {
    const updated = [...liftLog];
    updated[exerciseIdx] = { ...updated[exerciseIdx], sets: [...updated[exerciseIdx].sets] };
    updated[exerciseIdx].sets[setIdx] = { ...updated[exerciseIdx].sets[setIdx], [field]: value };
    saveExerciseLog(liftDate, updated);
  };

  const addSet = (exerciseIdx) => {
    const updated = [...liftLog];
    const lastSet = updated[exerciseIdx].sets[updated[exerciseIdx].sets.length - 1];
    updated[exerciseIdx] = {
      ...updated[exerciseIdx],
      sets: [...updated[exerciseIdx].sets, { weight: lastSet?.weight || '', reps: lastSet?.reps || '', id: Date.now() }],
    };
    saveExerciseLog(liftDate, updated);
  };

  const removeSet = (exerciseIdx, setIdx) => {
    const updated = [...liftLog];
    updated[exerciseIdx] = {
      ...updated[exerciseIdx],
      sets: updated[exerciseIdx].sets.filter((_, i) => i !== setIdx),
    };
    saveExerciseLog(liftDate, updated);
  };

  const removeExercise = (exerciseIdx) => {
    saveExerciseLog(liftDate, liftLog.filter((_, i) => i !== exerciseIdx));
  };

  const updateExerciseNotes = (exerciseIdx, notes) => {
    const updated = [...liftLog];
    updated[exerciseIdx] = { ...updated[exerciseIdx], notes };
    saveExerciseLog(liftDate, updated);
  };

  // Get last logged weight for an exercise for reference
  const getLastWeight = (exerciseId) => {
    const log = data?.exerciseLog || {};
    const dates = Object.keys(log).filter(d => d < liftDate).sort().reverse();
    for (const d of dates) {
      const entry = log[d]?.find(e => e.exerciseId === exerciseId);
      if (entry?.sets?.length > 0) {
        const lastSet = entry.sets.find(s => s.weight);
        if (lastSet) return lastSet.weight;
      }
    }
    return null;
  };

  // Swimming log modal
  const [showSwimModal, setShowSwimModal] = useState(false);
  const [swimForm, setSwimForm] = useState({
    date: toLocalDateStr(),
    laps: '', distance: '', duration: '', notes: '',
  });

  const submitSwim = (e) => {
    e.preventDefault();
    if (!swimForm.laps && !swimForm.distance) {
      alert('Please enter laps or distance');
      return;
    }
    if (!swimForm.duration) {
      alert('Please enter duration');
      return;
    }
    addSwimEntry({
      ...swimForm,
      laps: swimForm.laps ? parseInt(swimForm.laps) : null,
      distance: swimForm.distance ? parseInt(swimForm.distance) : null,
      duration: swimForm.duration ? parseInt(swimForm.duration) : null,
    });
    setSwimForm({ date: toLocalDateStr(), laps: '', distance: '', duration: '', notes: '' });
    setShowSwimModal(false);
  };

  // Fitness event modal
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({ type: 'half-marathon', date: '', location: '', notes: '' });

  const submitFitnessEvent = (e) => {
    e.preventDefault();
    if (!eventForm.date || !eventForm.type) return;
    addAppointment({
      type: eventForm.type,
      category: 'fitness',
      doctor: '',
      date: eventForm.date,
      time: '',
      location: eventForm.location,
      notes: eventForm.notes,
      status: 'scheduled',
    });
    setEventForm({ type: 'half-marathon', date: '', location: '', notes: '' });
    setShowEventModal(false);
  };

  const daysCompletedThisWeek = Object.values(currentCompletions).filter(Boolean).length;
  const recentSwims = (data?.swimmingLog || []).slice(0, 10);
  const totalLapsAllTime = (data?.swimmingLog || []).reduce((sum, s) => sum + (s.laps || 0), 0);

  // Fitness events from shared appointments data
  const fitnessEvents = (data?.appointments || [])
    .filter(a => a.category === 'fitness' && a.date && a.status === 'scheduled' && a.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Navigate lift log dates
  const changeLiftDate = (offset) => {
    const d = new Date(liftDate + 'T12:00:00');
    d.setDate(d.getDate() + offset);
    setLiftDate(toLocalDateStr(d));
  };
  const liftDateIsToday = liftDate === todayStr;
  const formatDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Compute weekly totals
  const weeklyTotals = useMemo(() => {
    let cardioMinutes = 0;
    let zone2Minutes = 0;
    let intervalsCount = 0;
    let strengthDays = 0;
    let swimYards = 0;

    exercisePlan.weeklySchedule.forEach(day => {
      const dayKey = day.day.toLowerCase();
      const activities = currentWorkoutDetails[dayKey] || [];

      // Count strength days
      if (day.type === 'strength' && activities.length > 0) {
        strengthDays += 1;
      }

      activities.forEach(a => {
        // Cardio minutes: run, walk, bike, swim
        if (['run', 'walk', 'bike', 'swim'].includes(a.type) && a.duration) {
          cardioMinutes += parseInt(a.duration) || 0;
        }
        // Intervals
        if (a.type === 'hiit' && a.duration) {
          intervalsCount += 1;
        }
        // Swim yards
        if (a.type === 'swim' && a.distance) {
          swimYards += parseInt(a.distance) || 0;
        }
      });
    });

    return {
      cardioMinutes,
      zone2Minutes,
      intervalsCount,
      strengthDays,
      swimYards,
    };
  }, [currentWorkoutDetails]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-white">Training</h1>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1 overflow-x-auto">
        {[
          { id: 'week', label: 'This Week' },
          { id: 'lift', label: '🏋️ Lift Log' },
          { id: 'workouts', label: 'Workouts' },
          { id: 'cardio', label: 'Cardio' },
          { id: 'swimming', label: '🏊 Swim' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              view === tab.id ? 'bg-slate-600 text-blue-400 shadow-sm' : 'text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======== THIS WEEK TAB ======== */}
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

          {/* Weekly Totals Summary */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Weekly Totals</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Cardio Minutes</div>
                <div className="text-lg font-bold text-white">{weeklyTotals.cardioMinutes}</div>
                <div className="text-xs text-slate-500">Target: {healthPlan.exerciseTargets.cardioMinutes}</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Zone 2</div>
                <div className="text-lg font-bold text-white mb-2">
                  <input
                    type="number"
                    placeholder="0"
                    value={data?.weeklyZone2?.[currentWeekKey] || ''}
                    onChange={e => {
                      const zone2 = { ...(data?.weeklyZone2 || {}) };
                      zone2[currentWeekKey] = parseInt(e.target.value) || 0;
                      rest.save?.({ weeklyZone2: zone2 });
                    }}
                    className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white text-center"
                  />
                  <span className="ml-1">min</span>
                </div>
                <div className="text-xs text-slate-500">Target: {healthPlan.exerciseTargets.zone2Minutes}</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Intervals</div>
                <div className="text-lg font-bold text-white">{weeklyTotals.intervalsCount}</div>
                <div className="text-xs text-slate-500">Sessions</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Strength Sessions</div>
                <div className="text-lg font-bold text-white">{weeklyTotals.strengthDays}</div>
                <div className="text-xs text-slate-500">Target: {healthPlan.exerciseTargets.strengthDays}</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Steps</div>
                <div className="text-lg font-bold text-white">{todaySteps ? todaySteps.toLocaleString() : '—'}</div>
                <div className="flex gap-1 mt-1">
                  <input type="number" placeholder="Steps" value={stepsInput} onChange={e => setStepsInput(e.target.value)}
                    className="w-20 bg-slate-600 border border-slate-500 rounded px-1 py-0.5 text-white text-xs" />
                  <button onClick={() => { if(stepsInput) { saveStepsEntry(toLocalDateStr(), stepsInput); setStepsInput(''); }}}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded">+</button>
                </div>
                <div className="text-xs text-slate-500">Target: 10,000</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Swim Yards</div>
                <div className="text-lg font-bold text-white">{weeklyTotals.swimYards}</div>
                <div className="text-xs text-slate-500">Distance</div>
              </div>
            </div>
          </div>

          {/* Weekly schedule with expandable details */}
          <div className="space-y-2">
            {exercisePlan.weeklySchedule.map(day => {
              const key = day.day.toLowerCase();
              const done = currentCompletions[key];
              const isToday = key === todayDow && weekOffset === 0;
              const isExpanded = expandedDay === key;
              const dayActivities = currentWorkoutDetails[key] || [];

              return (
                <div key={key} className={`rounded-xl overflow-hidden transition-all ${
                  done ? 'bg-green-900/30 border border-green-700' :
                  isToday ? 'bg-blue-900/30 border border-blue-700' :
                  'bg-slate-800 border border-slate-700'
                }`}>
                  <div className="flex items-center gap-4 p-4">
                    <button onClick={() => toggleDayCompletion(key, currentWeekKey)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        done ? 'border-green-500 bg-green-500' : 'border-slate-500'
                      }`}>
                      {done ? <span className="text-white text-sm">✓</span> : <span className="text-xl">{day.emoji}</span>}
                    </button>
                    <button onClick={() => setExpandedDay(isExpanded ? null : key)} className="flex-1 text-left">
                      <div className="font-medium text-white">{day.day}</div>
                      <div className="text-sm text-slate-400">{day.exercise}</div>
                      {dayActivities.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {dayActivities.map(a => {
                            const at = ACTIVITY_TYPES.find(t => t.id === a.type);
                            const effortEmoji = a.effort === 'easy' ? '😊' : a.effort === 'moderate' ? '💪' : a.effort === 'hard' ? '🔥' : '';
                            return <span key={a.id} className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{at?.emoji} {a.duration ? `${a.duration}min` : ''}{a.distance ? ` ${a.distance}mi` : ''} {effortEmoji}</span>;
                          })}
                        </div>
                      )}
                    </button>
                    <div className="flex items-center gap-2">
                      {isToday && <span className="text-xs font-medium text-blue-400 bg-blue-900/50 px-2 py-1 rounded-full">Today</span>}
                      <button onClick={() => setExpandedDay(isExpanded ? null : key)}
                        className="text-slate-500 text-xs p-1">{isExpanded ? '▲' : '▼'}</button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-700/50 pt-3 space-y-3">
                      {dayActivities.length > 0 && (
                        <div className="space-y-1">
                          {dayActivities.map(a => {
                            const at = ACTIVITY_TYPES.find(t => t.id === a.type);
                            const effortEmoji = a.effort === 'easy' ? '😊' : a.effort === 'moderate' ? '💪' : a.effort === 'hard' ? '🔥' : '';
                            return (
                              <div key={a.id} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg text-sm">
                                <span>{at?.emoji}</span>
                                <span className="font-medium text-white">{at?.label}</span>
                                {a.distance && <span className="text-slate-400">{a.distance} mi</span>}
                                {a.duration && <span className="text-slate-400">{a.duration} min</span>}
                                {effortEmoji && <span className="text-lg">{effortEmoji}</span>}
                                {a.notes && <span className="text-slate-500 truncate flex-1">{a.notes}</span>}
                                <button onClick={() => removeActivity(key, a.id)} className="text-slate-600 hover:text-red-400 text-xs ml-auto">×</button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div className="text-xs text-slate-400 font-medium">Add Activity</div>
                        <div className="flex flex-wrap gap-1">
                          {ACTIVITY_TYPES.map(at => (
                            <button key={at.id} onClick={() => setActivityForm(f => ({ ...f, type: at.id }))}
                              className={`text-xs px-2 py-1 rounded-full transition-colors ${
                                activityForm.type === at.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                              }`}>{at.emoji} {at.label}</button>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input type="text" placeholder="Distance (mi)" value={activityForm.distance}
                            onChange={e => setActivityForm(f => ({ ...f, distance: e.target.value }))}
                            className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-xs text-white placeholder-slate-500" />
                          <input type="text" placeholder="Duration (min)" value={activityForm.duration}
                            onChange={e => setActivityForm(f => ({ ...f, duration: e.target.value }))}
                            className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-xs text-white placeholder-slate-500" />
                          <input type="text" placeholder="Notes" value={activityForm.notes}
                            onChange={e => setActivityForm(f => ({ ...f, notes: e.target.value }))}
                            className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-xs text-white placeholder-slate-500" />
                        </div>
                        <button onClick={() => addActivity(key)}
                          className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-500">+ Add Activity</button>
                      </div>

                      {/* Effort rating for recently added activity */}
                      {effortRatingDayKey === key && recentActivityId && (
                        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 space-y-2">
                          <div className="text-xs font-medium text-blue-300">How much effort?</div>
                          <div className="flex gap-2">
                            <button onClick={() => setActivityEffort(key, recentActivityId, 'easy')}
                              className="flex-1 py-2 bg-green-600/40 border border-green-600 text-green-300 rounded-lg text-xs font-medium hover:bg-green-600/60">
                              Easy 😊
                            </button>
                            <button onClick={() => setActivityEffort(key, recentActivityId, 'moderate')}
                              className="flex-1 py-2 bg-yellow-600/40 border border-yellow-600 text-yellow-300 rounded-lg text-xs font-medium hover:bg-yellow-600/60">
                              Moderate 💪
                            </button>
                            <button onClick={() => setActivityEffort(key, recentActivityId, 'hard')}
                              className="flex-1 py-2 bg-red-600/40 border border-red-600 text-red-300 rounded-lg text-xs font-medium hover:bg-red-600/60">
                              Hard 🔥
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Quick link to lift log on strength days */}
                      {day.type === 'strength' && (
                        <button onClick={() => setView('lift')}
                          className="w-full py-2 bg-purple-600/30 border border-purple-700 text-purple-300 rounded-lg text-xs font-medium hover:bg-purple-600/50">
                          🏋️ Open Lift Log to track sets & weights →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Weekly summary */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
            <div className="text-lg font-bold text-white">
              {daysCompletedThisWeek === 7 ? '🎉 ' : ''}{daysCompletedThisWeek} / 7 days completed
              {daysCompletedThisWeek === 7 && ' — Perfect week!'}
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 mt-2">
              <div className={`rounded-full h-3 transition-all ${daysCompletedThisWeek === 7 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-green-500'}`}
                style={{ width: `${(daysCompletedThisWeek / 7) * 100}%` }} />
            </div>
          </div>

          {/* Week Notes */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-3">📝 Week Notes</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Highlights / wins</label>
                <textarea value={localHighlights} onChange={e => handleNotesChange('highlights', e.target.value)}
                  placeholder="What went well?"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 resize-none" rows={2} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Notes / adjustments</label>
                <textarea value={localNotes} onChange={e => handleNotesChange('notes', e.target.value)}
                  placeholder="How did you feel?"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 resize-none" rows={2} />
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
              <div className="p-3 bg-slate-700/50 rounded-lg"><div className="font-medium text-white">👟 Steps</div><div className="text-slate-400">{exercisePlan.dailyTargets.steps.toLocaleString()}/day</div></div>
              <div className="p-3 bg-slate-700/50 rounded-lg"><div className="font-medium text-white">🧘 Mobility</div><div className="text-slate-400">{exercisePlan.dailyTargets.mobility}</div></div>
              <div className="p-3 bg-slate-700/50 rounded-lg"><div className="font-medium text-white">⏱️ Total Weekly</div><div className="text-slate-400">{exercisePlan.totalHoursPerWeek} hrs/week</div></div>
              <div className="p-3 bg-slate-700/50 rounded-lg"><div className="font-medium text-white">🚶 Walking</div><div className="text-slate-400">After dinner</div></div>
            </div>
          </div>

          {/* Race Training */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Race Training</h3>
              <button onClick={() => setShowEventModal(true)} className="text-xs text-blue-400 hover:underline">+ Add Race</button>
            </div>
            {fitnessEvents.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming races.</p>
            ) : (
              fitnessEvents.map(event => {
                const type = ALL_EVENT_TYPES.find(t => t.id === event.type);
                const daysLeft = Math.ceil((new Date(event.date) - new Date()) / 86400000);
                const weeksLeft = Math.ceil(daysLeft / 7);
                const color = type?.color || '#3b82f6';
                return (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg mb-2" style={{ background: color + '20' }}>
                    <span className="text-2xl">{type?.emoji || '🏅'}</span>
                    <div className="flex-1">
                      <div className="font-medium text-white">{event.notes || type?.label || 'Event'}</div>
                      <div className="text-xs text-slate-400">{event.location} · {daysLeft} days ({weeksLeft} weeks) away</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ======== LIFT LOG TAB ======== */}
      {view === 'lift' && (
        <div className="space-y-4">
          {/* Date navigator */}
          <div className="flex items-center justify-between">
            <button onClick={() => changeLiftDate(-1)} className="p-2 text-slate-400 hover:text-slate-200">← Prev</button>
            <div className="text-sm font-medium text-slate-300">
              {formatDate(liftDate)} {liftDateIsToday && <span className="text-blue-400">(today)</span>}
            </div>
            <button onClick={() => changeLiftDate(1)} className="p-2 text-slate-400 hover:text-slate-200">Next →</button>
          </div>

          {/* Add exercise button */}
          <button onClick={() => setShowExercisePicker(true)}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-purple-500 transition-colors">
            + Add Exercise
          </button>

          {/* Exercise list */}
          {liftLog.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
              <div className="text-4xl mb-2">🏋️</div>
              <p className="text-slate-400">No exercises logged for this day.</p>
              <p className="text-xs text-slate-500 mt-1">Tap the button above to add exercises from Workout A, B, or extras.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liftLog.map((exercise, exIdx) => {
                const lastWeight = getLastWeight(exercise.exerciseId);
                return (
                  <div key={exercise.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    {/* Exercise header */}
                    <div className="p-4 flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-white">{exercise.exerciseName}</div>
                        <div className="text-xs text-slate-400">Target: {exercise.targetSets} × {exercise.targetReps}
                          {lastWeight && <span className="text-blue-400 ml-2">Last: {lastWeight} lbs</span>}
                        </div>
                      </div>
                      <button onClick={() => removeExercise(exIdx)} className="text-slate-600 hover:text-red-400 text-xs p-1">×</button>
                    </div>

                    {/* Sets table */}
                    <div className="px-4 pb-2">
                      <div className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 mb-1 text-xs text-slate-500 font-medium">
                        <div>Set</div>
                        <div>Weight (lbs)</div>
                        <div>Reps</div>
                        <div></div>
                      </div>
                      {exercise.sets.map((set, setIdx) => (
                        <div key={set.id} className="grid grid-cols-[40px_1fr_1fr_32px] gap-2 mb-1.5 items-center">
                          <div className="text-xs text-slate-400 text-center font-medium">{setIdx + 1}</div>
                          <input
                            type="number"
                            placeholder="—"
                            value={set.weight}
                            onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                            className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white text-center placeholder-slate-500"
                          />
                          <input
                            type="text"
                            placeholder="—"
                            value={set.reps}
                            onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                            className="bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white text-center placeholder-slate-500"
                          />
                          <button onClick={() => removeSet(exIdx, setIdx)}
                            className="text-slate-600 hover:text-red-400 text-xs text-center">×</button>
                        </div>
                      ))}
                    </div>

                    {/* Add set + notes */}
                    <div className="px-4 pb-3 flex gap-2">
                      <button onClick={() => addSet(exIdx)}
                        className="flex-1 py-1.5 border border-dashed border-slate-600 rounded-lg text-xs text-slate-400 hover:text-slate-200">
                        + Add Set
                      </button>
                    </div>

                    {/* Notes */}
                    <div className="px-4 pb-3">
                      <input
                        type="text"
                        placeholder="Notes (e.g., felt heavy, up weight next time)"
                        value={exercise.notes || ''}
                        onChange={e => updateExerciseNotes(exIdx, e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Session summary */}
          {liftLog.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Session Summary</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{liftLog.length}</div>
                  <div className="text-xs text-slate-400">Exercises</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{liftLog.reduce((sum, e) => sum + e.sets.length, 0)}</div>
                  <div className="text-xs text-slate-400">Total Sets</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {liftLog.reduce((sum, e) => sum + e.sets.reduce((s, set) => s + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0), 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">Total Volume (lbs)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======== WORKOUTS TAB ======== */}
      {view === 'workouts' && (
        <div className="space-y-4">
          {[exercisePlan.workoutA, exercisePlan.workoutB].map(workout => (
            <div key={workout.name} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-white">{workout.name}</h3>
                <button onClick={() => {
                  // Quick-add all exercises from this workout to today's lift log
                  const existing = data?.exerciseLog?.[todayStr] || [];
                  const newExercises = workout.exercises
                    .filter(ex => !existing.some(e => e.exerciseId === ex.id))
                    .map(ex => ({
                      id: Date.now() + Math.random(),
                      exerciseId: ex.id,
                      exerciseName: ex.name,
                      targetSets: ex.sets,
                      targetReps: ex.reps,
                      sets: [{ weight: '', reps: '', id: Date.now() + Math.random() }],
                      notes: '',
                    }));
                  if (newExercises.length > 0) {
                    saveExerciseLog(todayStr, [...existing, ...newExercises]);
                    setLiftDate(todayStr);
                    setView('lift');
                  }
                }}
                  className="text-xs bg-purple-600/30 text-purple-300 px-3 py-1 rounded-lg hover:bg-purple-600/50">
                  Start this workout →
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-3">Alternate A and B on strength days.</p>
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
            <p className="text-sm text-amber-300 mt-1">Focus on big muscle groups. This is anti-aging medicine. If it feels easy, it's not doing much.</p>
          </div>
        </div>
      )}

      {/* ======== CARDIO TAB ======== */}
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
              <div className="flex justify-between p-2 bg-slate-700/50 rounded"><span className="text-slate-300">Warm up</span><span className="text-slate-400">{exercisePlan.vo2MaxIntervals.warmup}</span></div>
              <div className="flex justify-between p-2 bg-orange-900/30 rounded"><span className="font-medium text-orange-300">Intervals</span><span className="text-slate-400">{exercisePlan.vo2MaxIntervals.intervals}</span></div>
              <div className="flex justify-between p-2 bg-slate-700/50 rounded"><span className="text-slate-300">Cool down</span><span className="text-slate-400">{exercisePlan.vo2MaxIntervals.cooldown}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ======== SWIMMING TAB ======== */}
      {view === 'swimming' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-700/50 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-2">🏊 Swimming</h3>
            <p className="text-sm text-slate-300 mb-3">{exercisePlan.swimming.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-cyan-400">{totalLapsAllTime.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Total laps</div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-cyan-400">{recentSwims.length}</div>
                <div className="text-xs text-slate-400">Sessions</div>
              </div>
            </div>
          </div>
          <button onClick={() => setShowSwimModal(true)}
            className="w-full bg-cyan-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-cyan-500 transition-colors">+ Log Swim Session</button>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-3">Swim Workouts</h3>
            <div className="space-y-2">
              {exercisePlan.swimming.workouts.map(w => (
                <div key={w.name} className="p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex justify-between items-center"><span className="font-medium text-sm text-white">{w.name}</span><span className="text-xs text-cyan-400 bg-cyan-900/40 px-2 py-1 rounded-full">{w.duration}</span></div>
                  <div className="text-xs text-slate-400 mt-1">{w.description}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-2">Why Swimming?</h3>
            <div className="flex flex-wrap gap-2">
              {exercisePlan.swimming.benefits.map(b => (<span key={b} className="bg-cyan-900/30 text-cyan-300 px-3 py-1 rounded-full text-xs">{b}</span>))}
            </div>
          </div>
          {recentSwims.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h3 className="font-semibold text-white mb-3">Recent Swims</h3>
              <div className="space-y-2">
                {recentSwims.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg text-sm">
                    <div>
                      <div className="font-medium text-white">{s.laps ? `${s.laps} laps` : `${s.distance}m`}</div>
                      <div className="text-xs text-slate-400">{new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{s.duration && ` · ${s.duration} min`}</div>
                    </div>
                    {s.notes && <div className="text-xs text-slate-500 text-right max-w-[120px] truncate">{s.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== MODALS ========== */}

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowExercisePicker(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Add Exercise</h3>

            {/* Workout A */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Workout A</h4>
              <div className="space-y-1">
                {exercisePlan.workoutA.exercises.map(ex => (
                  <button key={ex.id} onClick={() => addExerciseToLog(ex)}
                    className="w-full flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 text-left">
                    <span className="text-sm text-white">{ex.name}</span>
                    <span className="text-xs text-slate-400">{ex.sets}×{ex.reps}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Workout B */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Workout B</h4>
              <div className="space-y-1">
                {exercisePlan.workoutB.exercises.map(ex => (
                  <button key={ex.id} onClick={() => addExerciseToLog(ex)}
                    className="w-full flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 text-left">
                    <span className="text-sm text-white">{ex.name}</span>
                    <span className="text-xs text-slate-400">{ex.sets}×{ex.reps}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Extras */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Extra Exercises</h4>
              <div className="space-y-1">
                {ALL_EXERCISES.filter(e => e.source === 'extra' && e.id !== 'custom').map(ex => (
                  <button key={ex.id} onClick={() => addExerciseToLog(ex)}
                    className="w-full flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 text-left">
                    <span className="text-sm text-white">{ex.name}</span>
                    <span className="text-xs text-slate-400">{ex.sets}×{ex.reps}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Custom</h4>
              <div className="flex gap-2">
                <input type="text" placeholder="Exercise name" value={customExerciseName}
                  onChange={e => setCustomExerciseName(e.target.value)}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
                <button onClick={() => { if (customExerciseName.trim()) addExerciseToLog({ id: 'custom', name: customExerciseName, sets: 3, reps: '10' }); }}
                  className="bg-purple-600 text-white px-4 rounded-lg text-sm font-medium">Add</button>
              </div>
            </div>

            <button onClick={() => setShowExercisePicker(false)} className="w-full py-2 border border-slate-600 rounded-lg text-sm text-slate-300 mt-2">Close</button>
          </div>
        </div>
      )}

      {/* Swim Log Modal */}
      {showSwimModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSwimModal(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">🏊 Log Swim Session</h3>
            <form onSubmit={submitSwim} className="space-y-3">
              <input type="date" value={swimForm.date} onChange={e => setSwimForm(f => ({ ...f, date: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" />
              <input type="number" placeholder="Laps" value={swimForm.laps} onChange={e => setSwimForm(f => ({ ...f, laps: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <input type="number" placeholder="Distance (meters)" value={swimForm.distance} onChange={e => setSwimForm(f => ({ ...f, distance: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <input type="number" placeholder="Duration (min)" value={swimForm.duration} onChange={e => setSwimForm(f => ({ ...f, duration: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <input type="text" placeholder="Notes" value={swimForm.notes} onChange={e => setSwimForm(f => ({ ...f, notes: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowSwimModal(false)} className="flex-1 py-2 border border-slate-600 rounded-lg text-sm text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fitness Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEventModal(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">🏅 Add Fitness Event</h3>
            <form onSubmit={submitFitnessEvent} className="space-y-3">
              <select value={eventForm.type} onChange={e => setEventForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" required>
                {FITNESS_EVENT_TYPES.map(t => (<option key={t.id} value={t.id}>{t.emoji} {t.label}</option>))}
              </select>
              <input type="date" value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white" required />
              <input type="text" placeholder="Location" value={eventForm.location} onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <input type="text" placeholder="Event name" value={eventForm.notes} onChange={e => setEventForm(f => ({ ...f, notes: e.target.value }))} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-sm text-white placeholder-slate-400" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowEventModal(false)} className="flex-1 py-2 border border-slate-600 rounded-lg text-sm text-slate-300">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
