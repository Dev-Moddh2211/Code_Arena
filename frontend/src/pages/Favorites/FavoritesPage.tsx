import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { problemsApi } from '../../api';
import { ProblemListItem } from '../../types';
import { Badge } from '../../components/common/Badge';

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<ProblemListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        setIsLoading(true);
        const data = await problemsApi.getFavorites();
        setFavorites(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavs();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#080c14] text-slate-300 min-h-[calc(100vh-3.5rem)]">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-400 fill-amber-400" /> Bookmarked Problems
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Quickly access questions you saved for review or mock interview practice.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-12 text-center text-slate-400 text-xs shadow-sm">
          <Star className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="font-semibold text-white">No bookmarked problems yet.</p>
          <p className="mt-1 text-slate-400">Click the star icon on any problem workspace to save it to your bookmarks.</p>
          <Link to="/problems" className="inline-block mt-4 text-emerald-400 hover:underline font-medium">
            Browse Problems
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#090e18] text-slate-400 font-semibold">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4 w-28">Difficulty</th>
                <th className="py-3 px-4 w-28">Acceptance</th>
                <th className="py-3 px-4 hidden md:table-cell">Tags</th>
                <th className="py-3 px-4 w-20 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {favorites.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-200">
                    <Link to={`/problems/${p.slug}`} className="hover:text-emerald-400 hover:underline transition-colors font-semibold">
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
      )}
    </div>
  );
};
