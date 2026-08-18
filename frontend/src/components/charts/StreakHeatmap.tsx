import React, { useState } from 'react';
import { HeatmapDay } from '../../types';
import { Flame, Trophy, Calendar } from 'lucide-react';

interface StreakHeatmapProps {
  heatmapData: HeatmapDay[];
  currentStreak: number;
  longestStreak: number;
  totalSubmissionsYear?: number;
}

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({
  heatmapData,
  currentStreak,
  longestStreak,
  totalSubmissionsYear = 0,
}) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  const getColor = (level: number) => {
    switch (level) {
      case 1:
        return '#064e3b';
      case 2:
        return '#047857';
      case 3:
        return '#059669';
      case 4:
        return '#10b981';
      default:
        return '#161f30';
    }
  };

  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  heatmapData.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === heatmapData.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 shadow-sm space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-400" />
            Activity Log
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {totalSubmissionsYear} submissions in the past 365 days
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md">
            <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span>{currentStreak} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md">
            <Trophy className="h-3.5 w-3.5 text-slate-400" />
            <span>Best: {longestStreak} Days</span>
          </div>
        </div>
      </div>

      {/* SVG Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[720px]">
          {/* Months header */}
          <div className="flex text-[10px] text-slate-500 font-mono mb-1.5 pl-6 justify-between pr-4">
            {monthLabels.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>

          <div className="flex gap-1.5 items-start">
            {/* Days labels */}
            <div className="flex flex-col justify-between text-[9px] text-slate-500 font-mono h-[86px] pr-1 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={{ backgroundColor: getColor(day.level) }}
                      className="h-2.5 w-2.5 rounded-[2px] transition-transform hover:scale-125 cursor-pointer"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip & Legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
        <div>
          {hoveredDay ? (
            <span className="text-white font-semibold">
              {hoveredDay.count} solve{hoveredDay.count !== 1 ? 's' : ''} on {hoveredDay.date}
            </span>
          ) : (
            <span>Hover a square to inspect daily solves</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="h-2.5 w-2.5 rounded-[2px] bg-[#161f30] border border-slate-700" />
          <div className="h-2.5 w-2.5 rounded-[2px] bg-[#064e3b]" />
          <div className="h-2.5 w-2.5 rounded-[2px] bg-[#047857]" />
          <div className="h-2.5 w-2.5 rounded-[2px] bg-[#059669]" />
          <div className="h-2.5 w-2.5 rounded-[2px] bg-[#10b981]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
