import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, TrendingUp } from 'lucide-react';
import { adminApi } from '../../api';
import { AdminAnalyticsPayload } from '../../types';
import { Badge } from '../../components/common/Badge';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AdminAnalyticsPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await adminApi.getAnalytics();
        setData(res);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-24 bg-[#080c14]">
        <svg className="animate-spin h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#080c14] text-slate-300 min-h-[calc(100vh-3.5rem)]">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to CMS Problems
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Content & Judge Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Diagnostics, submission throughput, and problems needing test-case or statement calibration.
        </p>
      </div>

      {/* Platform Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-slate-400 block">Total Registered Users</span>
          <span className="text-2xl font-bold text-white mt-1 block">{data.total_users}</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-slate-400 block">Published Problems</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">
            {data.published_problems} <span className="text-xs text-slate-500">/ {data.total_problems}</span>
          </span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-slate-400 block">Evaluated Submissions</span>
          <span className="text-2xl font-bold text-white mt-1 block">{data.total_submissions}</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 shadow-sm">
          <span className="text-slate-400 block">Platform Pass Rate</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">{data.platform_acceptance_rate}%</span>
        </div>
      </div>

      {/* Two Queue Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Acceptance Review Queue */}
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 space-y-3 shadow-sm">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> Problems Needing Review (Lowest Acceptance)
          </h3>
          <p className="text-xs text-slate-400">
            Problems where candidates struggle disproportionately — candidates may need additional hints or clearer constraints.
          </p>

          <div className="space-y-2 mt-3">
            {data.lowest_acceptance_problems.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-[#090e18] text-xs">
                <div>
                  <Link to={`/admin/problems/${p.id}/edit`} className="font-semibold text-white hover:text-emerald-400">
                    {p.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={p.difficulty as any} size="sm">{p.difficulty}</Badge>
                    <span className="text-[11px] text-slate-400 font-mono">{p.total_submissions} attempts</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-rose-400 font-bold text-sm">{p.acceptance_rate}%</span>
                  <span className="text-[10px] text-slate-500 block">Pass rate</span>
                </div>
              </div>
            ))}
            {data.lowest_acceptance_problems.length === 0 && (
              <p className="text-xs text-slate-500 italic py-4 text-center">No low-acceptance problems flagged.</p>
            )}
          </div>
        </div>

        {/* Most Attempted Problems */}
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 space-y-3 shadow-sm">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> Most Attempted Challenges
          </h3>
          <p className="text-xs text-slate-400">
            Top questions driving engagement on the platform.
          </p>

          <div className="space-y-2 mt-3">
            {data.most_attempted_problems.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-[#090e18] text-xs">
                <div>
                  <Link to={`/admin/problems/${p.id}/edit`} className="font-semibold text-white hover:text-emerald-400">
                    {p.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={p.difficulty as any} size="sm">{p.difficulty}</Badge>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-white font-bold text-sm">{p.total_submissions}</span>
                  <span className="text-[10px] text-slate-500 block">{p.acceptance_rate}% accepted</span>
                </div>
              </div>
            ))}
            {data.most_attempted_problems.length === 0 && (
              <p className="text-xs text-slate-500 italic py-4 text-center">No submission activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
