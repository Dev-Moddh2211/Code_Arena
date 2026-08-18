import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  Circle,
  Shuffle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { problemsApi } from '../../api';
import { ProblemListItem } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

interface ProblemListResponse {
  items: ProblemListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const ProblemsPage: React.FC = () => {
  const navigate = useNavigate();

  // Filter and search state
  const [search, setSearch] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const [data, setData] = useState<ProblemListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Available Filter Chips
  const topicsList = [
    'Array',
    'Hash Map',
    'Two Pointers',
    'Sliding Window',
    'Dynamic Programming',
    'Graph',
    'BFS',
    'Binary Search',
    'String',
  ];

  const companiesList = ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Uber'];

  // Fetch Problems on filter changes
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        const res = await problemsApi.list({
          search: search || undefined,
          difficulty: difficulty || undefined,
          topic: selectedTopic || undefined,
          company: selectedCompany || undefined,
          status: status || undefined,
          page,
          page_size: 20,
        });
        setData(res);
      } catch (err) {
        console.error('Failed to load problems', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, [search, difficulty, selectedTopic, selectedCompany, status, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleRandomProblem = async () => {
    try {
      const rand = await problemsApi.getRandom();
      navigate(`/problems/${rand.slug}`);
    } catch (e) {
      console.error(e);
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setDifficulty('');
    setSelectedTopic('');
    setSelectedCompany('');
    setStatus('');
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#080c14] text-slate-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Problem Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Solve algorithmic problems with real-time subprocess judge execution.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleRandomProblem}
          leftIcon={<Shuffle className="h-3.5 w-3.5" />}
        >
          Pick Random
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by problem title..."
              className="w-full bg-[#090e18] border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:bg-[#0d131f]"
            />
          </form>

          {/* Difficulty Dropdown */}
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto bg-[#090e18] border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto bg-[#090e18] border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            <option value="">All Statuses</option>
            <option value="solved">Solved</option>
            <option value="attempted">Attempted</option>
            <option value="todo">Unsolved</option>
          </select>

          {(search || difficulty || selectedTopic || selectedCompany || status) && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-slate-400 hover:text-white underline whitespace-nowrap px-2"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Topic Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Topics:</span>
          {topicsList.map((top) => (
            <button
              key={top}
              onClick={() => {
                setSelectedTopic(selectedTopic === top ? '' : top);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedTopic === top
                  ? 'bg-slate-800 text-sky-400 border border-slate-700 font-semibold'
                  : 'bg-[#090e18] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {top}
            </button>
          ))}
        </div>

        {/* Company Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Companies:</span>
          {companiesList.map((comp) => (
            <button
              key={comp}
              onClick={() => {
                setSelectedCompany(selectedCompany === comp ? '' : comp);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedCompany === comp
                  ? 'bg-slate-800 text-sky-400 border border-slate-700 font-semibold'
                  : 'bg-[#090e18] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {comp}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#090e18] text-slate-400 font-semibold">
              <th className="py-3 px-4 w-12 text-center">Status</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4 w-28">Difficulty</th>
              <th className="py-3 px-4 w-28">Acceptance</th>
              <th className="py-3 px-4 hidden md:table-cell">Topics</th>
              <th className="py-3 px-4 w-20 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  Loading problems...
                </td>
              </tr>
            ) : data && data.items.length > 0 ? (
              data.items.map((p: ProblemListItem) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-center">
                    {p.user_status === 'solved' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : p.user_status === 'attempted' ? (
                      <Clock className="h-4 w-4 text-amber-400 mx-auto" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">
                    <Link
                      to={`/problems/${p.slug}`}
                      className="hover:text-sky-400 transition-colors font-semibold"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <Badge variant={p.difficulty} size="sm">
                      {p.difficulty}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{p.acceptance_rate}%</td>
                  <td className="py-3 px-4 hidden md:table-cell font-sans">
                    <div className="flex flex-wrap gap-1">
                      {p.topic_tags.slice(0, 3).map((t: string) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800/70 text-slate-300 border border-slate-700/80 font-mono"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">{p.points}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                  No problems matched the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-[#090e18] text-xs">
            <span className="text-slate-400">
              Showing page <strong className="text-white">{data.page}</strong> of{' '}
              <strong className="text-white">{data.total_pages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                leftIcon={<ChevronLeft className="h-3 w-3" />}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= data.total_pages}
                onClick={() => setPage(page + 1)}
                rightIcon={<ChevronRight className="h-3 w-3" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
