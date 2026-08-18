import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal } from 'lucide-react';
import { leaderboardApi } from '../../api';
import { LeaderboardEntry } from '../../types';

export const LeaderboardPage: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const data = await leaderboardApi.get();
        setEntries(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal className="h-5 w-5 text-amber-400 mx-auto" />;
      case 2:
        return <Medal className="h-5 w-5 text-slate-300 mx-auto" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600 mx-auto" />;
      default:
        return <span className="font-mono text-slate-500 font-bold">#{rank}</span>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#080c14] text-slate-300 min-h-[calc(100vh-3.5rem)]">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-400" /> Platform Leaderboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Top engineers ranked by total problem-solving points and mastery. (Excludes demo reviewer profiles per spec).
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#0d131f] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#090e18] text-slate-400 font-semibold">
              <th className="py-3 px-4 w-16 text-center">Rank</th>
              <th className="py-3 px-4">Coder</th>
              <th className="py-3 px-4 w-28 text-center">Solved</th>
              <th className="py-3 px-4 w-40 hidden sm:table-cell text-center">Breakdown</th>
              <th className="py-3 px-4 w-28 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  Loading rankings...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  No community leaderboard entries found.
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.user_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-center">{getRankBadge(e.rank)}</td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/profile/${e.username}`}
                      className="flex items-center gap-2.5 font-medium text-white hover:text-emerald-400 transition-colors"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-emerald-400 font-bold text-xs uppercase border border-slate-700">
                        {e.username.slice(0, 1)}
                      </div>
                      <div>
                        <span className="font-semibold text-white block">{e.username}</span>
                        {e.bio && <span className="text-[11px] text-slate-400 truncate block max-w-xs">{e.bio}</span>}
                      </div>
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-400">
                    {e.solved_count}
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell text-center font-mono text-[11px]">
                    <span className="text-emerald-400 font-medium">{e.easy_solved}E</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-amber-400 font-medium">{e.medium_solved}M</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-rose-400 font-medium">{e.hard_solved}H</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    {e.total_score}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
