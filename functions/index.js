// Cloud Functions for mikesfitness
//
// Function: mikesfitnessHealthIngest
// Purpose:  Receives JSON payloads from the Health Auto Export iOS app and
//           writes them into Firestore at dailyMetrics/{YYYY-MM-DD}.
//
// Auth:     Bearer token in Authorization header, validated against
//           HEALTH_INGEST_TOKEN secret stored in Google Cloud Secret Manager.
//
// Health Auto Export sends payloads that look roughly like:
//   { "data": { "metrics": [ { "name": "...", "units": "...", "data": [ ... ] } ],
//               "workouts": [ ... ] } }
// We map known metric names into a structured per-day shape and keep the raw
// payload too so we can backfill missed metrics later without losing data.

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const HEALTH_INGEST_TOKEN = defineSecret('HEALTH_INGEST_TOKEN');

// Map Health Auto Export metric names → structured per-day path + aggregator.
// agg: 'sum' (per-day total), 'avg' (per-day mean), 'latest' (newest value),
//      'min', 'max'.
const METRIC_MAP = {
  // Activity
  step_count:                 { path: ['activity', 'steps'],            agg: 'sum' },
  distance_walking_running:   { path: ['activity', 'distanceMiles'],    agg: 'sum' },
  active_energy:              { path: ['activity', 'activeEnergyKcal'], agg: 'sum' },
  basal_energy_burned:        { path: ['activity', 'basalEnergyKcal'],  agg: 'sum' },
  apple_exercise_time:        { path: ['activity', 'exerciseMinutes'],  agg: 'sum' },
  apple_stand_time:           { path: ['activity', 'standMinutes'],     agg: 'sum' },
  flights_climbed:            { path: ['activity', 'flightsClimbed'],   agg: 'sum' },

  // Vitals
  heart_rate:                 { path: ['vitals', 'heartRateAvg'],       agg: 'avg' },
  resting_heart_rate:         { path: ['vitals', 'heartRateRest'],      agg: 'latest' },
  walking_heart_rate_average: { path: ['vitals', 'heartRateWalking'],   agg: 'latest' },
  heart_rate_variability:     { path: ['vitals', 'hrv'],                agg: 'avg' },
  respiratory_rate:           { path: ['vitals', 'respiratoryRate'],    agg: 'avg' },
  oxygen_saturation:          { path: ['vitals', 'spo2'],               agg: 'avg' },
  weight_body_mass:           { path: ['vitals', 'weightLbs'],          agg: 'latest' },
  body_fat_percentage:        { path: ['vitals', 'bodyFatPct'],         agg: 'latest' },
  lean_body_mass:             { path: ['vitals', 'leanBodyMassLbs'],    agg: 'latest' },
  blood_pressure_systolic:    { path: ['vitals', 'bpSystolic'],         agg: 'latest' },
  blood_pressure_diastolic:   { path: ['vitals', 'bpDiastolic'],        agg: 'latest' },
  body_temperature:           { path: ['vitals', 'tempF'],              agg: 'latest' },

  // Wellness
  mindful_session:            { path: ['wellness', 'mindfulMinutes'],   agg: 'sum' },
  vo2_max:                    { path: ['fitness', 'vo2max'],            agg: 'latest' },

  // Sleep handled separately because it has stages with start/end times.
};

// Convert HAE date string to local (US Eastern) YYYY-MM-DD. HAE typically sends
// "2026-05-09 14:23:00 -0400" — we slice off the date portion which is already
// local-time per the device.
function dateKeyOf(haeDate) {
  if (typeof haeDate !== 'string') return null;
  return haeDate.slice(0, 10); // "YYYY-MM-DD"
}

// Set a nested field via dotted path on a plain object. Used to build the
// dailyMetrics doc shape from METRIC_MAP entries.
function setPath(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (!cur[path[i]]) cur[path[i]] = {};
    cur = cur[path[i]];
  }
  cur[path[path.length - 1]] = value;
}

// Aggregate a list of {qty, date} samples for a given metric.
function aggregate(samples, agg) {
  const nums = samples
    .map(s => (typeof s.qty === 'number' ? s.qty : (typeof s.avg === 'number' ? s.avg : null)))
    .filter(n => n !== null && !Number.isNaN(n));
  if (nums.length === 0) return null;
  switch (agg) {
    case 'sum': return Math.round((nums.reduce((a, b) => a + b, 0)) * 100) / 100;
    case 'avg': return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
    case 'min': return Math.min(...nums);
    case 'max': return Math.max(...nums);
    case 'latest': {
      // Pick the sample with the latest date string
      const sorted = [...samples].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      const last = sorted[sorted.length - 1];
      return typeof last.qty === 'number' ? Math.round(last.qty * 100) / 100 : last.qty;
    }
    default: return nums[nums.length - 1];
  }
}

// Process a single metric block from HAE, group by date, aggregate per day,
// return a map of { 'YYYY-MM-DD': { fieldPath: ..., value } }.
function processMetric(metric) {
  const map = METRIC_MAP[metric.name];
  if (!map || !Array.isArray(metric.data)) return null;
  const byDate = {};
  for (const sample of metric.data) {
    const key = dateKeyOf(sample.date);
    if (!key) continue;
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(sample);
  }
  const out = {};
  for (const [date, samples] of Object.entries(byDate)) {
    const value = aggregate(samples, map.agg);
    if (value === null) continue;
    out[date] = { path: map.path, value, unit: metric.units };
  }
  return out;
}

