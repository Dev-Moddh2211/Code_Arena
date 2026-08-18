import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Copy,
  Upload,
  Archive,
  Trash2,
  Eye,
  Edit,
  BarChart2,
  Search,
} from 'lucide-react';
import { adminApi } from '../../api';
import { AdminProblemItem } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<AdminProblemItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProblems = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {};
      if (statusFilter) params.status_filter = statusFilter;
      if (search) params.search = search;
      const data = await adminApi.listProblems(params);
      setProblems(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProblems();
  };

  const handleClone = async (id: string) => {
    try {
      const cloned = await adminApi.cloneProblem(id);
      navigate(`/admin/problems/${cloned.id}/edit`);
    } catch (err) {
      alert('Failed to clone problem');
    }
  };

  const handlePublish = async (id: string) => {
    await adminApi.publishProblem(id);
    fetchProblems();
  };

  const handleArchive = async (id: string) => {
    await adminApi.archiveProblem(id);
    fetchProblems();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this problem?')) {
      await adminApi.deleteProblem(id);
      fetchProblems();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#080c14] text-slate-300 min-h-[calc(100vh-3.5rem)]">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Content Management System</h1>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-medium">
              Admin Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Curate problem statements, configure multi-language harnesses, manage hidden test cases, and publish live.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/analytics">
            <Button variant="secondary" size="sm" leftIcon={<BarChart2 className="h-3.5 w-3.5" />}>
              Platform Diagnostics
            </Button>
          </Link>
          <Link to="/admin/problems/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Create New Problem
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Filter & Search */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-[#090e18] p-1 rounded-lg border border-slate-800 text-xs w-full md:w-auto">
          {[
            { label: 'All Content', val: '' },
            { label: 'Drafts', val: 'draft' },
            { label: 'Published', val: 'published' },
            { label: 'Archived', val: 'archived' },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setStatusFilter(tab.val)}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === tab.val
                  ? 'bg-slate-800 text-white font-semibold shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems in CMS..."
            className="w-full bg-[#090e18] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </form>
      </div>

      {/* CMS Problem Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#090e18] text-slate-400 font-semibold">
              <th className="py-3 px-4 w-28">Status</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4 w-24">Difficulty</th>
              <th className="py-3 px-4 w-24 text-center">Test Cases</th>
              <th className="py-3 px-4 w-20 text-center">Hints</th>
              <th className="py-3 px-4 w-28">Acceptance</th>
              <th className="py-3 px-4 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Loading CMS catalog...
                </td>
              </tr>
            ) : problems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No problems found for selected status filter.
                </td>
              </tr>
            ) : (
              problems.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <Badge variant={p.status as any} size="sm">
                      {p.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200">
                    <Link to={`/admin/problems/${p.id}/edit`} className="hover:text-emerald-400 hover:underline transition-colors font-semibold">
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={p.difficulty} size="sm">
                      {p.difficulty}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-300">{p.test_cases_count}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-400">{p.hints_count}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{p.acceptance_rate}%</td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <Link to={`/problems/${p.slug}`}>
                      <button className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800" title="Preview Student View">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </Link>
                    <Link to={`/admin/problems/${p.id}/edit`}>
                      <button className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800" title="Edit in Wizard">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleClone(p.id)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Clone as New Draft"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    {p.status !== 'published' ? (
                      <button
                        onClick={() => handlePublish(p.id)}
                        className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10"
                        title="Publish Live"
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchive(p.id)}
                        className="p-1 rounded text-amber-400 hover:bg-amber-500/10"
                        title="Archive Problem"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                      title="Delete Problem"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
