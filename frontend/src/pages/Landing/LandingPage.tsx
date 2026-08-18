import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Terminal,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

interface LanguageSnippet {
  id: string;
  name: string;
  version: string;
  filename: string;
  code: string;
  runtime: string;
  memory: string;
}

const LANGUAGE_SNIPPETS: LanguageSnippet[] = [
  {
    id: 'python',
    name: 'Python',
    version: '3.11',
    filename: 'solution.py',
    runtime: '12 ms',
    memory: '14.2 MB',
    code: `class Solution:
    def solve(self, readings: list[int], target: int) -> list[int]:
        seen = {}
        for i, val in enumerate(readings):
            complement = target - val
            if complement in seen:
                return [seen[complement], i]
            seen[val] = i
        return []`,
  },
  {
    id: 'cpp',
    name: 'C++',
    version: 'g++ 13',
    filename: 'solution.cpp',
    runtime: '2 ms',
    memory: '9.8 MB',
    code: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> solve(vector<int>& readings, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)readings.size(); i++) {
            int comp = target - readings[i];
            if (seen.count(comp)) return {seen[comp], i};
            seen[readings[i]] = i;
        }
        return {};
    }
};`,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    version: 'Node 20',
    filename: 'solution.js',
    runtime: '45 ms',
    memory: '31.6 MB',
    code: `function solve(readings, target) {
    const seen = new Map();
    for (let i = 0; i < readings.length; i++) {
        const comp = target - readings[i];
        if (seen.has(comp)) return [seen.get(comp), i];
        seen.set(readings[i], i);
    }
    return [];
}`,
  },
  {
    id: 'java',
    name: 'Java',
    version: 'OpenJDK 17',
    filename: 'Solution.java',
    runtime: '3 ms',
    memory: '38.4 MB',
    code: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] solve(int[] readings, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < readings.length; i++) {
            int comp = target - readings[i];
            if (seen.containsKey(comp)) return new int[] {seen.get(comp), i};
            seen.put(readings[i], i);
        }
        return new int[0];
    }
}`,
  },
];

const FEATURED_PROBLEMS = [
  { slug: 'signal-pair', title: 'Signal Pair', difficulty: 'easy', topics: ['Array', 'Hash Map'], acceptance: '100%' },
  { slug: 'best-trade-window', title: 'Best Trade Window', difficulty: 'easy', topics: ['Array', 'Greedy'], acceptance: '100%' },
  { slug: 'everyone-except-me', title: 'Everyone Except Me', difficulty: 'medium', topics: ['Array', 'Prefix Sum'], acceptance: '58%' },
  { slug: 'island-counter', title: 'Island Counter', difficulty: 'medium', topics: ['Graph', 'BFS', 'Matrix'], acceptance: '53%' },
  { slug: 'merged-median', title: 'Merged Median', difficulty: 'hard', topics: ['Binary Search', 'Divide & Conquer'], acceptance: '29%' },
];