// Build per-date sleep summary from the sleep_analysis metric. HAE returns
// per-stage entries like { startDate, endDate, value: 'deep' | 'core' | 'rem' | 'awake' | 'asleep' }.
function processSleep(metric) {
  if (!Array.isArray(metric.data)) return {};
  const byDate = {};
  for (const sample of metric.data) {
    // Group sleep into the wake-up date so a single nightly record covers it.
    const wake = sample.endDate || sample.date;
    const key = dateKeyOf(wake);
    if (!key) continue;
    if (!byDate[key]) byDate[key] = { hoursTotal: 0, stages: {}, samples: 0 };
    const start = sample.startDate ? new Date(sample.startDate) : null;
    const end = sample.endDate ? new Date(sample.endDate) : null;
    const hours = (start && end && !Number.isNaN(start) && !Number.isNaN(end))
      ? (end - start) / 3600000
      : (typeof sample.qty === 'number' ? sample.qty : 0);
    if (hours > 0) {
      byDate[key].hoursTotal += hours;
      const stage = (sample.value || sample.source || 'asleep').toLowerCase();
      byDate[key].stages[stage] = (byDate[key].stages[stage] || 0) + hours;
    }
    byDate[key].samples++;
  }
  // Round
  for (const key of Object.keys(byDate)) {
    byDate[key].hoursTotal = Math.round(byDate[key].hoursTotal * 100) / 100;
    for (const s of Object.keys(byDate[key].stages)) {
      byDate[key].stages[s] = Math.round(byDate[key].stages[s] * 100) / 100;
    }
  }
  return byDate;
}

// Build per-date list of workouts.
function processWorkouts(workouts) {
  if (!Array.isArray(workouts)) return {};
  const byDate = {};
  for (const w of workouts) {
    const key = dateKeyOf(w.start || w.startDate || w.date);
    if (!key) continue;
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push({
      type: w.name || w.workoutActivityType || w.activityType || 'Workout',
      durationMinutes: typeof w.duration === 'number' ? Math.round(w.duration / 60) : null,
      distanceMiles: typeof w.distance === 'number' ? Math.round(w.distance * 100) / 100 : null,
      activeEnergyKcal: typeof w.activeEnergyBurned === 'number' ? Math.round(w.activeEnergyBurned) : null,
      avgHeartRate: typeof w.avgHeartRate === 'number' ? Math.round(w.avgHeartRate) : null,
      maxHeartRate: typeof w.maxHeartRate === 'number' ? Math.round(w.maxHeartRate) : null,
      start: w.start || w.startDate,
      end: w.end || w.endDate,
    });
  }
  return byDate;
}

exports.mikesfitnessHealthIngest = onRequest(
  {
    cors: false,
    memory: '256MiB',
    timeoutSeconds: 60,
    secrets: [HEALTH_INGEST_TOKEN],
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    // Bearer token check. The expected token is stored in Secret Manager.
    const auth = req.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token || token !== HEALTH_INGEST_TOKEN.value()) {
      logger.warn('Rejected ingest: invalid token');
      res.status(401).send('Unauthorized');
      return;
    }

    const body = req.body || {};
    const data = body.data || body;
    const metrics = Array.isArray(data.metrics) ? data.metrics : [];
    const workouts = Array.isArray(data.workouts) ? data.workouts : [];

    // Per-date accumulator: { 'YYYY-MM-DD': { activity: {...}, vitals: {...}, ... } }
    const perDate = {};
    const ensure = (date) => {
      if (!perDate[date]) perDate[date] = {};
      return perDate[date];
    };

    const unknownMetricNames = [];

    for (const metric of metrics) {
      if (!metric || typeof metric !== 'object') continue;
      if (metric.name === 'sleep_analysis') {
        const sleepByDate = processSleep(metric);
        for (const [date, sleep] of Object.entries(sleepByDate)) {
          const doc = ensure(date);
          doc.sleep = sleep;
        }
        continue;
      }
      if (!METRIC_MAP[metric.name]) {
        unknownMetricNames.push(metric.name);
        continue;
      }
      const processed = processMetric(metric);
      if (!processed) continue;
      for (const [date, { path, value, unit }] of Object.entries(processed)) {
        const doc = ensure(date);
        setPath(doc, path, value);
        // Track units in a parallel map for transparency.
        if (unit) {
          if (!doc._units) doc._units = {};
          doc._units[path.join('.')] = unit;
        }
      }
    }

    const workoutsByDate = processWorkouts(workouts);
    for (const [date, list] of Object.entries(workoutsByDate)) {
      const doc = ensure(date);
      doc.workouts = list;
    }

    // Write each per-date doc with merge so multiple syncs through the day
    // don't clobber each other. Save raw payload for the most recent date so
    // we can backfill new metrics later.
    const dates = Object.keys(perDate);
    const writes = dates.map((date) => {
      const docRef = db.collection('dailyMetrics').doc(date);
      return docRef.set({
        ...perDate[date],
        date,
        source: 'apple-health',
        lastSync: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    // Stash the raw payload separately keyed by upload time. Capped at 60 days
    // by a separate scheduled cleanup function (TODO).
    const rawRef = db.collection('dailyMetricsRaw').doc();
    writes.push(rawRef.set({
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      datesAffected: dates,
      unknownMetricNames: [...new Set(unknownMetricNames)],
      payload: body,
    }));

    try {
      await Promise.all(writes);
    } catch (err) {
      logger.error('Firestore write failed', err);
      res.status(500).send('Write failed');
      return;
    }

    logger.info('Ingest OK', {
      dates,
      metricsProcessed: metrics.length,
      workoutsProcessed: workouts.length,
      unknownMetricCount: unknownMetricNames.length,
    });

    res.status(200).json({
      ok: true,
      datesAffected: dates,
      metricsProcessed: metrics.length,
      workoutsProcessed: workouts.length,
      unknownMetricNames: [...new Set(unknownMetricNames)],
    });
  }
);
