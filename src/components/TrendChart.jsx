export default function TrendChart({ data, goalValue, color, label, unit, height = 200 }) {
  if (!data || data.length < 2) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        {data?.length === 1 ? `Only 1 data point (${data[0].value} ${unit})` : 'Not enough data for a trend'}
      </div>
    );
  }

  const padding = { top: 20, right: 15, bottom: 35, left: 50 };
  const width = 400;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const allVals = goalValue != null ? [...values, goalValue] : values;
  const minVal = Math.min(...allVals) * 0.92;
  const maxVal = Math.max(...allVals) * 1.08;
  const range = maxVal - minVal || 1;

  const scaleX = (i) => padding.left + (i / (data.length - 1)) * chartW;
  const scaleY = (v) => padding.top + chartH - ((v - minVal) / range) * chartH;

  const points = data.map((d, i) => `${scaleX(i)},${scaleY(d.value)}`).join(' ');
  const goalY = goalValue != null ? scaleY(goalValue) : null;

  const labelInterval = Math.max(1, Math.floor(data.length / 5));
  const latest = data[data.length - 1];

  // Grid lines
  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const v = minVal + (range * i) / gridCount;
    return { y: scaleY(v), label: v.toFixed(v >= 100 ? 0 : 1) };
  });

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={padding.left} y1={g.y} x2={width - padding.right} y2={g.y} stroke="#334155" strokeWidth="0.5" />
            <text x={padding.left - 5} y={g.y + 4} textAnchor="end" className="text-[9px]" fill="#64748b">{g.label}</text>
          </g>
        ))}

        {/* Goal line */}
        {goalY != null && (
          <>
            <line x1={padding.left} y1={goalY} x2={width - padding.right} y2={goalY}
              stroke="#22c55e" strokeWidth="1.5" strokeDasharray="6 3" />
            <text x={width - padding.right + 3} y={goalY + 3} className="text-[8px]" fill="#22c55e">Goal</text>
          </>
        )}

        {/* Data line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {data.map((d, i) => (
          <circle key={i} cx={scaleX(i)} cy={scaleY(d.value)} r="4" fill={color} stroke="#1e293b" strokeWidth="2" />
        ))}

        {/* Date labels */}
        {data.map((d, i) => (
          i % labelInterval === 0 || i === data.length - 1 ? (
            <text key={i} x={scaleX(i)} y={height - 5} textAnchor="middle" className="text-[8px]" fill="#64748b">
              {new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            </text>
          ) : null
        ))}
      </svg>

      {/* Current value badge */}
      <div className="flex items-center justify-between mt-1 px-1">
        <span className="text-xs text-slate-400">
          Latest: <span className="font-semibold" style={{ color }}>{latest.value} {unit}</span>
          <span className="text-slate-600 ml-1">({new Date(latest.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})</span>
        </span>
        {goalValue != null && (
          <span className="text-xs text-green-500">Goal: {goalValue} {unit}</span>
        )}
      </div>
    </div>
  );
}
