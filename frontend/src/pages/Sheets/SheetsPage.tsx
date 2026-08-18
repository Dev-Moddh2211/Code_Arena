import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';
import { sheetsApi } from '../../api';
import { SheetSummary } from '../../types';

export const SheetsPage: React.FC = () => {
  const [sheets, setSheets] = useState<SheetSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        setIsLoading(true);
        const data = await sheetsApi.list();
        setSheets(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSheets();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#080c14] text-slate-300 min-h-[calc(100vh-3.5rem)]">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Building2 className="h-6 w-6 text-emerald-400" /> Curated Company Problem Sheets
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Targeted DSA roadmaps for top tech companies and patterns. Track your roadmap progress.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sheets.map((sheet) => (
            <div
              key={sheet.id}
              className="rounded-xl border border-slate-800 bg-[#0d131f] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="space-y-2">
                <div className="h-9 w-9 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-sky-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">{sheet.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{sheet.description}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Progress</span>
                    <span>
                      <strong className="text-emerald-400">{sheet.solved_problems}</strong> / {sheet.total_problems}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${sheet.progress_percentage}%` }}
                    />
                  </div>
                </div>

                <Link
                  to={`/sheets/${sheet.slug}`}
                  className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-slate-800 text-white py-2 text-xs font-semibold hover:bg-slate-700 transition-colors border border-slate-700 shadow-sm"
                >
                  <span>Open Roadmap</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
