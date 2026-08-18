import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ThumbsUp, ThumbsDown, Star, Tag, Building2, Layers } from 'lucide-react';
import { ProblemDetail, ProblemListItem } from '../../types';
import { Badge } from '../common/Badge';
import { Link } from 'react-router-dom';

interface DescriptionTabProps {
  problem: ProblemDetail;
  similarProblems: ProblemListItem[];
  onReaction: (reaction: 'like' | 'dislike') => void;
  onToggleFavorite: () => void;
}

export const DescriptionTab: React.FC<DescriptionTabProps> = ({
  problem,
  similarProblems,
  onReaction,
  onToggleFavorite,
}) => {
  return (
    <div className="p-4 sm:p-5 md:p-6 space-y-5 text-[13.5px] sm:text-[14px] text-slate-200 leading-relaxed bg-[#0d131f] min-w-0 max-w-full overflow-hidden break-words">
      {/* Title & Metas */}
      <div className="space-y-3 pb-4 border-b border-[#1b2436] min-w-0">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight break-words min-w-0">{problem.title}</h1>
          <button
            onClick={onToggleFavorite}
            className={`shrink-0 p-1.5 rounded-lg border transition-colors ${
              problem.is_favorited
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Bookmark Question"
          >
            <Star className={`h-4 w-4 ${problem.is_favorited ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={problem.difficulty} size="sm">
            {problem.difficulty}
          </Badge>
          <span className="text-[11px] text-slate-600">·</span>
          <span className="text-xs font-mono text-slate-400">
            Acceptance: {problem.acceptance_rate}%
          </span>
          <span className="text-[11px] text-slate-600">·</span>
          <span className="text-xs font-mono text-slate-400">Points: {problem.points}</span>
        </div>
      </div>

      {/* Problem Description Markdown */}
      <div className="prose prose-invert prose-base max-w-none text-slate-200 text-[13.5px] sm:text-[14px] leading-relaxed space-y-4 font-sans min-w-0 overflow-hidden break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {problem.description_md}
        </ReactMarkdown>
      </div>

      {/* Constraints */}
      {problem.constraints_md && (
        <div className="rounded-xl border border-slate-800 bg-[#090e18] p-3.5 sm:p-4 space-y-2 min-w-0 overflow-hidden">
          <h4 className="font-semibold text-white text-xs font-sans uppercase tracking-wider text-slate-400">Constraints:</h4>
          <div className="prose prose-invert prose-sm max-w-none font-mono text-xs text-slate-300 min-w-0 overflow-hidden break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {problem.constraints_md}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Topic & Company Tags (Clean metadata pills with gray outline) */}
      <div className="space-y-3 pt-3 border-t border-[#1b2436]">
        {problem.topic_tags && problem.topic_tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-1">
              <Tag className="h-3.5 w-3.5 text-slate-500" /> Topics:
            </span>
            {problem.topic_tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-xs border border-slate-700 font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {problem.company_tags && problem.company_tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-1">
              <Building2 className="h-3.5 w-3.5 text-slate-500" /> Companies:
            </span>
            {problem.company_tags.map((c) => (
              <span
                key={c}
                className="px-2 py-0.5 rounded-md bg-slate-800/50 text-slate-300 text-xs border border-slate-700/80 hover:border-slate-600 transition-colors font-medium"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Likes / Dislikes */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#1b2436]">
        <button
          onClick={() => onReaction('like')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            problem.user_reaction === 'like'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{problem.likes_count}</span>
        </button>

        <button
          onClick={() => onReaction('dislike')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            problem.user_reaction === 'dislike'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          <span>{problem.dislikes_count}</span>
        </button>
      </div>

      {/* Similar Problems */}
      {similarProblems.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-[#1b2436]">
          <h4 className="font-semibold text-slate-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-slate-500" /> Similar Problems:
          </h4>
          <div className="space-y-1.5">
            {similarProblems.map((sim) => (
              <Link
                key={sim.id}
                to={`/problems/${sim.slug}`}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-[#090e18] hover:border-slate-700 transition-colors"
              >
                <span className="font-medium text-slate-200 text-xs">{sim.title}</span>
                <Badge variant={sim.difficulty} size="sm">
                  {sim.difficulty}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
