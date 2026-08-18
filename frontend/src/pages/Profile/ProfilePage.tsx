import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import { leaderboardApi } from '../../api';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!username) return;
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await leaderboardApi.getProfile(username);
        setProfile(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (isLoading || !profile) {
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
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6 bg-[#080c14] text-slate-300 min-h-[calc(100vh-3.5rem)]">
      <Link
        to="/leaderboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Leaderboard
      </Link>

      <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-2xl font-bold text-emerald-400 uppercase shadow-xs border border-slate-700">
            {profile.username.slice(0, 1)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{profile.username}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{profile.bio || 'Algorithm Practitioner'}</p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
              <Calendar className="h-3 w-3" /> Member since {profile.created_at}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800 w-full sm:w-auto justify-around sm:justify-start">
          <div className="text-center sm:text-right">
            <span className="text-slate-500 block">Total Score</span>
            <span className="text-xl font-bold text-white">{profile.total_score}</span>
          </div>
          <div className="text-center sm:text-right">
            <span className="text-slate-500 block">Solved</span>
            <span className="text-xl font-bold text-emerald-400">{profile.total_solved}</span>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-3 gap-4 font-mono text-xs text-center">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <span className="text-emerald-400 font-semibold block text-sm">Easy Solved</span>
          <span className="text-2xl font-bold text-white mt-1 block">{profile.easy_solved}</span>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <span className="text-amber-400 font-semibold block text-sm">Medium Solved</span>
          <span className="text-2xl font-bold text-white mt-1 block">{profile.medium_solved}</span>
        </div>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
          <span className="text-rose-400 font-semibold block text-sm">Hard Solved</span>
          <span className="text-2xl font-bold text-white mt-1 block">{profile.hard_solved}</span>
        </div>
      </div>
    </div>
  );
};
