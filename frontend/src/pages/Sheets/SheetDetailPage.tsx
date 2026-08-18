import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Clock, Building2 } from 'lucide-react';
import { sheetsApi } from '../../api';
import { SheetDetail } from '../../types';
import { Badge } from '../../components/common/Badge';

export const SheetDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [sheet, setSheet] = useState<SheetDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) return;
    const fetchSheet = async () => {
      try {
        setIsLoading(true);
        const data = await sheetsApi.getBySlug(slug);
        setSheet(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSheet();
  }, [slug]);

  if (isLoading || !sheet) {
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
        to="/sheets"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Company Sheets
      </Link>

      <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1.5">
            <Building2 className="h-4 w-4" /> Curated Roadmap
          </div>
          <h1 className="text-2xl font-bold text-white">{sheet.name}</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {sheet.description}
          </p>
        </div>

        <div className="flex flex-col justify-center md:items-end min-w-[200px]">
          <div className="text-xs font-medium text-slate-300 mb-1">
            Completed <strong className="text-emerald-400">{sheet.solved_problems}</strong> of {sheet.total_problems}
          </div>
          <div className="h-2 w-full md:w-48 rounded-full bg-slate-800 overflow-hidden mb-1">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${sheet.progress_percentage}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{sheet.progress_percentage}% Solved</span>
        </div>
      </div>

      {/* Problem list */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#090e18] text-slate-400 font-semibold">
              <th className="py-3 px-4 w-12 text-center">Status</th>
              <th className="py-3 px-4">Problem</th>
              <th className="py-3 px-4 w-28">Difficulty</th>
              <th className="py-3 px-4 w-28">Acceptance</th>
              <th className="py-3 px-4 hidden md:table-cell">Tags</th>
              <th className="py-3 px-4 w-20 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sheet.problems.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-center">
                  {p.user_status === 'solved' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                  ) : p.user_status === 'attempted' ? (
                    <Clock className="h-4 w-4 text-amber-400 mx-auto" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-slate-600 mx-auto" />
                  )}
                </td>
                <td className="py-3 px-4 font-medium text-slate-200">
                  <Link to={`/problems/${p.slug}`} className="hover:text-sky-400 transition-colors font-semibold">
                    {p.title}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={p.difficulty} size="sm">
                    {p.difficulty}
                  </Badge>
                </td>
                <td className="py-3 px-4 font-mono text-slate-400">{p.acceptance_rate}%</td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {p.topic_tags.slice(0, 3).map((t) => (
                      <span key={t} className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">{p.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
