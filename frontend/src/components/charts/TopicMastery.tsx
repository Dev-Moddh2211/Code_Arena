import React from 'react';
import { TopicProgress } from '../../types';

interface TopicMasteryProps {
  topics: TopicProgress[];
}

export const TopicMastery: React.FC<TopicMasteryProps> = ({ topics }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-white">Topic Mastery</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {topics.map((t) => (
          <div key={t.topic} className="rounded-lg border border-slate-800 bg-[#090e18] p-3 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">{t.topic}</span>
              <span className="font-mono text-[11px] text-slate-400">
                {t.solved} / {t.total} ({t.percentage}%)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${t.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
