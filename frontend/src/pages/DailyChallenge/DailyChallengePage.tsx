import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dailyChallengeApi } from '../../api';

export const DailyChallengePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const res = await dailyChallengeApi.get();
        if (res && res.problem) {
          navigate(`/problems/${res.problem.slug}`, { replace: true });
        } else {
          navigate('/problems', { replace: true });
        }
      } catch (err) {
        navigate('/problems', { replace: true });
      }
    };
    fetchAndRedirect();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-zinc-400 font-medium">Redirecting to today's featured daily challenge...</span>
      </div>
    </div>
  );
};
