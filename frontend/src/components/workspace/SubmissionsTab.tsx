import React, { useState } from 'react';
import { SubmissionListItem } from '../../types';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface SubmissionsTabProps {
  submissions: SubmissionListItem[];
  isLoading: boolean;
  onSelectSubmission?: (sub: SubmissionListItem) => void;
}

export const SubmissionsTab: React.FC<SubmissionsTabProps> = ({
  submissions,
  isLoading,
}) => {
  const [selectedSub, setSelectedSub] = useState<SubmissionListItem | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 bg-[#0d131f]">
        <svg className="animate-spin h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs bg-[#0d131f]">
        <Clock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
        <p className="font-semibold text-slate-300">No submissions yet for this problem.</p>
        <p className="mt-1 text-slate-500">Write your solution and click "Submit" to see your logs here.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 text-xs text-slate-300 bg-[#0d131f]">
      <div className="flex items-center justify-between pb-3 border-b border-[#1b2436]">
        <h3 className="font-bold text-white text-sm">Past Submissions ({submissions.length})</h3>
      </div>

      <div className="space-y-2">
        {submissions.map((sub) => {
          const isAccepted = sub.status === 'accepted';
          return (
            <div
              key={sub.id}
              onClick={() => setSelectedSub(sub)}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-[#090e18] hover:border-slate-700 shadow-sm transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {isAccepted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-400" />
                )}
                <div>
                  <span
                    className={`font-semibold capitalize block ${
                      isAccepted ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {sub.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Attempt #{sub.attempt_number} · {new Date(sub.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
                <span className="capitalize">{sub.language}</span>
                {sub.runtime_ms !== null && sub.runtime_ms !== undefined && (
                  <span>{sub.runtime_ms} ms</span>
                )}
                {sub.memory_kb !== null && sub.memory_kb !== undefined && (
                  <span>{(sub.memory_kb / 1024).toFixed(1)} MB</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
