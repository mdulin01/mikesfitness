import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase-config';
import { doc, setDoc, onSnapshot, deleteField } from 'firebase/firestore';
import { COLLECTIONS, FITNESS_EVENT_TYPES } from '../constants';
import { trainingEvents } from '../data/exercisePlan';
import { toLocalDateStr } from '../utils/dateUtils';

// Remove undefined values before writing to Firestore (null is kept intentionally for resets)
const stripUndefined = (obj) => JSON.parse(JSON.stringify(obj));

const DOC_ID = 'mike-health';

// One-time migration: fix date keys that were stored in UTC instead of local time.
// Between 8 PM EDT and midnight, toISOString() returned the NEXT day's date.
// Uses deleteField() to properly remove nested map keys from Firestore.
function migrateUTCDateKeys(snapData, docRef) {
  if (snapData._dateFixV3) return snapData;

  const wrongDate = '2026-04-05';
  const correctDate = '2026-04-04';
  const ALL_FIELDS = ['dailyChecklist', 'medicationChecks', 'mealLog', 'fiberLog', 'fastingLog', 'exerciseLog'];
  const OBJ_FIELDS = new Set(['dailyChecklist', 'medicationChecks', 'fiberLog', 'fastingLog']);
  let changed = false;

  // Build Firestore-compatible update using dot notation + deleteField()
  const updates = { _dateFixV3: true };
  // Also build local corrected data
  const localFixes = {};

  for (const field of ALL_FIELDS) {
    const map = snapData[field];
    if (!map || !map[wrongDate]) continue;
    changed = true;

    // Merge into correct date locally
    if (OBJ_FIELDS.has(field)) {
      localFixes[field] = { ...map, [correctDate]: { ...(map[wrongDate] || {}), ...(map[correctDate] || {}) } };
    } else {
      // Array fields: concat + dedupe
      const existing = map[correctDate] || [];
      const wrong = map[wrongDate] || [];
      const ids = new Set(existing.map(e => e.id));
      localFixes[field] = { ...map, [correctDate]: [...existing, ...wrong.filter(e => !ids.has(e.id))] };
    }
    delete localFixes[field][wrongDate];

    // For Firestore: use dot-path to delete the nested key
    updates[`${field}.${wrongDate}`] = deleteField();
    // And set the merged correct-date value
    updates[`${field}.${correctDate}`] = localFixes[field][correctDate];
  }

  if (changed) {
    console.log('[migration-v3] Deleting', wrongDate, 'keys from Firestore');
  }
  setDoc(docRef, updates, { merge: true }).catch(console.error);

  return { ...snapData, ...localFixes, _dateFixV3: true };
}

// Map known appointment type IDs to categories for migration
const FITNESS_TYPE_IDS = new Set(FITNESS_EVENT_TYPES.map(t => t.id));

// Migrate appointments that are missing the category field
function migrateAppointments(appointments) {
  if (!appointments) return appointments;
  return appointments.map(a => {
    if (a.category) return a; // already has category
    if (FITNESS_TYPE_IDS.has(a.type)) return { ...a, category: 'fitness' };
    // Check by id pattern
    if (a.id?.includes('marathon') || a.id?.includes('triathlon')) return { ...a, category: 'fitness' };
    return { ...a, category: 'medical' }; // default old appointments to medical
  });
}

