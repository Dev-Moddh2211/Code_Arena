import React from 'react';
import Editor from '@monaco-editor/react';
import { RotateCcw, Copy, Check } from 'lucide-react';

interface CodeEditorProps {
  language: string;
  code: string;
  onChange: (value: string | undefined) => void;
  onReset: () => void;
  onLanguageChange: (lang: string) => void;
  languages: { id: string; name: string }[];
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  code,
  onChange,
  onReset,
  onLanguageChange,
  languages,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'python':
        return 'python';
      case 'javascript':
        return 'javascript';
      case 'cpp':
        return 'cpp';
      case 'java':
        return 'java';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d131f] border border-[#1b2436] rounded-xl overflow-hidden shadow-sm">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1b2436] bg-[#090e18] text-xs">
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs font-medium text-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">Monaco Editor</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onReset}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset to Starter Code"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Monaco Editor Component with Dark Theme */}
      <div className="flex-1 min-h-0 bg-[#0d131f]">
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          value={code}
          theme="vs-dark"
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            fontFamily: "'JetBrains Mono', monospace",
            renderLineHighlight: 'all',
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
};
