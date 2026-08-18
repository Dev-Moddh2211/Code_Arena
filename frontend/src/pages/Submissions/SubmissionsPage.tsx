import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Code2,
  BarChart2,
  List,
} from 'lucide-react';
import { submissionsApi } from '../../api';
import { SubmissionListItem } from '../../types';
import { RuntimeHistoryChart } from '../../components/charts/RuntimeHistoryChart';

export const SubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [analyticsData, setAnalyticsData] = useState<{
    runtime_history: any[];
    memory_history: any[];
    acceptance_rate: number;
    total_submissions: number;
    accepted_count: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewedCode, setViewedCode] = useState<{ id: string; code: string; language: string } | null>(null);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {};
      if (statusFilter) params.status = statusFilter;
      if (languageFilter) params.language = languageFilter;

      const [listRes, analRes] = await Promise.all([
        submissionsApi.list(params),
        submissionsApi.analytics(),
      ]);
      setSubmissions(listRes);
      setAnalyticsData(analRes);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, languageFilter]);

  const handleViewCode = async (id: string) => {
    const sub = await submissionsApi.getById(id);
    setViewedCode({ id: sub.id, code: sub.code, language: sub.language });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#080c14] text-slate-300 min-h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Submission History & Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review your execution logs, track runtime improvements, and analyze memory trends.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-[#0d131f] p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'list'
                ? 'bg-slate-800 text-white font-semibold shadow-xs border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="h-3.5 w-3.5" /> Submissions List
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-white font-semibold shadow-xs border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" /> Performance Analytics
          </button>
        </div>
      </div>

      {activeTab === 'analytics' && analyticsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 shadow-sm">
              <span className="text-slate-400 block">Total Evaluated Runs</span>
              <span className="text-2xl font-bold text-white mt-1 block">{analyticsData.total_submissions}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 shadow-sm">
              <span className="text-slate-400 block">Accepted Submissions</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">{analyticsData.accepted_count}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 shadow-sm">
              <span className="text-slate-400 block">Overall Success Rate</span>
              <span className="text-2xl font-bold text-white mt-1 block">{analyticsData.acceptance_rate}%</span>
            </div>
          </div>

          <RuntimeHistoryChart
            runtimeHistory={analyticsData.runtime_history}
            memoryHistory={analyticsData.memory_history}
          />
        </div>
      )}

      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#090e18] border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="">All Statuses</option>
              <option value="accepted">Accepted</option>
              <option value="wrong_answer">Wrong Answer</option>
              <option value="time_limit_exceeded">Time Limit Exceeded</option>
              <option value="runtime_error">Runtime Error</option>
            </select>

            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-[#090e18] border border-slate-800 text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="">All Languages</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0d131f] overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#090e18] text-slate-400 font-semibold">
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4 w-28">Language</th>
                  <th className="py-3 px-4 w-24">Runtime</th>
                  <th className="py-3 px-4 w-24">Memory</th>
                  <th className="py-3 px-4 w-28">Attempt #</th>
                  <th className="py-3 px-4 w-32">Date</th>
                  <th className="py-3 px-4 w-16 text-center">Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      Loading submissions...
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No submissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((s) => {
                    const isAccepted = s.status === 'accepted';
                    return (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-center">
                          {isAccepted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-400 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200">
                          <Link to={`/problems/${s.problem_slug}`} className="hover:text-emerald-400 hover:underline transition-colors font-semibold">
                            {s.problem_title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300 capitalize">{s.language}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{s.runtime_ms ? `${s.runtime_ms} ms` : '—'}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{s.memory_kb ? `${(s.memory_kb / 1024).toFixed(1)} MB` : '—'}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">Attempt #{s.attempt_number}</td>
                        <td className="py-3 px-4 text-slate-400">{new Date(s.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleViewCode(s.id)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Inspect Code"
                          >
                            <Code2 className="h-4 w-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Code Modal */}
      {viewedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-xl border border-slate-800 bg-[#0d131f] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-semibold text-white text-xs font-mono">
                Code Inspector ({viewedCode.language})
              </span>
              <button
                onClick={() => setViewedCode(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded font-medium border border-slate-700"
              >
                Close
              </button>
            </div>
            <pre className="bg-[#090e18] border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 overflow-x-auto max-h-96 whitespace-pre-wrap">
              {viewedCode.code}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