export const LandingPage: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<string>('python');

  const currentSnippet =
    LANGUAGE_SNIPPETS.find((l) => l.id === selectedLang) || LANGUAGE_SNIPPETS[0];

  return (
    <div className="bg-[#080c14] text-slate-300 min-h-screen">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (NATURAL & HUMAN-CRAFTED)
          ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        {/* Top Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#0d131f] px-3.5 py-1 text-xs text-slate-300 mb-6 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="font-mono text-slate-300">Supports Python · C++ · Java · JavaScript</span>
        </div>

        {/* Natural Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-[1.15]">
          Practice coding interviews with a real online judge.
        </h1>

        {/* Natural Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Solve algorithm problems, follow company-specific sheets, read detailed editorials, and track your progress—all in one place.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/problems">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start Solving
            </Button>
          </Link>

          <Link to="/sheets">
            <Button variant="secondary" size="md" leftIcon={<Layers className="h-4 w-4" />}>
              Company Sheets
            </Button>
          </Link>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. LIVE IDE WORKSPACE PREVIEW (READABLE CODE EDITOR)
          ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] shadow-2xl overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-[#090e18] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-slate-400">
                arena-workspace — Signal Pair
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#0d131f] p-0.5 rounded-lg border border-slate-800">
              {LANGUAGE_SNIPPETS.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                    selectedLang === lang.id
                      ? 'bg-slate-800 text-sky-400 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* IDE Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            {/* Left: Code Snippet (Larger, more readable font) */}
            <div className="lg:col-span-7 p-5 bg-[#090e18]">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono pb-2.5 border-b border-slate-800/80 mb-3.5">
                <span>{currentSnippet.filename}</span>
                <span>{currentSnippet.version}</span>
              </div>
              <pre className="font-mono text-[13px] sm:text-sm text-slate-200 leading-relaxed overflow-x-auto whitespace-pre">
                {currentSnippet.code}
              </pre>
            </div>

            {/* Right: Judge Output Console */}
            <div className="lg:col-span-5 p-5 bg-[#0d131f] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 font-semibold text-white">
                    <Terminal className="h-3.5 w-3.5 text-emerald-400" /> Judge Evaluation
                  </span>
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Accepted
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-[#090e18] border border-slate-800/80 space-y-1">
                    <div className="text-slate-400 text-[11px]">Test Case 1 (Sample)</div>
                    <div className="text-slate-300">Input: readings = [-3, 4, 3, 90], target = 0</div>
                    <div className="text-emerald-400">✓ Output: [0, 2] · Match</div>
                  </div>

                  <div className="p-2.5 rounded bg-[#090e18] border border-slate-800/80 space-y-1">
                    <div className="text-slate-400 text-[11px]">Test Case 2 (Hidden Evaluation)</div>
                    <div className="text-slate-300">Input: readings = [10, -5, 20, -15, 8], target = -20</div>
                    <div className="text-emerald-400">✓ Output: [1, 3] · Match</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Runtime: <strong className="text-emerald-400">{currentSnippet.runtime}</strong></span>
                <span>Memory: <strong className="text-slate-200">{currentSnippet.memory}</strong></span>
                <Link to="/problems/signal-pair">
                  <span className="text-emerald-400 hover:underline flex items-center gap-1">
                    Open IDE <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. PRACTICE PROBLEMS LIST
          ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Popular Practice Problems</h2>
            <p className="text-xs text-slate-400 mt-0.5">Explore standard patterns and test your solutions live.</p>
          </div>
          <Link
            to="/problems"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            View All Problems <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d131f] overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#090e18] text-slate-400 font-semibold">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4 w-28">Difficulty</th>
                <th className="py-3 px-4 hidden sm:table-cell">Topics</th>
                <th className="py-3 px-4 w-24">Acceptance</th>
                <th className="py-3 px-4 w-24 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {FEATURED_PROBLEMS.map((p) => (
                <tr key={p.slug} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-sans font-medium text-white">
                    <Link to={`/problems/${p.slug}`} className="hover:text-sky-400 transition-colors">
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <Badge variant={p.difficulty as any} size="sm">
                      {p.difficulty}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1 font-sans">
                      {p.topics.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{p.acceptance}</td>
                  <td className="py-3 px-4 text-right font-sans">
                    <Link
                      to={`/problems/${p.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300"
                    >
                      Solve <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CLEAN CTA SECTION
          ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 text-center border-t border-slate-800">
        <div className="rounded-2xl border border-slate-800 bg-[#0d131f] p-8 sm:p-12 space-y-4 max-w-2xl mx-auto shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Start solving algorithmic challenges.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Pick a problem, write your solution in Python, C++, Java, or JS, and run against hidden test cases instantly.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link to="/problems">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Start Solving
              </Button>
            </Link>
            <Link to="/sheets">
              <Button variant="secondary" size="md">
                Explore Roadmaps
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