const defaultData = {
  // Weight tracking
  weightEntries: [],
  // Lab results
  labResults: [],
  // Appointments / Events
  appointments: [
    { id: 'gi-may-2026', type: 'gi', category: 'medical', doctor: 'GI Doctor', date: '2026-05-18', time: '', location: '', notes: '', status: 'scheduled' },
    { id: 'primary-jul-2026', type: 'primary', category: 'medical', doctor: 'Primary Care', date: '2026-07-17', time: '', location: '', notes: '', status: 'scheduled' },
    { id: 'cardiology-tbd', type: 'cardiology', category: 'medical', doctor: '', date: '', notes: 'Need to schedule', status: 'needs-scheduling' },
    { id: 'dentist-tbd', type: 'dentist', category: 'medical', doctor: '', date: '', notes: 'Need to schedule', status: 'needs-scheduling' },
    { id: 'derm-tbd', type: 'dermatology', category: 'medical', doctor: '', date: '', notes: 'Need to schedule', status: 'needs-scheduling' },
    // Fitness events from training calendar
    { id: 'half-marathon-event', type: 'half-marathon', category: 'fitness', doctor: '', date: '2026-05-02', time: '', location: 'Indianapolis, IN', notes: 'Indy Half Marathon', status: 'scheduled' },
    { id: 'triathlon-event', type: 'triathlon', category: 'fitness', doctor: '', date: '2026-09-27', time: '', location: 'Wrightsville Beach, NC', notes: 'Wrightsville Beach Triathlon', status: 'scheduled' },
    // April–June 2026 medical appointments
    { id: 'cardiology-hochrein-2026-04-21', type: 'cardiology', category: 'medical', doctor: 'Jake Hochrein', date: '2026-04-21', time: '', location: '', notes: '', status: 'completed' },
    { id: 'dentist-2026-04-27', type: 'dentist', category: 'medical', doctor: '', date: '2026-04-27', time: '', location: '', notes: '', status: 'completed' },
    { id: 'dental-cleaning-2026-05-12', type: 'dentist', category: 'medical', doctor: '', date: '2026-05-12', time: '14:00', location: '', notes: 'Cleaning', status: 'scheduled' },
    { id: 'gi-shah-2026-05-19', type: 'gi', category: 'medical', doctor: 'Ravi Shah', date: '2026-05-19', time: '08:15', location: '', notes: '', status: 'scheduled' },
    { id: 'vein-2026-05-22', type: 'other-medical', category: 'medical', doctor: '', date: '2026-05-22', time: '08:00', location: '', notes: 'Vein doctor', status: 'scheduled' },
    { id: 'primary-2026-05-22', type: 'primary', category: 'medical', doctor: '', date: '2026-05-22', time: '', location: '', notes: '', status: 'scheduled' },
    { id: 'echo-2026-06-12', type: 'cardiology', category: 'medical', doctor: '', date: '2026-06-12', time: '13:00', location: '', notes: 'Echocardiogram', status: 'scheduled' },
  ],
  // Medications
  medications: [],
  // Training events & plans — ALWAYS use code values (force-update)
  trainingEvents: trainingEvents,
  trainingPlans: {},
  // Weekly workout completions: { '2026-W14': { monday: true, tuesday: false, ... } }
  weeklyCompletions: {},
  // Daily checklist: { '2026-04-04': { steps: true, mobility: true, sleep: true } }
  dailyChecklist: {},

  // ========== NEW FEATURES ==========

  // Medication daily check-ins: { '2026-04-04': { 'Rosuvastatin 5 mg': true, ... } }
  medicationChecks: {},

  // Meal log: { '2026-04-04': [{ id, time, type, description, notes }] }
  mealLog: {},

  // Monthly goals: { '2026-04': { goals: [...], dailyChecks: { '2026-04-04': { goalId: true } } } }
  monthlyGoals: {
    '2026-04': {
      goals: [
        { id: 'no-alcohol', label: 'No Alcohol', emoji: '🚫🍺' },
        { id: 'no-sweets', label: 'No Sweets/Desserts', emoji: '🚫🍰' },
      ],
      dailyChecks: {},
    },
  },

  // Week notes/comments for training weeks: { '2026-W14': { notes: '', highlights: '' } }
  weekNotes: {},

  // Streaks tracking
  streaks: { currentWorkout: 0, bestWorkout: 0, currentDaily: 0, bestDaily: 0 },

  // Swimming log: [{ id, date, laps, distance, duration, notes }]
  swimmingLog: [],

  // Shopping list: [{ id, item, checked, category }]
  shoppingList: [],

  // Workout details per day: { '2026-W14': { monday: [{ type, distance, duration, notes }] } }
  workoutDetails: {},

  // Exercise log: { '2026-04-04': [{ id, exercise, sets: [{ weight, reps }], notes }] }
  exerciseLog: {},

  // Intermittent fasting log: { '2026-04-04': { fastStart, fastEnd, feedingWindowHours, notes } }
  fastingLog: {},

  // Fasting settings (defaults)
  fastingSettings: {
    targetFastHours: 16,
    feedingWindowHours: 8,
    typicalFastStart: '20:00',
    typicalFeedingStart: '12:00',
  },

  // Fiber tracking: { '2026-04-04': { morning: true, evening: true, foods: ['oatmeal', 'lentils'] } }
  fiberLog: {},

  // Sleep log: { '2026-04-04': { bedtime: '22:30', wakeTime: '06:15', hours: 7.75, quality: 3 } }
  sleepLog: {},

  // Water log: { '2026-04-04': { entries: [{ id, time, oz }], total: 0 } }
  waterLog: {},

  // Steps log: { '2026-04-12': { steps: 8500, source: 'manual' } }
  stepsLog: {},
};

