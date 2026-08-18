import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { BookOpen } from 'lucide-react';

interface EditorialTabProps {
  editorialMd?: string | null;
}

export const EditorialTab: React.FC<EditorialTabProps> = ({ editorialMd }) => {
  if (!editorialMd) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs bg-[#0d131f]">
        <BookOpen className="h-8 w-8 text-slate-600 mx-auto mb-2" />
        <p className="font-semibold text-slate-300">No official editorial published yet.</p>
        <p className="mt-1 text-slate-500">Try implementing your own solution or unlock hints!</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 text-xs text-slate-300 leading-relaxed bg-[#0d131f]">
      <div className="flex items-center gap-2 pb-3 border-b border-[#1b2436]">
        <BookOpen className="h-4 w-4 text-emerald-400" />
        <h3 className="font-bold text-white text-sm">Official Solution & Approach</h3>
      </div>

      <div className="prose prose-invert prose-sm max-w-none text-slate-300">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {editorialMd}
        </ReactMarkdown>
      </div>
    </div>
  );
};
