import { buildWeekFromTemplate, TEMPLATE_VERSION } from '../data/programTemplate.js';
import { buildWeekFromTemplate as buildLegacyWeek } from '../data/legacyProgramTemplate.js';
import { weekStartOf } from './training.js';

// Set this non-secret Vercel build setting to the actual merge date at release.
// An unset/invalid date fails closed to the old template; never guess a merge date.
export function validEffectiveDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : null;
}
export const hasCompletedDay = plan => plan?.days?.some(day => day.status === 'done') === true;

// Called with a FRESH Firestore transaction snapshot, not a potentially stale subscription.
// Any completed day protects the ENTIRE week, including future weeks. Past weeks
// are never created or replaced; current pre-rollout weeks retain the old template.
export function planForWrite({ existing, weekStart, today, effectiveDate, progressionFn, regenerate = false }) {
  if (hasCompletedDay(existing) || weekStart < weekStartOf(today)) return null;
  const release = validEffectiveDate(effectiveDate);
  const useNew = release && today >= release && weekStart >= release;
  if (existing && (!regenerate && (existing.templateVersion === TEMPLATE_VERSION || !useNew))) return null;
  if (existing && !useNew) return null;
  const fresh = useNew ? buildWeekFromTemplate(weekStart, progressionFn, { effectiveDate: release }) : buildLegacyWeek(weekStart, progressionFn);
  // Keep week-level notes and identity metadata when replacing an untouched template.
  return { ...existing, ...fresh, focus: existing?.focus ?? fresh.focus, createdAt: existing?.createdAt ?? fresh.createdAt };
}

export async function writePlanTransaction(transaction, ref, options) {
  const snapshot = await transaction.get(ref);
  const fresh = planForWrite({ ...options, existing: snapshot.exists() ? snapshot.data() : null });
  if (!fresh) return false;
  transaction.set(ref, fresh);
  return true;
}
