import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase-config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
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
    {
      id: 'gi-may-2026',
      type: 'gi',
      doctor: 'GI Doctor',
      date: '2026-05-18',
      time: '',
      location: '',
      notes: '',
      status: 'scheduled',
    },
    {
      id: 'primary-jul-2026',
      type: 'primary',
      doctor: 'Primary Care',
      date: '2026-07-17',
      time: '',
      location: '',
      notes: '',
      status: 'scheduled',
    },
    {
      id: 'cardiology-tbd',
      type: 'cardiology',
      doctor: '',
      date: '',
      notes: 'Need to schedule',
      status: 'needs-scheduling',
    },
    {
      id: 'dentist-tbd',
      type: 'dentist',
      doctor: '',
      date: '',
      notes: 'Need to schedule',
      status: 'needs-scheduling',
    },
    {
      id: 'derm-tbd',
      type: 'dermatology',
      doctor: '',
      date: '',
      notes: 'Need to schedule',
      status: 'needs-scheduling',
    },
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
        // Initialize with defaults
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

  return {
    data, loading, save,
    addWeight, 
    updateAppointment, addAppointment, deleteAppointment,
    addLabResult,
    toggleDayCompletion, getWeekKey,
    toggleDailyItem,
  };
};
