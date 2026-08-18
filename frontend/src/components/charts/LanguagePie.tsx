import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { LanguageStat } from '../../types';

interface LanguagePieProps {
  stats: LanguageStat[];
}

export const LanguagePie: React.FC<LanguagePieProps> = ({ stats }) => {
  const COLORS: Record<string, string> = {
    python: '#38bdf8',
    javascript: '#facc15',
    cpp: '#f43f5e',
    java: '#fb923c',
  };

  const chartData = stats.map((s) => ({
    name: s.language.toUpperCase(),
    value: s.count,
    color: COLORS[s.language] || '#64748b',
    percentage: s.percentage,
  }));

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-white">Languages Used</h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="h-32 w-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={52}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090e18',
                  borderColor: '#1b2436',
                  borderRadius: '0.5rem',
                  fontSize: '11px',
                  color: '#f8fafc',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 w-full space-y-2 text-xs">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-slate-200">{item.name}</span>
              </div>
              <span className="font-mono text-slate-400">{item.value} ({item.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
