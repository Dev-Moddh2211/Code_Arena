import React, { useState, useEffect } from 'react';
import { Edit3, Check } from 'lucide-react';
import { problemsApi } from '../../api';

interface NotesTabProps {
  problemId: string;
}

export const NotesTab: React.FC<NotesTabProps> = ({ problemId }) => {
  const [content, setContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const note = await problemsApi.getNote(problemId);
        setContent(note.content_md || '');
      } catch (err) {
        setContent('');
      }
    };
    fetchNote();
  }, [problemId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await problemsApi.updateNote(problemId, content);
      setSavedAt(new Date());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-4 text-xs text-slate-300 h-full flex flex-col bg-[#0d131f]">
      <div className="flex items-center justify-between pb-3 border-b border-[#1b2436]">
        <div className="flex items-center gap-2">
          <Edit3 className="h-4 w-4 text-emerald-400" />
          <h3 className="font-bold text-white text-sm">Private Scratchpad & Notes</h3>
        </div>

        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-400" /> Auto-saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>

      <p className="text-slate-400 text-[11px]">
        Keep personal interview takeaways, edge-case reminders, or recurrence relations. Only you can view these notes.
      </p>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="e.g. Remember to handle negative numbers in two pointers..."
        className="flex-1 w-full p-3 rounded-xl border border-slate-800 bg-[#090e18] text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-500 resize-none leading-relaxed shadow-sm"
      />
    </div>
  );
};
