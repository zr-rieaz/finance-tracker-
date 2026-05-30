import React, { useState } from 'react';

interface LineGraphProps {
  monthlySpendingByDay: { [day: number]: number };
  currency?: string;
}

export const LineGraph: React.FC<LineGraphProps> = ({ monthlySpendingByDay, currency = '৳' }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ day: number; amount: number; x: number; y: number } | null>(null);

  // Focus points as drawn in mockup (01, 05, 10, 15, 20, 25, 30)
  const displayDays = [1, 5, 10, 15, 20, 25, 30];
  const width = 500;
  const height = 120;
  const paddingX = 40;
  const paddingY = 20;

  // Fill in numbers for standard budget points (or generate if missing)
  const daysWithData = displayDays.map(day => {
    return {
      day,
      amount: monthlySpendingByDay[day] ?? 0
    };
  });

  const maxVal = Math.max(...daysWithData.map(d => d.amount), 0);
  const maxAmount = maxVal > 0 ? maxVal : 100;
  const minAmount = 0;

  // Map to SVG Coordinates
  const points = daysWithData.map((d, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / (displayDays.length - 1);
    // Invert Y coordinate so higher spending is towards top
    const percent = maxAmount === minAmount ? 0.5 : (d.amount - minAmount) / (maxAmount - minAmount);
    const y = height - paddingY - percent * (height - paddingY * 2);
    return { ...d, x, y };
  });

  // Create a smooth SVG Bezier path
  // Custom Catmull-Rom or cubic spline SVG generator
  const createBezierPath = () => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      // Control points for a beautiful smooth S-curve
      const cp1X = p0.x + (p1.x - p0.x) / 2;
      const cp1Y = p0.y;
      const cp2X = p0.x + (p1.x - p0.x) / 2;
      const cp2Y = p1.y;
      d += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = createBezierPath();
  const areaPath = linePath ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z` : '';

  return (
    <div className="w-full relative px-1 py-3">
      {/* Dynamic Graph Screen Container */}
      <div className="relative h-[150px] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* White Glow Gradient */}
            <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
            
            {/* Vibrant glow shadow */}
            <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#ffffff" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Area under curve */}
          {areaPath && (
            <path
              d={areaPath}
              className="fill-[url(#lineGlow)] transition-all duration-500 ease-out"
            />
          )}

          {/* Core White Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#shadow)"
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* Axis Guidelines / Tick labels */}
          <line
            x1={paddingX}
            y1={height - paddingY + 5}
            x2={width - paddingX}
            y2={height - paddingY + 5}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Interactive Nodes */}
          {points.map((p, index) => {
            const isHovered = hoveredPoint?.day === p.day;
            return (
              <g key={p.day} className="cursor-pointer">
                {/* Larger transparent hover capture area */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="16"
                  fill="transparent"
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* Real styled dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? '6' : '3.5'}
                  fill={isHovered ? '#7B3FF2' : '#ffffff'}
                  stroke={isHovered ? '#ffffff' : 'transparent'}
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                  style={{ pointerEvents: 'none' }}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip readout on hover */}
        {hoveredPoint && (
          <div
            className="absolute z-30 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 px-3 py-1.5 rounded-xl shadow-lg border border-purple-200 dark:border-zinc-800 text-xs font-sans font-semibold pointer-events-none transition-all duration-100 ease-out"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 32}%`,
              transform: 'translateX(-50%)',
            }}
          >
            Day {hoveredPoint.day.toString().padStart(2, '0')}:{' '}
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              {currency}{hoveredPoint.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between px-[34px] mt-0 text-[11px] font-medium font-mono text-white/70">
        {displayDays.map(day => (
          <span key={day}>{day.toString().padStart(2, '0')}</span>
        ))}
      </div>
    </div>
  );
};