export const useHealthData = (user) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to health data
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const docRef = doc(db, COLLECTIONS.HEALTH_DATA, DOC_ID);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        let snapData = snap.data();
        // Migrate UTC date keys to local date keys (one-time fix)
        snapData = migrateUTCDateKeys(snapData, docRef);
        // Migrate appointments missing category field + inject defaults (one-time)
        const migratedAppts = migrateAppointments(snapData.appointments || defaultData.appointments);
        const existingIds = new Set(migratedAppts.map(a => a.id));
        const missingDefaults = defaultData.appointments.filter(a => !existingIds.has(a.id));
        const mergedAppts = missingDefaults.length > 0 || migratedAppts.some((a, i) => !a.category && snapData.appointments?.[i]?.category !== a.category)
          ? [...migratedAppts, ...missingDefaults]
          : migratedAppts;
        // Only persist if we actually added missing defaults or fixed categories
        if (missingDefaults.length > 0 || migratedAppts !== (snapData.appointments || defaultData.appointments)) {
          const needsWrite = missingDefaults.length > 0 || migratedAppts.some(a => !(snapData.appointments || []).find(sa => sa.id === a.id && sa.category === a.category));
          if (needsWrite) {
            setDoc(docRef, { appointments: mergedAppts }, { merge: true }).catch(console.error);
          }
        }
        setData({
          ...defaultData,
          ...snapData,
          appointments: mergedAppts,
          // Force-update trainingEvents from code so date fixes always apply
          trainingEvents: trainingEvents,
        });
      } else {
        setDoc(docRef, stripUndefined(defaultData));
        setData(defaultData);
      }
      setLoading(false);
    }, (err) => {
      console.error('Health data error:', err);
      setData(defaultData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const save = useCallback(async (updates) => {
    if (!user) return;
    const docRef = doc(db, COLLECTIONS.HEALTH_DATA, DOC_ID);
    try {
      await setDoc(docRef, stripUndefined(updates), { merge: true });
    } catch (err) {
      console.error('Save error:', err);
    }
  }, [user]);

  // ========== WEIGHT ==========
  const addWeight = useCallback((entry) => {
    const entries = [...(data?.weightEntries || []), { ...entry, id: Date.now() }];
    entries.sort((a, b) => b.date.localeCompare(a.date));
    setData(d => ({ ...d, weightEntries: entries }));
    save({ weightEntries: entries });
  }, [data, save]);

  // ========== APPOINTMENTS / EVENTS ==========
  const updateAppointment = useCallback((id, updates) => {
    const appts = (data?.appointments || []).map(a =>
      a.id === id ? { ...a, ...updates } : a
    );
    setData(d => ({ ...d, appointments: appts }));
    save({ appointments: appts });
  }, [data, save]);

  const addAppointment = useCallback((appt) => {
    const appts = [...(data?.appointments || []), { ...appt, id: `event-${Date.now()}` }];
    setData(d => ({ ...d, appointments: appts }));
    save({ appointments: appts });
  }, [data, save]);

  const deleteAppointment = useCallback((id) => {
    const appts = (data?.appointments || []).filter(a => a.id !== id);
    setData(d => ({ ...d, appointments: appts }));
    save({ appointments: appts });
  }, [data, save]);

  // ========== LABS ==========
  const addLabResult = useCallback((result) => {
    const results = [...(data?.labResults || []), { ...result, id: Date.now() }];
    results.sort((a, b) => b.date.localeCompare(a.date));
    setData(d => ({ ...d, labResults: results }));
    save({ labResults: results });
  }, [data, save]);

  // ========== WEEKLY COMPLETIONS ==========
  const getWeekKey = (date = new Date()) => {
    const d = new Date(date);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d - jan1) / 86400000);
    const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  };

  const toggleDayCompletion = useCallback((dayKey, weekKey = null) => {
    const wk = weekKey || getWeekKey();
    const completions = { ...(data?.weeklyCompletions || {}) };
    if (!completions[wk]) completions[wk] = {};
    completions[wk][dayKey] = !completions[wk][dayKey];
    setData(d => ({ ...d, weeklyCompletions: completions }));
    save({ weeklyCompletions: completions });
  }, [data, save]);

  // ========== DAILY CHECKLIST ==========
  const toggleDailyItem = useCallback((dateStr, itemKey) => {
    const checklist = { ...(data?.dailyChecklist || {}) };
    if (!checklist[dateStr]) checklist[dateStr] = {};
    checklist[dateStr][itemKey] = !checklist[dateStr][itemKey];
    setData(d => ({ ...d, dailyChecklist: checklist }));
    save({ dailyChecklist: checklist });
  }, [data, save]);

  // ========== MEDICATION CHECK-INS ==========
  const toggleMedCheck = useCallback((dateStr, medName) => {
    const checks = { ...(data?.medicationChecks || {}) };
    if (!checks[dateStr]) checks[dateStr] = {};
    checks[dateStr][medName] = !checks[dateStr][medName];
    setData(d => ({ ...d, medicationChecks: checks }));
    save({ medicationChecks: checks });
  }, [data, save]);

  // ========== MEAL LOG ==========
  const addMeal = useCallback((dateStr, meal) => {
    const log = { ...(data?.mealLog || {}) };
    if (!log[dateStr]) log[dateStr] = [];
    log[dateStr] = [...log[dateStr], { ...meal, id: Date.now() }];
    setData(d => ({ ...d, mealLog: log }));
    save({ mealLog: log });
  }, [data, save]);

  const deleteMeal = useCallback((dateStr, mealId) => {
    const log = { ...(data?.mealLog || {}) };
    if (log[dateStr]) {
      log[dateStr] = log[dateStr].filter(m => m.id !== mealId);
    }
    setData(d => ({ ...d, mealLog: log }));
    save({ mealLog: log });
  }, [data, save]);

  // ========== MONTHLY GOALS ==========
  const getMonthKey = (date = new Date()) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const addMonthlyGoal = useCallback((monthKey, goal) => {
    const goals = { ...(data?.monthlyGoals || {}) };
    if (!goals[monthKey]) goals[monthKey] = { goals: [], dailyChecks: {} };
    goals[monthKey].goals = [...goals[monthKey].goals, { ...goal, id: goal.id || `goal-${Date.now()}` }];
    setData(d => ({ ...d, monthlyGoals: goals }));
    save({ monthlyGoals: goals });
  }, [data, save]);

  const removeMonthlyGoal = useCallback((monthKey, goalId) => {
    const goals = { ...(data?.monthlyGoals || {}) };
    if (goals[monthKey]) {
      goals[monthKey].goals = goals[monthKey].goals.filter(g => g.id !== goalId);
    }
    setData(d => ({ ...d, monthlyGoals: goals }));
    save({ monthlyGoals: goals });
  }, [data, save]);

  const toggleMonthlyGoalCheck = useCallback((monthKey, dateStr, goalId) => {
    const goals = { ...(data?.monthlyGoals || {}) };
    if (!goals[monthKey]) goals[monthKey] = { goals: [], dailyChecks: {} };
    if (!goals[monthKey].dailyChecks) goals[monthKey].dailyChecks = {};
    if (!goals[monthKey].dailyChecks[dateStr]) goals[monthKey].dailyChecks[dateStr] = {};
    goals[monthKey].dailyChecks[dateStr][goalId] = !goals[monthKey].dailyChecks[dateStr][goalId];
    setData(d => ({ ...d, monthlyGoals: goals }));
    save({ monthlyGoals: goals });
  }, [data, save]);

  // ========== WEEK NOTES ==========
  const saveWeekNotes = useCallback((weekKey, notes) => {
    const weekNotes = { ...(data?.weekNotes || {}) };
    weekNotes[weekKey] = { ...(weekNotes[weekKey] || {}), ...notes, updatedAt: new Date().toISOString() };
    setData(d => ({ ...d, weekNotes: weekNotes }));
    save({ weekNotes: weekNotes });
  }, [data, save]);

  // ========== SWIMMING LOG ==========
  const addSwimEntry = useCallback((entry) => {
    const log = [...(data?.swimmingLog || []), { ...entry, id: Date.now() }];
    log.sort((a, b) => b.date.localeCompare(a.date));
    setData(d => ({ ...d, swimmingLog: log }));
    save({ swimmingLog: log });
  }, [data, save]);

  // ========== WORKOUT DETAILS (per-day activity logs) ==========
  // workoutDetails: { '2026-W14': { monday: [{ type, distance, duration, notes }], ... } }
  const saveWorkoutDetail = useCallback((weekKey, dayKey, details) => {
    const all = { ...(data?.workoutDetails || {}) };
    if (!all[weekKey]) all[weekKey] = {};
    all[weekKey][dayKey] = details;
    setData(d => ({ ...d, workoutDetails: all }));
    save({ workoutDetails: all });
  }, [data, save]);

  // ========== EXERCISE LOG ==========
  const saveExerciseLog = useCallback((dateStr, exercises) => {
    const log = { ...(data?.exerciseLog || {}) };
    log[dateStr] = exercises;
    setData(d => ({ ...d, exerciseLog: log }));
    save({ exerciseLog: log });
  }, [data, save]);

  // ========== FASTING LOG ==========
  const saveFastingEntry = useCallback((dateStr, entry) => {
    const log = { ...(data?.fastingLog || {}) };
    log[dateStr] = { ...(log[dateStr] || {}), ...entry };
    setData(d => ({ ...d, fastingLog: log }));
    save({ fastingLog: log });
  }, [data, save]);

  const saveFastingSettings = useCallback((settings) => {
    const updated = { ...(data?.fastingSettings || {}), ...settings };
    setData(d => ({ ...d, fastingSettings: updated }));
    save({ fastingSettings: updated });
  }, [data, save]);

  // ========== FIBER LOG ==========
  const saveFiberEntry = useCallback((dateStr, entry) => {
    const log = { ...(data?.fiberLog || {}) };
    log[dateStr] = { ...(log[dateStr] || {}), ...entry };
    setData(d => ({ ...d, fiberLog: log }));
    save({ fiberLog: log });
  }, [data, save]);

  // ========== EDIT DAILY CHECKLIST ITEMS ==========
  const updateDailyItems = useCallback((items) => {
    setData(d => ({ ...d, customDailyItems: items }));
    save({ customDailyItems: items });
  }, [save]);

  // ========== SHOPPING LIST ==========
  const addShoppingItem = useCallback((item) => {
    const list = [...(data?.shoppingList || []), { ...item, id: Date.now(), checked: false }];
    setData(d => ({ ...d, shoppingList: list }));
    save({ shoppingList: list });
  }, [data, save]);

  const toggleShoppingItem = useCallback((itemId) => {
    const list = (data?.shoppingList || []).map(i =>
      i.id === itemId ? { ...i, checked: !i.checked } : i
    );
    setData(d => ({ ...d, shoppingList: list }));
    save({ shoppingList: list });
  }, [data, save]);

  const deleteShoppingItem = useCallback((itemId) => {
    const list = (data?.shoppingList || []).filter(i => i.id !== itemId);
    setData(d => ({ ...d, shoppingList: list }));
    save({ shoppingList: list });
  }, [data, save]);

  const clearCheckedItems = useCallback(() => {
    const list = (data?.shoppingList || []).filter(i => !i.checked);
    setData(d => ({ ...d, shoppingList: list }));
    save({ shoppingList: list });
  }, [data, save]);

  // ========== SLEEP LOG ==========
  const saveSleepEntry = useCallback((dateStr, entry) => {
    const log = { ...(data?.sleepLog || {}) };
    log[dateStr] = { ...(log[dateStr] || {}), ...entry };
    setData(d => ({ ...d, sleepLog: log }));
    save({ sleepLog: log });
  }, [data, save]);

  // ========== WATER LOG ==========
  const addWaterEntry = useCallback((dateStr, oz) => {
    const log = { ...(data?.waterLog || {}) };
    if (!log[dateStr]) log[dateStr] = { entries: [], total: 0 };
    const entry = { id: Date.now(), time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), oz };
    log[dateStr] = {
      entries: [...log[dateStr].entries, entry],
      total: log[dateStr].total + oz,
    };
    setData(d => ({ ...d, waterLog: log }));
    save({ waterLog: log });
  }, [data, save]);

  const removeWaterEntry = useCallback((dateStr, entryId) => {
    const log = { ...(data?.waterLog || {}) };
    if (!log[dateStr]) return;
    const removed = log[dateStr].entries.find(e => e.id === entryId);
    log[dateStr] = {
      entries: log[dateStr].entries.filter(e => e.id !== entryId),
      total: Math.max(0, log[dateStr].total - (removed?.oz || 0)),
    };
    setData(d => ({ ...d, waterLog: log }));
    save({ waterLog: log });
  }, [data, save]);

  // ========== STEPS LOG ==========
  const saveStepsEntry = useCallback((dateStr, steps) => {
    const log = { ...(data?.stepsLog || {}) };
    log[dateStr] = { steps: parseInt(steps) || 0, source: 'manual' };
    setData(d => ({ ...d, stepsLog: log }));
    save({ stepsLog: log });
  }, [data, save]);

  return {
    data, loading, save,
    addWeight,
    updateAppointment, addAppointment, deleteAppointment,
    addLabResult,
    toggleDayCompletion, getWeekKey,
    toggleDailyItem,
    // New
    toggleMedCheck,
    addMeal, deleteMeal,
    getMonthKey, addMonthlyGoal, removeMonthlyGoal, toggleMonthlyGoalCheck,
    saveWeekNotes,
    addSwimEntry,
    updateDailyItems,
    // Workout details
    saveWorkoutDetail,
    // Exercise log
    saveExerciseLog,
    // Shopping list
    addShoppingItem, toggleShoppingItem, deleteShoppingItem, clearCheckedItems,
    // Fasting
    saveFastingEntry, saveFastingSettings,
    // Fiber
    saveFiberEntry,
    // Sleep and Water
    saveSleepEntry, addWaterEntry, removeWaterEntry,
    // Steps
    saveStepsEntry,
  };
};
