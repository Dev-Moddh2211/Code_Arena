import React, { useState } from 'react';
import { ExecutionResult, Submission } from '../../types';
import { CheckCircle2, XCircle, Clock, Cpu, AlertTriangle, Terminal } from 'lucide-react';

interface ConsolePanelProps {
  result: ExecutionResult | Submission | null;
  isRunning: boolean;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ result, isRunning }) => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);

  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0d131f] border border-[#1b2436] rounded-xl p-6 shadow-sm">
        <svg className="animate-spin h-6 w-6 text-emerald-400 mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs text-slate-300 font-medium">Executing code in sandbox...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0d131f] border border-[#1b2436] rounded-xl p-6 text-slate-500 text-xs shadow-sm font-mono">
        <span>Click "Run" to test sample inputs or "Submit" for full judge evaluation.</span>
      </div>
    );
  }

  const status = result.status;
  const isAccepted = status === 'accepted';
  const isCompileError = status === 'compile_error';
  const isRuntimeError = status === 'runtime_error';
  const isTLE = status === 'time_limit_exceeded';
  const isMLE = status === 'memory_limit_exceeded';
  const testResults = result.test_results || [];

  const getStatusLabel = () => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'compile_error':
        return 'Compilation Error';
      case 'runtime_error':
        return 'Runtime Error';
      case 'time_limit_exceeded':
        return 'Time Limit Exceeded';
      case 'memory_limit_exceeded':
        return 'Memory Limit Exceeded';
      case 'wrong_answer':
        return 'Wrong Answer';
      default:
        return status.replace(/_/g, ' ');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d131f] border border-[#1b2436] rounded-xl overflow-hidden shadow-sm">
      {/* Top Verdict Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1b2436] bg-[#090e18]">
        <div className="flex items-center gap-2">
          {isAccepted ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs font-mono">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Accepted</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs font-mono">
              <XCircle className="h-4 w-4 text-rose-400" />
              <span>{getStatusLabel()}</span>
            </div>
          )}
        </div>

        {/* Diagnostics (Runtime / Memory) */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          {result.runtime_ms !== undefined && result.runtime_ms !== null && !isCompileError && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-500" />
              {result.runtime_ms} ms
            </span>
          )}
          {result.memory_kb !== undefined && result.memory_kb !== null && !isCompileError && (
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3 text-slate-500" />
              {(result.memory_kb / 1024).toFixed(1)} MB
            </span>
          )}
        </div>
      </div>

      {/* Case Tabs (only if test cases were executed) */}
      {!isCompileError && testResults.length > 0 && (
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-slate-800 bg-[#090e18] text-xs overflow-x-auto">
          {testResults.map((tc, idx) => (
            <button
              key={tc.test_case_id || idx}
              onClick={() => setSelectedCaseIdx(idx)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                selectedCaseIdx === idx
                  ? 'bg-slate-800 text-sky-400 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  tc.passed ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              Case {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Detail Content Pane */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-3 bg-[#0d131f]">
        {/* COMPILATION ERROR VIEW (Never swallows stderr, stops test execution) */}
        {isCompileError && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-rose-400 font-sans font-semibold text-xs">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span>Compiler Error Output (stderr):</span>
            </div>
            <pre className="p-3.5 rounded-lg bg-[#090e18] border border-rose-500/30 text-rose-300 text-xs font-mono leading-relaxed whitespace-pre-wrap break-all overflow-x-auto shadow-inner">
              {result.error_message || (result as any).stderr || 'Compilation Failed with non-zero exit code.'}
            </pre>
            <p className="text-[11px] text-slate-500 font-sans">
              Test cases were not executed due to compilation/syntax failure.
            </p>
          </div>
        )}

        {/* TEST CASES RESULT VIEW */}
        {!isCompileError && testResults.length > 0 && testResults[selectedCaseIdx] && (
          <div className="space-y-3">
            {testResults[selectedCaseIdx].input_json !== null &&
              testResults[selectedCaseIdx].input_json !== undefined && (
                <div>
                  <span className="text-[11px] text-slate-400 font-sans font-semibold block mb-1">
                    Input:
                  </span>
                  <div className="p-2.5 rounded-lg bg-[#090e18] border border-slate-800 text-slate-200 break-all">
                    {testResults[selectedCaseIdx].input_json}
                  </div>
                </div>
              )}

            {testResults[selectedCaseIdx].actual_output_json !== null &&
              testResults[selectedCaseIdx].actual_output_json !== undefined && (
                <div>
                  <span className="text-[11px] text-slate-400 font-sans font-semibold block mb-1">
                    Output:
                  </span>
                  <div
                    className={`p-2.5 rounded-lg border break-all ${
                      testResults[selectedCaseIdx].passed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-medium'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300 font-medium'
                    }`}
                  >
                    {testResults[selectedCaseIdx].actual_output_json || '<no output>'}
                  </div>
                </div>
              )}

            {testResults[selectedCaseIdx].expected_output_json !== null &&
              testResults[selectedCaseIdx].expected_output_json !== undefined && (
                <div>
                  <span className="text-[11px] text-slate-400 font-sans font-semibold block mb-1">
                    Expected:
                  </span>
                  <div className="p-2.5 rounded-lg bg-[#090e18] border border-slate-800 text-slate-200 break-all">
                    {testResults[selectedCaseIdx].expected_output_json}
                  </div>
                </div>
              )}

            {testResults[selectedCaseIdx].error_message && (
              <div>
                <span className="text-[11px] text-rose-400 font-sans font-semibold block mb-1">
                  Runtime Error / Exception:
                </span>
                <pre className="p-3 rounded-lg bg-[#090e18] border border-rose-500/30 text-rose-300 text-xs font-mono whitespace-pre-wrap break-all leading-relaxed shadow-inner">
                  {testResults[selectedCaseIdx].error_message}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* GENERAL RUNTIME / TLE / MLE ERROR VIEW (If no per-case result available) */}
        {!isCompileError && testResults.length === 0 && result.error_message && (
          <div className="p-3.5 rounded-lg bg-[#090e18] border border-rose-500/30 text-rose-300 space-y-1.5">
            <span className="font-semibold block text-xs font-sans">Runtime Diagnostic:</span>
            <pre className="whitespace-pre-wrap text-xs font-mono leading-relaxed break-all">
              {result.error_message}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
