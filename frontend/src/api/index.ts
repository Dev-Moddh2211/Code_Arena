import { apiClient } from './client';
import {
  User,
  ProblemListItem,
  ProblemDetail,
  Hint,
  ExecutionResult,
  Submission,
  SubmissionListItem,
  DashboardPayload,
  SheetSummary,
  SheetDetail,
  DailyChallengeResponse,
  LeaderboardEntry,
  AdminProblemItem,
  AdminProblemDetail,
  AdminAnalyticsPayload,
  TestCase,
} from '../types';

export const problemsApi = {
  list: async (params?: Record<string, any>) => {
    const res = await apiClient.get<{
      items: ProblemListItem[];
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
    }>('/problems', { params });
    return res.data;
  },

  getRandom: async () => {
    const res = await apiClient.get<ProblemListItem>('/problems/random');
    return res.data;
  },

  getBySlug: async (slug: string) => {
    const res = await apiClient.get<ProblemDetail>(`/problems/${slug}`);
    return res.data;
  },

  getHints: async (slug: string) => {
    const res = await apiClient.get<Hint[]>(`/problems/${slug}/hints`);
    return res.data;
  },

  getSimilar: async (slug: string) => {
    const res = await apiClient.get<ProblemListItem[]>(`/problems/${slug}/similar`);
    return res.data;
  },

  setReaction: async (id: string, reaction: 'like' | 'dislike') => {
    const res = await apiClient.post(`/problems/${id}/reaction`, { reaction });
    return res.data;
  },

  getNote: async (id: string) => {
    const res = await apiClient.get<{ problem_id: string; content_md: string; updated_at: string }>(`/problems/${id}/notes`);
    return res.data;
  },

  updateNote: async (id: string, content_md: string) => {
    const res = await apiClient.put<{ problem_id: string; content_md: string; updated_at: string }>(`/problems/${id}/notes`, { content_md });
    return res.data;
  },

  toggleFavorite: async (id: string, isFav: boolean) => {
    if (isFav) {
      const res = await apiClient.delete(`/problems/${id}/favorite`);
      return res.data;
    } else {
      const res = await apiClient.post(`/problems/${id}/favorite`);
      return res.data;
    }
  },

  getFavorites: async () => {
    const res = await apiClient.get<ProblemListItem[]>('/users/me/favorites');
    return res.data;
  },

  getRecentlyViewed: async () => {
    const res = await apiClient.get<ProblemListItem[]>('/users/me/recently-viewed');
    return res.data;
  },
};

export const submissionsApi = {
  run: async (data: { problem_id: string; language: string; code: string; custom_input_json?: string }) => {
    const res = await apiClient.post<ExecutionResult>('/submissions/run', data);
    return res.data;
  },

  submit: async (data: { problem_id: string; language: string; code: string }) => {
    const res = await apiClient.post<Submission>('/submissions/submit', data);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<Submission>(`/submissions/${id}`);
    return res.data;
  },

  list: async (params?: Record<string, any>) => {
    const res = await apiClient.get<SubmissionListItem[]>('/submissions', { params });
    return res.data;
  },

  analytics: async (problem_id?: string) => {
    const res = await apiClient.get<{
      submissions: SubmissionListItem[];
      total_submissions: number;
      accepted_count: number;
      acceptance_rate: number;
      runtime_history: any[];
      memory_history: any[];
    }>('/submissions/analytics', { params: { problem_id } });
    return res.data;
  },
};

export const dashboardApi = {
  get: async () => {
    const res = await apiClient.get<DashboardPayload>('/users/me/dashboard');
    return res.data;
  },
};

export const sheetsApi = {
  list: async () => {
    const res = await apiClient.get<SheetSummary[]>('/sheets');
    return res.data;
  },

  getBySlug: async (slug: string) => {
    const res = await apiClient.get<SheetDetail>(`/sheets/${slug}`);
    return res.data;
  },
};

export const dailyChallengeApi = {
  get: async () => {
    const res = await apiClient.get<DailyChallengeResponse>('/daily-challenge');
    return res.data;
  },
};

export const leaderboardApi = {
  get: async () => {
    const res = await apiClient.get<LeaderboardEntry[]>('/leaderboard');
    return res.data;
  },

  getProfile: async (username: string) => {
    const res = await apiClient.get<{
      id: string;
      username: string;
      avatar_url?: string;
      bio?: string;
      total_score: number;
      total_solved: number;
      easy_solved: number;
      medium_solved: number;
      hard_solved: number;
      created_at: string;
    }>(`/users/${username}`);
    return res.data;
  },
};

export const adminApi = {
  listProblems: async (params?: Record<string, any>) => {
    const res = await apiClient.get<AdminProblemItem[]>('/admin/problems', { params });
    return res.data;
  },

  createProblem: async (data: any) => {
    const res = await apiClient.post<AdminProblemDetail>('/admin/problems', data);
    return res.data;
  },

  getProblem: async (id: string) => {
    const res = await apiClient.get<AdminProblemDetail>(`/admin/problems/${id}`);
    return res.data;
  },

  updateProblem: async (id: string, data: any) => {
    const res = await apiClient.put<AdminProblemDetail>(`/admin/problems/${id}`, data);
    return res.data;
  },

  cloneProblem: async (id: string) => {
    const res = await apiClient.post<AdminProblemDetail>(`/admin/problems/${id}/clone`);
    return res.data;
  },

  publishProblem: async (id: string) => {
    const res = await apiClient.put(`/admin/problems/${id}/publish`);
    return res.data;
  },

  archiveProblem: async (id: string) => {
    const res = await apiClient.put(`/admin/problems/${id}/archive`);
    return res.data;
  },

  deleteProblem: async (id: string) => {
    const res = await apiClient.delete(`/admin/problems/${id}`);
    return res.data;
  },

  previewProblem: async (id: string) => {
    const res = await apiClient.get<ProblemDetail>(`/admin/problems/${id}/preview`);
    return res.data;
  },

  addTestCase: async (problemId: string, data: Partial<TestCase>) => {
    const res = await apiClient.post<TestCase>(`/admin/problems/${problemId}/test-cases`, data);
    return res.data;
  },

  updateTestCase: async (tcId: string, data: Partial<TestCase>) => {
    const res = await apiClient.put<TestCase>(`/admin/test-cases/${tcId}`, data);
    return res.data;
  },

  deleteTestCase: async (tcId: string) => {
    const res = await apiClient.delete(`/admin/test-cases/${tcId}`);
    return res.data;
  },

  addHint: async (problemId: string, data: { content_md: string; display_order?: number }) => {
    const res = await apiClient.post<Hint>(`/admin/problems/${problemId}/hints`, data);
    return res.data;
  },

  deleteHint: async (hintId: string) => {
    const res = await apiClient.delete(`/admin/hints/${hintId}`);
    return res.data;
  },

  setLanguageConfig: async (problemId: string, data: { language: string; starter_code: string; wrapper_template: string }) => {
    const res = await apiClient.post(`/admin/problems/${problemId}/language-configs`, data);
    return res.data;
  },

  updateEditorial: async (problemId: string, editorial_md: string) => {
    const res = await apiClient.put(`/admin/problems/${problemId}/editorial`, { editorial_md });
    return res.data;
  },

  getAnalytics: async () => {
    const res = await apiClient.get<AdminAnalyticsPayload>('/admin/analytics');
    return res.data;
  },
};
