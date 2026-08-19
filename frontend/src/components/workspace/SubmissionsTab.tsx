import React, { useState, useEffect } from 'react';
import { SubmissionListItem, Submission } from '../../types';
import { CheckCircle2, XCircle, Clock, ArrowLeft, Copy, Check, Terminal } from 'lucide-react';
import { submissionsApi } from '../../api';

interface SubmissionsTabProps {
  submissions: SubmissionListItem[];
  isLoading: boolean;
  onSelectSubmission?: (sub: SubmissionListItem) => void;
}

export const SubmissionsTab: React.FC<SubmissionsTabProps> = ({
  submissions,
  isLoading,
}) => {
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [submissionDetail, setSubmissionDetail] = useState<Submission | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedSubId) {
      setSubmissionDetail(null);
      return;
    }

    const fetchDetail = async () => {
      try {
        setIsLoadingDetail(true);
        const data = await submissionsApi.getById(selectedSubId);
        setSubmissionDetail(data);
      } catch (err) {
        console.error('Failed to load submission details', err);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedSubId]);

  const handleCopyCode = () => {
    if (!submissionDetail?.code) return;
    navigator.clipboard.writeText(submissionDetail.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 bg-[#1a1a1a]">
        <svg className="animate-spin h-5 w-5 text-[#FFA116]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (selectedSubId) {
    return (
      <div className="p-4 space-y-4 text-xs text-neutral-300 bg-[#1a1a1a] min-h-full">
        {/* Header with Back button */}
        <div className="flex items-center justify-between pb-3 border-b border-[#282828]">
          <button
            onClick={() => setSelectedSubId(null)}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Submissions
          </button>
          <span className="text-neutral-500 font-mono text-[11px]">
            {submissionDetail ? `Attempt #${submissionDetail.attempt_number}` : 'Loading...'}
          </span>
        </div>

        {isLoadingDetail ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-5 w-5 text-[#FFA116]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : submissionDetail ? (
          <div className="space-y-4">
            {/* Status Card */}
            <div className="p-3 rounded-lg border border-[#282828] bg-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {submissionDetail.status === 'accepted' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-400" />
                )}
                <div>
                  <span
                    className={`font-bold capitalize text-sm ${
                      submissionDetail.status === 'accepted' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {submissionDetail.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-neutral-400 block text-[11px] font-mono mt-0.5">
                    Submitted on {new Date(submissionDetail.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="capitalize px-2 py-0.5 rounded bg-[#2a2a2a] text-neutral-300 border border-[#383838]">
                  {submissionDetail.language}
                </span>
                {submissionDetail.runtime_ms !== null && submissionDetail.runtime_ms !== undefined && (
                  <span className="text-neutral-300">{submissionDetail.runtime_ms} ms</span>
                )}
                {submissionDetail.memory_kb !== null && submissionDetail.memory_kb !== undefined && (
                  <span className="text-neutral-300">
                    {(submissionDetail.memory_kb / 1024).toFixed(1)} MB
                  </span>
                )}
              </div>
            </div>

            {/* Error or Compiler Output if any */}
            {submissionDetail.error_message && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Terminal className="h-3.5 w-3.5" /> Execution Diagnostics:
                </div>
                <pre className="whitespace-pre-wrap text-[11px]">{submissionDetail.error_message}</pre>
              </div>
            )}

            {/* Code Viewer */}
            <div className="rounded-lg border border-[#282828] bg-[#141414] overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-[#222222] border-b border-[#282828] text-[11px] text-neutral-400 font-mono">
                <span>Submitted Code ({submissionDetail.language})</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-neutral-300 hover:text-white transition-colors px-2 py-1 rounded bg-[#2a2a2a] hover:bg-[#333]"
                  title="Copy code"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-neutral-200 overflow-x-auto leading-relaxed whitespace-pre">
                {submissionDetail.code}
              </pre>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-400 text-xs bg-[#1a1a1a]">
        <Clock className="h-8 w-8 text-neutral-600 mx-auto mb-2" />
        <p className="font-semibold text-neutral-300">No submissions yet for this problem.</p>
        <p className="mt-1 text-neutral-500">Write your solution and click "Submit" to see your logs here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 text-xs text-neutral-300 bg-[#1a1a1a]">
      <div className="flex items-center justify-between pb-2 border-b border-[#282828]">
        <h3 className="font-bold text-white text-sm">Past Submissions ({submissions.length})</h3>
        <span className="text-[11px] text-neutral-500">Click any row to inspect code</span>
      </div>

      <div className="space-y-2">
        {submissions.map((sub) => {
          const isAccepted = sub.status === 'accepted';
          return (
            <div
              key={sub.id}
              onClick={() => setSelectedSubId(sub.id)}
              className="flex items-center justify-between p-3 rounded-lg border border-[#282828] bg-[#222222] hover:border-[#404040] hover:bg-[#262626] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                {isAccepted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                )}
                <div>
                  <span
                    className={`font-semibold capitalize block ${
                      isAccepted ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {sub.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Attempt #{sub.attempt_number} · {new Date(sub.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-400 group-hover:text-neutral-200">
                <span className="capitalize px-1.5 py-0.5 rounded bg-[#2a2a2a] text-neutral-300">
                  {sub.language}
                </span>
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
