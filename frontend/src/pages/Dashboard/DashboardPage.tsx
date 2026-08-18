import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { dashboardApi, dailyChallengeApi } from '../../api';
import { DashboardPayload, DailyChallengeResponse } from '../../types';
import { StreakHeatmap } from '../../components/charts/StreakHeatmap';
import { DifficultyDonut } from '../../components/charts/DifficultyDonut';
import { TopicMastery } from '../../components/charts/TopicMastery';
import { LanguagePie } from '../../components/charts/LanguagePie';
import { Button } from '../../components/common/Button';

export const DashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallengeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const [dashData, dailyData] = await Promise.all([
          dashboardApi.get(),
          dailyChallengeApi.get().catch(() => null),
        ]);
        setDashboard(dashData);
        setDailyChallenge(dailyData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading || !dashboard) {
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
      {/* Daily Challenge Prompt Banner */}
      {dailyChallenge && dailyChallenge.problem && (
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Featured Daily Question
                </span>
                <span className="text-[11px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold font-mono">
                  +10 Streak Bonus
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {dailyChallenge.problem.title}
              </h2>
            </div>
          </div>

          <Link to={`/problems/${dailyChallenge.problem.slug}`}>
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              Solve Daily Challenge
            </Button>
          </Link>
        </div>
      )}

      {/* 365-Day Activity Heatmap */}
      <StreakHeatmap
        heatmapData={dashboard.heatmap}
        currentStreak={dashboard.current_streak}
        longestStreak={dashboard.longest_streak}
        totalSubmissionsYear={dashboard.total_submissions}
      />

      {/* 2-Column Analytics: Difficulty Breakdown & Mastery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DifficultyDonut data={dashboard.difficulty_breakdown} />
        <TopicMastery topics={dashboard.topic_progress} />
      </div>

      {/* Languages & Earned Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LanguagePie stats={dashboard.language_usage} />

        {/* Badges / Achievements */}
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-400" />
            Earned Badges ({dashboard.achievements.filter((a) => a.earned).length} / {dashboard.achievements.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {dashboard.achievements.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-lg border p-3 flex items-start gap-3 transition-colors ${
                  badge.earned
                    ? 'border-slate-800 bg-[#090e18] shadow-xs'
                    : 'border-slate-800/40 bg-slate-900/20 opacity-40'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs flex-shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{badge.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
