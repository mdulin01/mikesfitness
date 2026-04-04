import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase-config';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { COLLECTIONS } from '../constants';
import { trainingEvents } from '../data/exercisePlan';

const stripUndefined = (obj) => JSON.parse(JSON.stringify(obj));

const DOC_ID = 'mike-health';

const defaultData = {
  // Weight tracking
  weightEntries: [],
  // Lab results
  labResults: [],
  // Appointments
  appointments: [
    { id: 'gi-may-2026', type: 'gi', doctor: 'GI Doctor', date: '2026-05-18', time: '', location: '', notes: '', status: 'scheduled' },
    { id: 'primary-jul-2026', type: 'primary', doctor: 'Primary Care', date: '2026-07-17', time: '', location: '', notes: '', status: 'scheduled' },
    { id: 'cardiology-tbd', type: 'cardiology', doctor: '', date: '', notes: 'Need to schedule', status: 'needs-scheduling' },
    { id: 'dentist-tbd', type: 'dentist', doctor: '', date: '', notes: 'Need to schedule', status: 'needs-scheduling' },
    { id: 'derm-tbd', type: 'dermatology', doctor: '', date: '', notes: 'Need to schedule', status: 'needs-scheduling' },
  ],
  // Medications
  medications: [],
  // Training events & plans
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
        setData({ ...defaultData, ...snap.data() });
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

  // ========== APPOINTMENTS ==========
  const updateAppointment = useCallback((id, updates) => {
    const appts = (data?.appointments || []).map(a =>
      a.id === id ? { ...a, ...updates } : a
    );
    setData(d => ({ ...d, appointments: appts }));
    save({ appointments: appts });
  }, [data, save]);

  const addAppointment = useCallback((appt) => {
    const appts = [...(data?.appointments || []), { ...appt, id: `appt-${Date.now()}` }];
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

  // ========== EDIT DAILY CHECKLIST ITEMS ==========
  const updateDailyItems = useCallback((items) => {
    setData(d => ({ ...d, customDailyItems: items }));
    save({ customDailyItems: items });
  }, [save]);

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
  };
};
