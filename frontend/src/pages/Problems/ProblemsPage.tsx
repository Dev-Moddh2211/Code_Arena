import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  Circle,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Filter,
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter and search state
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [difficulty, setDifficulty] = useState<string>(searchParams.get('difficulty') || '');
  const [selectedTopic, setSelectedTopic] = useState<string>(searchParams.get('topic') || '');
  const [selectedCompany, setSelectedCompany] = useState<string>(searchParams.get('company') || '');
  const [status, setStatus] = useState<string>(searchParams.get('status') || '');
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

  // Sync with URL params if any
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlTopic = searchParams.get('topic');
    if (urlSearch !== null && urlSearch !== search) setSearch(urlSearch);
    if (urlTopic !== null && urlTopic !== selectedTopic) setSelectedTopic(urlTopic);
  }, [searchParams]);

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
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#1a1a1a] text-neutral-300 min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Problemset</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Browse and practice algorithm challenges across all difficulty levels.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleRandomProblem}
          leftIcon={<Shuffle className="h-3.5 w-3.5" />}
          className="bg-[#2a2a2a] hover:bg-[#333] text-neutral-200 border border-[#383838]"
        >
          Pick Random
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-[#282828] bg-[#222222] p-4 space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions by title or keyword..."
              className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg pl-9 pr-4 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-[#555]"
            />
          </form>

          {/* Difficulty Dropdown */}
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto bg-[#1a1a1a] border border-[#333333] text-neutral-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#555]"
          >
            <option value="">Difficulty: All</option>
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
            className="w-full md:w-auto bg-[#1a1a1a] border border-[#333333] text-neutral-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#555]"
          >
            <option value="">Status: All</option>
            <option value="solved">Solved</option>
            <option value="attempted">Attempted</option>
            <option value="todo">Unsolved</option>
          </select>

          {(search || difficulty || selectedTopic || selectedCompany || status) && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#FFA116] hover:underline whitespace-nowrap px-2"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Topic Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#282828]">
          <span className="text-[11px] font-semibold text-neutral-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Topics:
          </span>
          {topicsList.map((top) => (
            <button
              key={top}
              onClick={() => {
                setSelectedTopic(selectedTopic === top ? '' : top);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedTopic === top
                  ? 'bg-[#2a2a2a] text-white border border-[#404040] font-semibold shadow-xs'
                  : 'bg-[#1a1a1a] text-neutral-400 hover:text-neutral-200 hover:bg-[#282828] border border-[#2e2e2e]'
              }`}
            >
              {top}
            </button>
          ))}
        </div>

        {/* Company Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#282828]">
          <span className="text-[11px] font-semibold text-neutral-400 mr-1">Companies:</span>
          {companiesList.map((comp) => (
            <button
              key={comp}
              onClick={() => {
                setSelectedCompany(selectedCompany === comp ? '' : comp);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedCompany === comp
                  ? 'bg-[#2a2a2a] text-white border border-[#404040] font-semibold shadow-xs'
                  : 'bg-[#1a1a1a] text-neutral-400 hover:text-neutral-200 hover:bg-[#282828] border border-[#2e2e2e]'
              }`}
            >
              {comp}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Table */}
      <div className="rounded-xl border border-[#282828] bg-[#222222] overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#282828] bg-[#1c1c1c] text-neutral-400 font-semibold">
              <th className="py-3 px-4 w-12 text-center">Status</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4 w-28">Difficulty</th>
              <th className="py-3 px-4 w-28">Acceptance</th>
              <th className="py-3 px-4 hidden md:table-cell">Topics</th>
              <th className="py-3 px-4 w-20 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#282828]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-[#FFA116]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Loading problems...</span>
                  </div>
                </td>
              </tr>
            ) : data && data.items.length > 0 ? (
              data.items.map((p: ProblemListItem) => (
                <tr key={p.id} className="hover:bg-[#282828]/50 transition-colors">
                  <td className="py-3 px-4 text-center">
                    {p.user_status === 'solved' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : p.user_status === 'attempted' ? (
                      <Clock className="h-4 w-4 text-amber-400 mx-auto" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-neutral-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">
                    <Link
                      to={`/problems/${p.slug}`}
                      className="hover:text-[#FFA116] transition-colors"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={p.difficulty} size="sm">
                      {p.difficulty}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-400">{p.acceptance_rate}%</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.topic_tags.slice(0, 3).map((t: string) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 text-[10px] rounded bg-[#2a2a2a] text-neutral-300 border border-[#383838]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-neutral-400">{p.points}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400">
                  No problems matched the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#282828] bg-[#1c1c1c] text-xs">
            <span className="text-neutral-400">
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
                className="bg-[#2a2a2a] hover:bg-[#333] text-neutral-200 border border-[#383838]"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= data.total_pages}
                onClick={() => setPage(page + 1)}
                rightIcon={<ChevronRight className="h-3 w-3" />}
                className="bg-[#2a2a2a] hover:bg-[#333] text-neutral-200 border border-[#383838]"
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
