// Helpers for pulling time series and aggregates out of dailyMetricsByDate.
// Shared between Dashboard trends, Health charts, and (eventually) Rupert's snapshot.

import { toLocalDateStr } from './dateUtils';

// Pull a sorted ASC time series from dailyMetricsByDate for a dotted path
// like 'vitals.hrv' or 'activity.steps'. Numeric values only.
export function appleSeries(dailyMetricsByDate, path, days = 90) {
  if (!dailyMetricsByDate) return [];
  const keys = path.split('.');
  const out = [];
  for (const [date, doc] of Object.entries(dailyMetricsByDate)) {
    let v = doc;
    for (const k of keys) v = v?.[k];
    if (v != null && typeof v === 'number') out.push({ date, value: v });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date)).slice(-days);
}

// The N most recent date keys (descending), regardless of whether they have data.
function lastNDates(n) {
  const out = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(toLocalDateStr(d));
  }
  return out;
}

// Sum of `path` over the last N days (treats missing as 0). For things like
// "weekly steps" or "weekly exercise minutes."
export function appleSum(dailyMetricsByDate, path, days = 7) {
  if (!dailyMetricsByDate) return 0;
  const keys = path.split('.');
  let total = 0;
  for (const date of lastNDates(days)) {
    let v = dailyMetricsByDate[date];
    for (const k of keys) v = v?.[k];
    if (typeof v === 'number') total += v;
  }
  return total;
}

// Average of `path` over the last N days, ONLY counting days that have data.
// Returns { avg, daysWithData } — caller can decide how to display partial weeks.
export function appleAvg(dailyMetricsByDate, path, days = 7) {
  if (!dailyMetricsByDate) return { avg: null, daysWithData: 0 };
  const keys = path.split('.');
  let sum = 0, n = 0;
  for (const date of lastNDates(days)) {
    let v = dailyMetricsByDate[date];
    for (const k of keys) v = v?.[k];
    if (typeof v === 'number') { sum += v; n++; }
  }
  return { avg: n > 0 ? sum / n : null, daysWithData: n };
}

// Latest non-null value for a path. Returns { value, date } or null.
export function appleLatest(dailyMetricsByDate, path) {
  const series = appleSeries(dailyMetricsByDate, path, 365);
  if (series.length === 0) return null;
  const last = series[series.length - 1];
  return { value: last.value, date: last.date };
}

// Direction arrow + percent change between the most recent value and the
// avg of the prior `windowDays` window. For "is this trending the right way."
export function appleTrend(dailyMetricsByDate, path, windowDays = 14) {
  const series = appleSeries(dailyMetricsByDate, path, windowDays * 2);
  if (series.length < 3) return { arrow: '→', pct: null, direction: 'flat' };
  const recent = series.slice(-Math.ceil(windowDays / 2));
  const prior = series.slice(0, Math.floor(windowDays / 2));
  const recentAvg = recent.reduce((s, x) => s + x.value, 0) / recent.length;
  const priorAvg = prior.length > 0 ? prior.reduce((s, x) => s + x.value, 0) / prior.length : recentAvg;
  if (priorAvg === 0) return { arrow: '→', pct: null, direction: 'flat' };
  const pct = ((recentAvg - priorAvg) / priorAvg) * 100;
  if (Math.abs(pct) < 2) return { arrow: '→', pct, direction: 'flat' };
  return { arrow: pct > 0 ? '↑' : '↓', pct, direction: pct > 0 ? 'up' : 'down' };
}

// Tiny inline sparkline (SVG path string) for a series of {date, value}.
// Returns { d, viewBox, points } so callers can drop into <svg viewBox={vb}><path d={d} /></svg>.
export function sparklinePath(series, width = 100, height = 24) {
  if (!series || series.length < 2) return { d: '', viewBox: `0 0 ${width} ${height}`, points: [] };
  const values = series.map(s => s.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (series.length - 1);
  const points = series.map((s, i) => ({
    x: i * stepX,
    y: height - ((s.value - min) / range) * (height - 2) - 1,
  }));
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  return { d, viewBox: `0 0 ${width} ${height}`, points };
}
