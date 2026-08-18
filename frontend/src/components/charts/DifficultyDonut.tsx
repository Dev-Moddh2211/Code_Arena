import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DifficultyBreakdown } from '../../types';

interface DifficultyDonutProps {
  data: DifficultyBreakdown;
}

export const DifficultyDonut: React.FC<DifficultyDonutProps> = ({ data }) => {
  const chartData = [
    { name: 'Easy', value: data.easy.solved, total: data.easy.total, color: '#10b981' },
    { name: 'Medium', value: data.medium.solved, total: data.medium.total, color: '#f59e0b' },
    { name: 'Hard', value: data.hard.solved, total: data.hard.total, color: '#f43f5e' },
  ];

  const totalSolved = data.total_solved;
  const totalProblems = data.total_problems;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-white">Solved Problems</h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut */}
        <div className="relative h-36 w-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={62}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold font-mono text-white">{totalSolved}</span>
            <span className="text-[11px] text-slate-400 font-medium">of {totalProblems}</span>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="flex-1 w-full space-y-3 font-mono text-xs">
          {chartData.map((item) => {
            const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span className="font-sans font-semibold text-white">{item.name}</span>
                  <span>
                    <strong className="text-emerald-400">{item.value}</strong>
                    <span className="text-slate-500">/{item.total}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5 font-sans">({pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
