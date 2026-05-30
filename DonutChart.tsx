import React, { useState } from 'react';

interface DonutChartProps {
  data: {
    name: string;
    value: number;
    color: string;
    percentage: number;
  }[];
  totalAmount: number;
  currency?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, totalAmount, currency = '৳' }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // SVG parameters
  const size = 220;
  const strokeWidth = 24;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative angles
  let accumulatedAngle = -90; // Start drawing from the top (12 o'clock)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all">
      {/* SVG Container */}
      <div className="relative w-[220px] h-[220px] flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(240, 240, 240, 0.5)"
            strokeWidth={strokeWidth}
          />
          {data.map((item, index) => {
            if (item.value <= 0) return null;
            
            // Total circumference proportion
            const dash = (item.percentage / 100) * circumference;
            const strokeDasharray = `${dash} ${circumference}`;
            
            const rotationAngle = accumulatedAngle;
            accumulatedAngle += (item.percentage / 100) * 360;

            const isHovered = activeIndex === index;

            return (
              <circle
                key={item.name}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={0}
                transform={`rotate(${rotationAngle} ${center} ${center})`}
                className="transition-all duration-300 cursor-pointer origin-center"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                style={{
                  strokeLinecap: 'butt',
                }}
              />
            );
          })}
        </svg>

        {/* Center Text displaying Grand Total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
            {activeIndex !== null ? data[activeIndex].name : 'Total'}
          </span>
          <span className="text-2xl font-bold font-sans text-gray-800 dark:text-white mt-1 flex items-center justify-center">
            {currency}{activeIndex !== null ? data[activeIndex].value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          {activeIndex !== null && (
            <span className="text-xs font-semibold text-emerald-500 transition-all duration-300">
              {data[activeIndex].percentage.toFixed(0)}% of month
            </span>
          )}
        </div>
      </div>

      {/* Legend Container */}
      <div className="flex flex-col gap-3.5 min-w-[140px]">
        {data.map((item, index) => (
          <div
            key={item.name}
            className={`flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
              activeIndex === index ? 'bg-gray-100 dark:bg-zinc-800 scale-105 font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-zinc-400'
            }`}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 border border-white dark:border-zinc-900 shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">{item.name}</span>
              <span className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
