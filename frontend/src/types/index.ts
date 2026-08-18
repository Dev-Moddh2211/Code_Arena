export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar_url?: string | null;
  bio?: string | null;
  is_demo: boolean;
  created_at: string;
}

export interface TestCase {
  id?: string;
  input_json: string;
  expected_output_json: string;
  is_sample: boolean;
  order_matters: boolean;
  display_order: number;
}

export interface Hint {
  id?: string;
  content_md: string;
  display_order: number;
}

export interface LanguageConfig {
  id?: string;
  language: string;
  starter_code: string;
  wrapper_template: string;
}

export interface ProblemListItem {
  id: string;
  slug: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic_tags: string[];
  company_tags: string[];
  points: number;
  status: 'draft' | 'published' | 'archived';
  acceptance_rate: number;
  total_submissions: number;
  likes_count: number;
  dislikes_count: number;
  user_status?: 'solved' | 'attempted' | 'unsolved' | null;
  is_favorited?: boolean;
}

export interface ProblemDetail {
  id: string;
  slug: string;
  title: string;
  description_md: string;
  editorial_md?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  topic_tags: string[];
  company_tags: string[];
  constraints_md?: string | null;
  points: number;
  time_limit_ms: number;
  memory_limit_mb: number;
  status: 'draft' | 'published' | 'archived';
  sample_test_cases: TestCase[];
  language_configs: LanguageConfig[];
  hints_count: number;
  acceptance_rate: number;
  total_submissions: number;
  total_accepted: number;
  likes_count: number;
  dislikes_count: number;
  user_reaction?: 'like' | 'dislike' | null;
  user_status?: 'solved' | 'attempted' | 'unsolved' | null;
  is_favorited: boolean;
  user_note?: string | null;
  avg_runtime_ms?: number | null;
  avg_memory_kb?: number | null;
}

export interface TestCaseResult {
  test_case_id?: string | null;
  is_sample: boolean;
  input_json?: string | null;
  expected_output_json?: string | null;
  actual_output_json?: string | null;
  passed: boolean;
  runtime_ms?: number | null;
  memory_kb?: number | null;
  error_message?: string | null;
  stdout?: string | null;
}

export interface ExecutionResult {
  status: 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'runtime_error' | 'compile_error' | 'internal_error';
  runtime_ms?: number | null;
  memory_kb?: number | null;
  total_test_cases: number;
  passed_test_cases: number;
  score: number;
  error_message?: string | null;
  test_results: TestCaseResult[];
}

export interface Submission {
  id: string;
  problem_id: string;
  problem_title?: string;
  problem_slug?: string;
  problem_difficulty?: 'easy' | 'medium' | 'hard';
  language: string;
  code: string;
  code_size_bytes: number;
  attempt_number: number;
  status: string;
  runtime_ms?: number | null;
  memory_kb?: number | null;
  score: number;
  error_message?: string | null;
  test_results: TestCaseResult[];
  created_at: string;
}

export interface SubmissionListItem {
  id: string;
  problem_id: string;
  problem_title: string;
  problem_slug: string;
  problem_difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  status: string;
  runtime_ms?: number | null;
  memory_kb?: number | null;
  code_size_bytes: number;
  attempt_number: number;
  created_at: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: number;
}

export interface DifficultyStat {
  solved: number;
  total: number;
  percentage: number;
}

export interface DifficultyBreakdown {
  easy: DifficultyStat;
  medium: DifficultyStat;
  hard: DifficultyStat;
  total_solved: number;
  total_problems: number;
}

export interface TopicProgress {
  topic: string;
  solved: number;
  total: number;
  percentage: number;
}

export interface PaginatedProblems {
  items: ProblemListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LanguageUsage {
  language: string;
  count: number;
  percentage: number;
}

export type LanguageStat = LanguageUsage;

export interface RecentActivityItem {
  id: string;
  problem_id: string;
  problem_title: string;
  problem_slug: string;
  problem_difficulty: 'easy' | 'medium' | 'hard';
  status: string;
  language: string;
  runtime_ms?: number | null;
  created_at: string;
}

export interface WeeklyProgressDay {
  day: string;
  date: string;
  count: number;
}

export interface AchievementItem {
  id: string;
  code: string;
  title: string;
  description: string;
  icon_key: string;
  earned: boolean;
  earned_at?: string | null;
}

export interface DashboardPayload {
  heatmap: HeatmapDay[];
  current_streak: number;
  longest_streak: number;
  total_active_days: number;
  difficulty_breakdown: DifficultyBreakdown;
  topic_progress: TopicProgress[];
  acceptance_rate: number;
  total_submissions: number;
  total_accepted_submissions: number;
  language_usage: LanguageUsage[];
  recent_activity: RecentActivityItem[];
  weekly_progress: WeeklyProgressDay[];
  achievements: AchievementItem[];
  total_points: number;
  rank?: number | null;
}

export interface SheetSummary {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  total_problems: number;
  solved_problems: number;
  progress_percentage: number;
}

export interface SheetDetail {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  total_problems: number;
  solved_problems: number;
  progress_percentage: number;
  problems: ProblemListItem[];
}

export interface DailyChallengeResponse {
  date: string;
  problem: ProblemListItem;
  user_solved: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string | null;
  bio?: string | null;
  total_score: number;
  solved_count: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
}

export interface AdminProblemItem {
  id: string;
  slug: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic_tags: string[];
  company_tags: string[];
  status: 'draft' | 'published' | 'archived';
  points: number;
  test_cases_count: number;
  hints_count: number;
  language_configs_count: number;
  total_submissions: number;
  acceptance_rate: number;
  created_at: string;
  updated_at: string;
}

export interface AdminProblemDetail {
  id: string;
  slug: string;
  title: string;
  description_md: string;
  editorial_md?: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  topic_tags: string[];
  company_tags: string[];
  constraints_md?: string | null;
  points: number;
  time_limit_ms: number;
  memory_limit_mb: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  test_cases: TestCase[];
  hints: Hint[];
  language_configs: LanguageConfig[];
}

export interface AdminAnalyticsPayload {
  total_users: number;
  total_problems: number;
  published_problems: number;
  draft_problems: number;
  archived_problems: number;
  total_submissions: number;
  total_accepted_submissions: number;
  platform_acceptance_rate: number;
  most_attempted_problems: {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    total_submissions: number;
    acceptance_rate: number;
  }[];
  lowest_acceptance_problems: {
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    total_submissions: number;
    acceptance_rate: number;
  }[];
}
