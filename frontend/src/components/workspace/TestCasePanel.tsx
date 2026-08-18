import React, { useState } from 'react';
import { TestCase } from '../../types';

interface TestCasePanelProps {
  sampleCases: TestCase[];
  customInput: string;
  onCustomInputChange: (val: string) => void;
  isCustom: boolean;
  onToggleCustom: (isCustom: boolean) => void;
}

export const TestCasePanel: React.FC<TestCasePanelProps> = ({
  sampleCases,
  customInput,
  onCustomInputChange,
  isCustom,
  onToggleCustom,
}) => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);

  return (
    <div className="flex flex-col h-full bg-[#0d131f] border border-[#1b2436] rounded-xl overflow-hidden shadow-sm">
      {/* Tab bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#1b2436] bg-[#090e18] text-xs">
        {sampleCases.map((tc, idx) => (
          <button
            key={tc.id || idx}
            onClick={() => {
              onToggleCustom(false);
              setSelectedCaseIdx(idx);
            }}
            className={`px-3 py-1 rounded-md font-mono text-[11px] font-medium transition-colors ${
              !isCustom && selectedCaseIdx === idx
                ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Case {idx + 1}
          </button>
        ))}

        <button
          onClick={() => onToggleCustom(true)}
          className={`px-3 py-1 rounded-md font-mono text-[11px] font-medium transition-colors ${
            isCustom
              ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-xs font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Custom Input
        </button>
      </div>

      {/* Content with increased spacing between Input and Expected Output */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto font-mono text-xs bg-[#0d131f]">
        {isCustom ? (
          <div className="space-y-2 h-full flex flex-col">
            <label className="text-slate-400 font-sans text-xs font-semibold">
              Arguments JSON Array (e.g. [[2,7,11,15], 9]):
            </label>
            <textarea
              value={customInput}
              onChange={(e) => onCustomInputChange(e.target.value)}
              placeholder="[[2, 7, 11, 15], 9]"
              className="flex-1 w-full p-3 rounded-lg border border-slate-800 bg-[#090e18] text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-500 resize-none"
            />
          </div>
        ) : (
          sampleCases[selectedCaseIdx] && (
            <div className="space-y-4">
              {/* Input Section */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-sans font-semibold uppercase tracking-wider block">
                  Input:
                </span>
                <div className="p-3 rounded-lg bg-[#090e18] border border-slate-800 text-slate-200 text-xs break-all leading-relaxed">
                  {sampleCases[selectedCaseIdx].input_json}
                </div>
              </div>

              {/* Expected Output Section */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-sans font-semibold uppercase tracking-wider block">
                  Expected Output:
                </span>
                <div className="p-3 rounded-lg bg-[#090e18] border border-slate-800 text-slate-200 font-semibold text-xs break-all leading-relaxed">
                  {sampleCases[selectedCaseIdx].expected_output_json}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
