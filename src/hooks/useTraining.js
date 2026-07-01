import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db } from '../firebase-config';
import {
  doc, setDoc, onSnapshot, collection, query, orderBy, limit,
  addDoc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { toLocalDateStr } from '../utils/dateUtils';
import {
  computePRs, detectPRs, weekStartOf, lastPerformance, suggestNextLoad,
} from '../utils/training';
import { EXERCISE_MAP } from '../data/exercises';
import { buildWeekFromTemplate } from '../data/programTemplate';

// Training engine state: weekly plans (fitnessPlans/{weekStart}) + logged
// sessions (fitnessSessions collection) + the Rupert coach doc
// (mikesfitness/coach). Lives alongside useHealthData, which keeps owning
// the legacy mike-health doc (checklists, weight entries, tri sharing).
export const useTraining = (user, legacyData) => {
  const [plans, setPlans] = useState({});        // { [weekStart]: planDoc }
  const [sessions, setSessions] = useState([]);  // newest first
  const [coach, setCoach] = useState(null);      // Rupert-written note
  const [loading, setLoading] = useState(true);
  const seedingRef = useRef(new Set());          // guard double-seeds

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'fitnessPlans'), orderBy('weekStart', 'desc'), limit(12));
    return onSnapshot(q, (snap) => {
      const map = {};
      snap.docs.forEach(d => { map[d.id] = { id: d.id, ...d.data() }; });
      setPlans(map);
      setLoading(false);
    }, (err) => { console.error('fitnessPlans error:', err); setLoading(false); });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'fitnessSessions'), orderBy('date', 'desc'), limit(400));
    return onSnapshot(q, (snap) => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error('fitnessSessions error:', err));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'mikesfitness', 'coach'), (snap) => {
      setCoach(snap.exists() ? snap.data() : null);
    }, (err) => console.error('coach doc error:', err));
  }, [user]);

  // PR map merges new sessions with the legacy exerciseLog so history carries over.
  const prMap = useMemo(
    () => computePRs(sessions, legacyData?.exerciseLog),
    [sessions, legacyData?.exerciseLog]
  );

  const progressionFor = useCallback((blockDef) => {
    const ex = EXERCISE_MAP[blockDef.exerciseId] || { repRange: blockDef.repRange };
    const last = lastPerformance(blockDef.exerciseId, sessions);
    return suggestNextLoad(ex, last);
  }, [sessions]);

  // Ensure a plan doc exists for a week (seed from template + progression).
  const ensureWeek = useCallback(async (weekStart) => {
    if (!user || plans[weekStart] || seedingRef.current.has(weekStart)) return;
    seedingRef.current.add(weekStart);
    try {
      const week = buildWeekFromTemplate(weekStart, progressionFor);
      await setDoc(doc(db, 'fitnessPlans', weekStart), week, { merge: false });
    } catch (e) { console.error('ensureWeek error:', e); seedingRef.current.delete(weekStart); }
  }, [user, plans, progressionFor]);

  // Re-seed a week from the template + latest progression (keeps done days).
  const regenerateWeek = useCallback(async (weekStart) => {
    const existing = plans[weekStart];
    const fresh = buildWeekFromTemplate(weekStart, progressionFor);
    if (existing) {
      fresh.days = fresh.days.map((d, i) =>
        existing.days?.[i]?.status === 'done' ? existing.days[i] : d);
      fresh.generatedBy = 'progression';
    }
    await setDoc(doc(db, 'fitnessPlans', weekStart), fresh);
  }, [plans, progressionFor]);

  const saveDay = useCallback(async (weekStart, dayIdx, updates) => {
    const plan = plans[weekStart];
    if (!plan) return;
    const days = plan.days.map((d, i) => i === dayIdx ? { ...d, ...updates } : d);
    setPlans(p => ({ ...p, [weekStart]: { ...plan, days } }));
    await setDoc(doc(db, 'fitnessPlans', weekStart), { days }, { merge: true });
  }, [plans]);

  // Log a completed session. Detects PRs, links back to the plan day.
  const logSession = useCallback(async (session) => {
    const prs = detectPRs(session, prMap);
    const clean = JSON.parse(JSON.stringify({ ...session, prs, createdAt: undefined }));
    const ref = await addDoc(collection(db, 'fitnessSessions'), { ...clean, createdAt: serverTimestamp() });
    if (session.planWeek != null && session.planDay != null) {
      const plan = plans[session.planWeek];
      if (plan?.days?.[session.planDay]) {
        const days = plan.days.map((d, i) => i === session.planDay ? { ...d, status: 'done', sessionId: ref.id } : d);
        await setDoc(doc(db, 'fitnessPlans', session.planWeek), { days }, { merge: true });
      }
    }
    return { id: ref.id, prs };
  }, [prMap, plans]);

  const updateSession = useCallback(async (id, updates) => {
    await updateDoc(doc(db, 'fitnessSessions', id), JSON.parse(JSON.stringify(updates)));
  }, []);

  const deleteSession = useCallback(async (id) => {
    const sess = sessions.find(s => s.id === id);
    await deleteDoc(doc(db, 'fitnessSessions', id));
    if (sess?.planWeek != null && sess?.planDay != null) {
      const plan = plans[sess.planWeek];
      if (plan?.days?.[sess.planDay]?.sessionId === id) {
        const days = plan.days.map((d, i) => i === sess.planDay ? { ...d, status: 'planned', sessionId: null } : d);
        await setDoc(doc(db, 'fitnessPlans', sess.planWeek), { days }, { merge: true });
      }
    }
  }, [sessions, plans]);

  const currentWeekStart = weekStartOf(toLocalDateStr());

  return {
    plans, sessions, coach, trainingLoading: loading,
    prMap, progressionFor,
    ensureWeek, regenerateWeek, saveDay,
    logSession, updateSession, deleteSession,
    currentWeekStart,
  };
};
