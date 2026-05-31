import { useState } from 'react';
import { appleSeries } from '../utils/appleHealth';
import { toLocalDateStr } from '../utils/dateUtils';

// Physical / performance metrics shown at the top of the dashboard.
// Weight + Body Fat come from weightEntries; the rest from Apple Health dailyMetrics.
const METRICS = [
  { key: 'weight', label: 'Weight', unit: 'lb', kind: 'bio', good: 'down', src: 'weight', field: 'weight', color: '#60a5fa' },
  { key: 'bf', label: 'Body Fat', unit: '%', kind: 'bio', good: 'down', src: 'weight', field: 'bodyFat', color: '#a78bfa' },
  { key: 'vo2', label: 'VO₂ Max', unit: '', kind: 'bio', good: 'up', path: 'fitness.vo2max', color: '#22d3ee' },
  { key: 'hrv', label: 'HRV', unit: 'ms', kind: 'bio', good: 'up', path: 'vitals.hrv', color: '#34d399' },
  { key: 'rhr', label: 'Resting HR', unit: 'bpm', kind: 'bio', good: 'down', path: 'vitals.heartRateRest', color: '#fb923c' },
  { key: 'sleep', label: 'Sleep', unit: 'hr', kind: 'bio', good: 'up', path: 'sleep.hoursTotal', color: '#818cf8' },
  { key: 'steps', label: 'Steps', unit: '', kind: 'act', good: 'up', path: 'activity.steps', color: '#3b82f6' },
  { key: 'exercise', label: 'Exercise', unit: 'min', kind: 'act', good: 'up', path: 'activity.exerciseMinutes', color: '#22c55e' },
  { key: 'swim', label: 'Swim', unit: 'm', kind: 'act', good: 'up', path: 'activity.swimDistanceMeters', color: '#06b6d4' },
  { key: 'activeCal', label: 'Active Cal', unit: 'kcal', kind: 'act', good: 'up', path: 'activity.activeEnergyKcal', color: '#f43f5e' },
];

const weightSeries = (data, field) =>
  (data?.weightEntries || []).filter(e => e[field] != null && e.date)
    .map(e => ({ date: e.date, value: Number(e[field]) }))
    .sort((a, b) => a.date.localeCompare(b.date));

const seriesFor = (m, data, dm) => (m.src === 'weight' ? weightSeries(data, m.field) : appleSeries(dm, m.path, 1095));

const fmt = (m, v) => v == null ? '—'
  : (m.key === 'steps' || m.key === 'swim' || m.key === 'activeCal') ? Math.round(v).toLocaleString()
  : Number.isInteger(v) ? String(v) : v.toFixed(1);

function trendOf(series) {
  if (series.length < 3) return { arrow: '→', dir: 'flat' };
  const last = series[series.length - 1].value;
  const prior = series.slice(-8, -1);
  const base = prior.length ? prior.reduce((s, x) => s + x.value, 0) / prior.length : last;
  if (!base) return { arrow: '→', dir: 'flat' };
  const pct = ((last - base) / base) * 100;
  if (Math.abs(pct) < 2) return { arrow: '→', dir: 'flat', pct };
  return { arrow: pct > 0 ? '↑' : '↓', dir: pct > 0 ? 'up' : 'down', pct };
}

function bucket(series, period, agg) {
  const map = {};
  for (const { date, value } of series) {
    let key;
    if (period === 'year') key = date.slice(0, 4);
    else if (period === 'month') key = date.slice(0, 7);
    else { const d = new Date(date + 'T12:00:00'); const off = (d.getDay() + 6) % 7; d.setDate(d.getDate() - off); key = toLocalDateStr(d); }
    (map[key] = map[key] || []).push(value);
  }
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).map(([k, vals]) => ({
    label: k,
    value: agg === 'sum' ? Math.round(vals.reduce((s, v) => s + v, 0)) : Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10,
  }));
}

const MON = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function shortLabel(label, period) {
  if (period === 'year') return label;
  if (period === 'month') { const [y, m] = label.split('-'); return `${MON[+m]} '${y.slice(2)}`; }
  const [, m, d] = label.split('-'); return `${+m}/${+d}`;
}

