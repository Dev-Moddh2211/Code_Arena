import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Terminal,
  Code2,
  Cpu,
  Layers,
  ChevronRight,
  Sparkles,
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
    name: 'Python 3',
    version: '3.11.10',
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
    name: 'C++ 17',
    version: 'GCC 13.2',
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
    version: 'Node.js 20',
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
    name: 'Java 17',
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
    <div className="bg-[#1a1a1a] text-neutral-300 min-h-screen">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (CLEAN & CONFIDENT)
          ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 pb-12 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Practice coding interviews with an isolated online judge.
        </h1>

        <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Solve algorithmic problems in Python, C++, Java, and JavaScript with fast subprocess execution, testcase normalization, and company roadmaps.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link to="/problems">
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="bg-[#FFA116] hover:bg-[#ffb038] text-neutral-900 font-bold border-none rounded-lg px-5 py-2.5 text-sm"
            >
              Start Solving
            </Button>
          </Link>

          <Link to="/sheets">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Layers className="h-4 w-4" />}
              className="bg-[#262626] hover:bg-[#303030] text-neutral-200 border border-[#383838] rounded-lg px-5 py-2.5 text-sm font-medium"
            >
              Explore Sheets
            </Button>
          </Link>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. LIVE WORKSPACE PREVIEW (FOCAL POINT)
          ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
        <div className="rounded-2xl border border-[#2e2e2e] bg-[#1e1e1e] overflow-hidden">
          {/* Top Bar with Language Tabs */}
          <div className="flex items-center justify-between border-b border-[#2a2a2a] bg-[#222222] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#383838]" />
              <span className="h-3 w-3 rounded-full bg-[#383838]" />
              <span className="h-3 w-3 rounded-full bg-[#383838]" />
              <span className="ml-2 font-mono text-xs text-neutral-400">
                solution-preview — Signal Pair
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#1a1a1a] p-0.5 rounded-lg border border-[#2e2e2e]">
              {LANGUAGE_SNIPPETS.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLang(lang.id)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    selectedLang === lang.id
                      ? 'bg-[#2e2e2e] text-white font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Code & Evaluation Panels */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#2a2a2a]">
            {/* Left: Code */}
            <div className="md:col-span-7 p-4 sm:p-5 bg-[#171717]">
              <div className="flex items-center justify-between text-xs text-neutral-500 font-mono pb-2 border-b border-[#262626] mb-3">
                <span>{currentSnippet.filename}</span>
                <span>{currentSnippet.version}</span>
              </div>
              <pre className="font-mono text-xs sm:text-[13px] text-neutral-200 leading-relaxed overflow-x-auto whitespace-pre">
                {currentSnippet.code}
              </pre>
            </div>

            {/* Right: Evaluation */}
            <div className="md:col-span-5 p-4 sm:p-5 bg-[#1e1e1e] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400 border-b border-[#2a2a2a] pb-2">
                  <span className="flex items-center gap-1.5 font-semibold text-white">
                    <Terminal className="h-3.5 w-3.5 text-emerald-400" /> Output Comparator
                  </span>
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-semibold">
                    Accepted
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-[#171717] border border-[#282828] space-y-1">
                    <div className="text-neutral-500 text-[11px]">Test Case 1 (Sample)</div>
                    <div className="text-neutral-300">Input: readings = [-3, 4, 3, 90], target = 0</div>
                    <div className="text-emerald-400">✓ Output: [0, 2] · Match</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#171717] border border-[#282828] space-y-1">
                    <div className="text-neutral-500 text-[11px]">Test Case 2 (Hidden Evaluation)</div>
                    <div className="text-neutral-300">Input: readings = [10, -5, 20, -15, 8], target = -20</div>
                    <div className="text-emerald-400">✓ Output: [1, 3] · Match</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2a2a2a] flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Runtime: <strong className="text-emerald-400">{currentSnippet.runtime}</strong></span>
                <span>Memory: <strong className="text-neutral-200">{currentSnippet.memory}</strong></span>
                <Link to="/problems/signal-pair">
                  <span className="text-[#FFA116] hover:underline flex items-center gap-1">
                    Open in Editor <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CLEAN PRODUCT CAPABILITIES (MINIMALIST, NO HEAVY CARDS)
          ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12 border-t border-[#282828]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Cpu className="h-4 w-4 text-[#FFA116]" />
              <h3>Sandboxed Execution</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Compile and run Python, C++ 17, Java 17, and Node.js 20 with isolated process limits and memory safeguards.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Terminal className="h-4 w-4 text-[#FFA116]" />
              <h3>Smart Comparator</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Handles whitespace normalization, floating point tolerances, and unordered array matching for robust verdicts.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Layers className="h-4 w-4 text-[#FFA116]" />
              <h3>Curated Interview Sheets</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Follow roadmaps for Google, Amazon, Meta, and Top 150 interview patterns with full editorial walkthroughs.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. POPULAR PROBLEMS LIST
          ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12 border-t border-[#282828]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Popular Practice Problems</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Explore standard problem patterns and test your solutions live.</p>
          </div>
          <Link
            to="/problems"
            className="text-xs font-semibold text-[#FFA116] hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-[#282828] bg-[#202020] overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#282828] bg-[#191919] text-neutral-400 font-semibold">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4 w-28">Difficulty</th>
                <th className="py-3 px-4 hidden sm:table-cell">Topics</th>
                <th className="py-3 px-4 w-24">Acceptance</th>
                <th className="py-3 px-4 w-20 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282828]">
              {FEATURED_PROBLEMS.map((p) => (
                <tr key={p.slug} className="hover:bg-[#282828]/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-white">
                    <Link to={`/problems/${p.slug}`} className="hover:text-[#FFA116] transition-colors">
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={p.difficulty as any} size="sm">
                      {p.difficulty}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.topics.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 text-[10px] rounded bg-[#2a2a2a] text-neutral-300 border border-[#383838]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-neutral-400 font-mono">{p.acceptance}</td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/problems/${p.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#FFA116] hover:underline"
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
    </div>
  );
};
