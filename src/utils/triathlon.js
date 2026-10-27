import { validEffectiveDate } from './planRollout.js';

export function activeTriPlan(sharedFitness, fallbackId, fallbackPlan, today) {
  const events = sharedFitness?.events || [];
  const candidates = events.filter(e => e.type === 'triathlon' || e.id === fallbackId);
  if (!candidates.some(e => e.id === fallbackId)) candidates.push({ id: fallbackId, name: 'Wrightsville Beach Sprint Tri' });
  for (const event of candidates) {
    const plan = sharedFitness?.trainingPlans?.[event.id] || (event.id === fallbackId ? fallbackPlan : []);
    if (plan.some(week => week.startDate <= today && week.endDate >= today)) return { event, plan };
  }
  return null;
}

export function normalizeNextRace(race, today) {
  const name = String(race?.name || '').trim().slice(0, 120);
  const distance = String(race?.distance || '').trim().slice(0, 80);
  const date = validEffectiveDate(race?.date);
  if (!name || !distance || !date || date < today) throw new Error('Add a name, a future race date, and a distance.');
  return { name, date, distance };
}