function MiniSpark({ series, color }) {
  const pts = series.slice(-30);
  if (pts.length < 2) return <div className="h-4" />;
  const vals = pts.map(p => p.value); const min = Math.min(...vals); const max = Math.max(...vals); const r = max - min || 1;
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (pts.length - 1) * 100).toFixed(1)} ${(18 - ((p.value - min) / r) * 16).toFixed(1)}`).join(' ');
  return <svg viewBox="0 0 100 18" className="w-full h-4" preserveAspectRatio="none"><path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function PhysicalMetrics({ data, dailyMetricsByDate }) {
  const [sel, setSel] = useState(null);
  const [period, setPeriod] = useState('month');

  const tiles = METRICS.map(m => {
    const series = seriesFor(m, data, dailyMetricsByDate);
    return { m, series, latest: series.length ? series[series.length - 1] : null, trend: trendOf(series) };
  }).filter(t => t.latest);

  if (tiles.length === 0) return null;
  const selected = tiles.find(t => t.m.key === sel);

  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Physical Metrics <span className="text-slate-600 normal-case tracking-normal">· tap a tile for trends</span></div>
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {tiles.map(({ m, series, latest, trend }) => {
          const isSel = m.key === sel;
          const good = trend.dir !== 'flat' && trend.dir === m.good;
          const arrowColor = trend.dir === 'flat' ? 'text-slate-500' : good ? 'text-emerald-400' : 'text-orange-400';
          return (
            <button key={m.key} onClick={() => setSel(isSel ? null : m.key)}
              className={`text-left rounded-lg p-2.5 border transition-all ${isSel ? 'bg-slate-700 border-blue-400 ring-2 ring-blue-400/40' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-slate-400">{m.label}</span>
                <span className={`text-[10px] ${arrowColor}`}>{trend.arrow}</span>
              </div>
              <div className="text-lg font-bold text-white leading-tight">{fmt(m, latest.value)}<span className="text-[10px] text-slate-500 font-normal"> {m.unit}</span></div>
              <div className="mt-1"><MiniSpark series={series} color={m.color} /></div>
            </button>
          );
        })}
      </div>

      {selected && (() => {
        const { m, series } = selected;
        const agg = m.kind === 'act' ? 'sum' : 'avg';
        const buckets = bucket(series, period, agg).slice(-12);
        const vals = buckets.map(b => b.value); const max = Math.max(...vals, 1);
        const all = series.map(s => s.value);
        const stat = { latest: all[all.length - 1], avg: all.reduce((s, v) => s + v, 0) / all.length, min: Math.min(...all), max: Math.max(...all) };
        const change = all.length > 1 ? ((all[all.length - 1] - all[0]) / all[0]) * 100 : 0;
        return (
          <div className="bg-slate-800 rounded-xl border-2 border-blue-400/60 p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="font-semibold text-white">{m.label} trend <span className="text-xs text-slate-500 font-normal">· {agg === 'sum' ? 'total' : 'avg'} per {period === 'week' ? 'week' : period === 'month' ? 'month' : 'year'}</span></h3>
              <div className="flex gap-1">
                {['week', 'month', 'year'].map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`text-xs px-2.5 py-1 rounded-lg capitalize ${period === p ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                    {p === 'week' ? 'Weekly' : p === 'month' ? 'Monthly' : 'Yearly'}
                  </button>
                ))}
              </div>
            </div>
            {buckets.length < 1 ? <div className="text-slate-500 text-sm py-6 text-center">Not enough data for this view yet.</div> : (
              <div className="flex items-end gap-1.5 h-40">
                {buckets.map((b, i) => {
                  const isLast = i === buckets.length - 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
                      <div className="text-[9px] text-slate-300 mb-0.5">{fmt(m, b.value)}</div>
                      <div className="w-full rounded-t transition-all" style={{ height: `${Math.max(2, (b.value / max) * 100)}%`, background: isLast ? m.color : '#475569' }} />
                      <div className="text-[8px] text-slate-500 mt-1 truncate w-full text-center">{shortLabel(b.label, period)}</div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
              {[['Latest', fmt(m, stat.latest)], ['Average', fmt(m, Math.round(stat.avg * 10) / 10)], ['Min', fmt(m, stat.min)], ['Max', fmt(m, stat.max)]].map(([l, v]) => (
                <div key={l} className="bg-slate-900/50 rounded-lg p-2">
                  <div className="text-[10px] text-slate-500 uppercase">{l}</div>
                  <div className="text-sm font-bold text-white">{v}</div>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              {series.length} readings · {series[0].date} → {series[series.length - 1].date}
              {Math.abs(change) >= 1 && <span className={(change > 0) === (m.good === 'up') ? ' text-emerald-400' : ' text-orange-400'}> · {change > 0 ? '+' : ''}{change.toFixed(0)}% overall</span>}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
