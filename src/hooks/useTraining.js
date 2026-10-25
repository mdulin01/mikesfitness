import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db } from '../firebase-config';
import {
  doc, setDoc, onSnapshot, collection, query, orderBy, limit,
  addDoc, updateDoc, deleteDoc, serverTimestamp, runTransaction,
} from 'firebase/firestore';
import { toLocalDateStr } from '../utils/dateUtils';
import {
  computePRs, detectPRs, weekStartOf, lastPerformance, suggestNextLoad,
} from '../utils/training';
import { EXERCISE_MAP } from '../data/exercises';
import { writePlanTransaction, validEffectiveDate } from '../utils/planRollout';
import { normalizeNextRace } from '../utils/triathlon';

// Training engine state: weekly plans (fitnessPlans/{weekStart}) + logged
// sessions (fitnessSessions collection) + the Rupert coach doc
// (mikesfitness/coach). Lives alongside useHealthData, which keeps owning
// the legacy mike-health doc (checklists, weight entries, tri sharing).
export const useTraining = (user, legacyData) => {
  const [plans, setPlans] = useState({});        // { [weekStart]: planDoc }
  const [sessions, setSessions] = useState([]);  // newest first
  const [coach, setCoach] = useState(null);      // Rupert-written note
  const [loading, setLoading] = useState(true);
  const [nextRace, setNextRace] = useState(null);
  const effectiveDate = validEffectiveDate(import.meta.env.VITE_TRAINING_TEMPLATE_EFFECTIVE_DATE);
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

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, 'mikesfitness', 'training-settings'), snap => {
      setNextRace(snap.data()?.nextRace || null);
    }, err => console.error('training settings error:', err));
  }, [user]);

  const saveNextRace = useCallback(async (race) => {
    if (!user) throw new Error('Sign in to save a race');
    const next = normalizeNextRace(race, toLocalDateStr());
    await setDoc(doc(db, 'mikesfitness', 'training-settings'), { nextRace: next }, { merge: true });
    setNextRace(next);
  }, [user]);

  // PR map merges new sessions with the legacy exerciseLog so history carries over.
  const prMap = useMemo(
    () => computePRs(sessions, legacyData?.exerciseLog),
    [sessions, legacyData?.exerciseLog]
  );

  const progressionFor = useCallback((blockDef, phase) => {
    const ex = EXERCISE_MAP[blockDef.exerciseId] || { repRange: blockDef.repRange };
    const last = lastPerformance(blockDef.exerciseId, sessions);
    return suggestNextLoad({ ...ex, repRange: blockDef.repRange || ex.repRange }, last, phase);
  }, [sessions]);

  const writeWeek = useCallback(async (weekStart, regenerate = false) => {
    if (!user) return false;
    return runTransaction(db, transaction => writePlanTransaction(transaction,
      doc(db, 'fitnessPlans', weekStart), {
        weekStart, today: toLocalDateStr(), effectiveDate, progressionFn: progressionFor, regenerate,
      }));
  }, [user, effectiveDate, progressionFor]);

  // Existing unstarted old-template weeks are migrated only inside the release gate.
  const ensureWeek = useCallback(async (weekStart) => {
    if (!user || loading) return;
    const key = `${weekStart}:${plans[weekStart]?.templateVersion || 'legacy'}`;
    if (seedingRef.current.has(key)) return;
    seedingRef.current.add(key);
    try { await writeWeek(weekStart); }
    catch (e) { console.error('ensureWeek error:', e); seedingRef.current.delete(key); }
  }, [user, loading, plans, writeWeek]);

  const regenerateWeek = useCallback(weekStart => writeWeek(weekStart, true), [writeWeek]);

  const saveDay = useCallback(async (weekStart, dayIdx, updates) => {
    const expected = plans[weekStart]?.days?.[dayIdx];
    if (!user || !expected) return;
    await runTransaction(db, async transaction => {
      const ref = doc(db, 'fitnessPlans', weekStart);
      const snapshot = await transaction.get(ref);
      const plan = snapshot.data();
      const actual = plan?.days?.[dayIdx];
      if (!actual || actual.id !== expected.id || actual.date !== expected.date || actual.title !== expected.title) {
        throw new Error('The week changed; reload before editing this session.');
      }
      const days = plan.days.map((d, i) => i === dayIdx ? { ...d, ...updates } : d);
      transaction.update(ref, { days });
    });
  }, [user, plans]);

  // Log a completed session. Detects PRs, links back to the plan day.
  const logSession = useCallback(async (session) => {
    const prs = detectPRs(session, prMap);
    const clean = JSON.parse(JSON.stringify({ ...session, prs, createdAt: undefined }));
    const ref = await addDoc(collection(db, 'fitnessSessions'), { ...clean, createdAt: serverTimestamp() });
    if (session.planWeek != null && session.planDay != null) {
      await runTransaction(db, async transaction => {
        const planRef = doc(db, 'fitnessPlans', session.planWeek);
        const plan = (await transaction.get(planRef)).data();
        const day = plan?.days?.[session.planDay];
        if (!day || day.date !== session.date || (day.id || null) !== (session.planDayId || null)) return;
        const days = plan.days.map((d, i) => i === session.planDay ? { ...d, status: 'done', sessionId: ref.id } : d);
        transaction.update(planRef, { days });
      });
    }
    return { id: ref.id, prs };
  }, [prMap]);

  const updateSession = useCallback(async (id, updates) => {
    await updateDoc(doc(db, 'fitnessSessions', id), JSON.parse(JSON.stringify(updates)));
  }, []);

  const deleteSession = useCallback(async (id) => {
    const sess = sessions.find(s => s.id === id);
    await deleteDoc(doc(db, 'fitnessSessions', id));
    if (sess?.planWeek != null && sess?.planDay != null) {
      await runTransaction(db, async transaction => {
        const planRef = doc(db, 'fitnessPlans', sess.planWeek);
        const plan = (await transaction.get(planRef)).data();
        if (plan?.days?.[sess.planDay]?.sessionId !== id) return;
        const days = plan.days.map((d, i) => i === sess.planDay ? { ...d, status: 'planned', sessionId: null } : d);
        transaction.update(planRef, { days });
      });
    }
  }, [sessions]);

  const currentWeekStart = weekStartOf(toLocalDateStr());

  return {
    plans, sessions, coach, trainingLoading: loading,
    prMap, progressionFor,
    ensureWeek, regenerateWeek, saveDay,
    logSession, updateSession, deleteSession,
    currentWeekStart, effectiveDate, nextRace, saveNextRace,
  };
};
