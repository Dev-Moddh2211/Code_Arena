import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface RuntimeHistoryChartProps {
  runtimeHistory: { date: string; runtime_ms: number; memory_kb: number }[];
  memoryHistory?: { date: string; runtime_ms: number; memory_kb: number }[];
}

export const RuntimeHistoryChart: React.FC<RuntimeHistoryChartProps> = ({
  runtimeHistory,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">Performance Over Time</h3>
        <p className="text-xs text-slate-400 mt-0.5">Runtime (ms) and Memory consumption across submissions</p>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={runtimeHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1b2436" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1b2436' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1b2436' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#090e18',
                borderColor: '#1b2436',
                borderRadius: '0.5rem',
                fontSize: '11px',
                color: '#f8fafc',
              }}
            />
            <Line
              type="monotone"
              dataKey="runtime_ms"
              name="Runtime (ms)"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
