import React, { useState } from 'react';
import { Hint } from '../../types';
import { HelpCircle, ChevronDown, ChevronRight, Lock, Unlock } from 'lucide-react';

interface HintsTabProps {
  hints: Hint[];
}

export const HintsTab: React.FC<HintsTabProps> = ({ hints }) => {
  const [unlockedIndex, setUnlockedIndex] = useState<number>(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!hints || hints.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs bg-[#0d131f]">
        <HelpCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
        <p className="font-semibold text-slate-300">No hints available for this problem.</p>
      </div>
    );
  }

  const handleUnlockNext = () => {
    if (unlockedIndex < hints.length - 1) {
      const nextIdx = unlockedIndex + 1;
      setUnlockedIndex(nextIdx);
      setExpandedIndex(nextIdx);
    }
  };

  return (
    <div className="p-6 space-y-4 text-xs text-slate-300 bg-[#0d131f]">
      <div className="flex items-center justify-between pb-3 border-b border-[#1b2436]">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-emerald-400" />
          <h3 className="font-bold text-white text-sm">Progressive Hints ({hints.length})</h3>
        </div>

        {unlockedIndex < hints.length - 1 && (
          <button
            onClick={handleUnlockNext}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-md transition-colors"
          >
            <Unlock className="h-3 w-3 text-emerald-400" /> Unlock Hint {unlockedIndex + 2}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {hints.map((hint, idx) => {
          const isUnlocked = idx <= unlockedIndex;
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={hint.id || idx}
              className={`rounded-xl border transition-colors overflow-hidden ${
                isUnlocked
                  ? 'border-slate-800 bg-[#090e18] shadow-sm'
                  : 'border-slate-800/60 bg-slate-900/30 opacity-60'
              }`}
            >
              <button
                disabled={!isUnlocked}
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full flex items-center justify-between p-3 text-left font-medium"
              >
                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <span className="font-semibold text-white">Hint {idx + 1}</span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Lock className="h-3 w-3" /> Hint {idx + 1} (Locked)
                    </span>
                  )}
                </div>
                {isUnlocked && (
                  <span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </span>
                )}
              </button>

              {isUnlocked && isExpanded && (
                <div className="p-3.5 pt-0 text-slate-300 leading-relaxed border-t border-slate-800/80 font-sans">
                  {hint.content_md}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
