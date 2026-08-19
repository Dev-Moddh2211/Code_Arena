import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play,
  Upload,
  ChevronLeft,
  FileText,
  BookOpen,
  HelpCircle,
  History,
  Edit3,
} from 'lucide-react';
import { problemsApi, submissionsApi } from '../../api';
import {
  ProblemDetail,
  TestCase,
  Hint,
  Submission,
  SubmissionListItem,
  ExecutionResult,
  ProblemListItem,
} from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ResizableSplitPane } from '../../components/common/ResizableSplitPane';
import { CodeEditor } from '../../components/workspace/CodeEditor';
import { DescriptionTab } from '../../components/workspace/DescriptionTab';
import { EditorialTab } from '../../components/workspace/EditorialTab';
import { HintsTab } from '../../components/workspace/HintsTab';
import { SubmissionsTab } from '../../components/workspace/SubmissionsTab';
import { NotesTab } from '../../components/workspace/NotesTab';
import { TestCasePanel } from '../../components/workspace/TestCasePanel';
import { ConsolePanel } from '../../components/workspace/ConsolePanel';

export const WorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [similarProblems, setSimilarProblems] = useState<ProblemListItem[]>([]);
  const [hints, setHints] = useState<Hint[]>([]);
  const [sampleCases, setSampleCases] = useState<TestCase[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);

  // Workspace active tab states
  const [activeTab, setActiveTab] = useState<'description' | 'editorial' | 'hints' | 'submissions' | 'notes'>('description');
  const [bottomTab, setBottomTab] = useState<'testcases' | 'console'>('testcases');

  // Code state
  const [language, setLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Execution states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | Submission | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmissionsLoading, setIsSubmissionsLoading] = useState<boolean>(false);

  const supportedLanguages = [
    { id: 'python', name: 'Python 3.11 (3.11.10)' },
    { id: 'cpp', name: 'C++ 17 (GCC 13.2)' },
    { id: 'javascript', name: 'JavaScript (Node.js 20)' },
    { id: 'java', name: 'Java 17 (OpenJDK 17.0.10)' },
  ];

  // Set starter code according to language
  const setStarterCode = (prob: ProblemDetail, lang: string) => {
    const config = prob.language_configs?.find((c) => c.language === lang);
    if (config?.starter_code) {
      setCode(config.starter_code);
    } else {
      switch (lang) {
        case 'python':
          setCode('def solve():\n    pass\n');
          break;
        case 'javascript':
          setCode('function solve() {\n}\n');
          break;
        case 'cpp':
          setCode('#include <vector>\nusing namespace std;\n\nint solve() {\n    return 0;\n}\n');
          break;
        case 'java':
          setCode('class Solution {\n    public int solve() {\n        return 0;\n    }\n}\n');
          break;
        default:
          setCode('');
      }
    }
  };

  // Fetch Problem Data - always start with fresh starter code for the chosen language
  useEffect(() => {
    if (!slug) return;

    const fetchProblemData = async () => {
      try {
        setIsLoading(true);
        const data = await problemsApi.getBySlug(slug);
        setProblem(data);

        // Fetch hints and testcases
        try {
          const hintsData = await problemsApi.getHints(data.slug);
          setHints(hintsData || []);
        } catch {
          setHints([]);
        }

        setSampleCases(data.sample_test_cases || []);

        // Always load clean starter code for the active language
        setStarterCode(data, language);

        // Fetch similar problems
        if (data.topic_tags && data.topic_tags.length > 0) {
          try {
            const sim = await problemsApi.list({
              topic: data.topic_tags[0],
              page_size: 4,
            });
            setSimilarProblems(sim.items.filter((p: ProblemListItem) => p.id !== data.id));
          } catch (e) {
            console.error('Failed to fetch similar problems', e);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblemData();
  }, [slug]);

  // Language switch - resets to fresh starter code for that language
  const handleLanguageChange = (newLang: string) => {
    if (!problem) return;
    setLanguage(newLang);
    setStarterCode(problem, newLang);
  };

  // Reset starter code
  const handleResetCode = () => {
    if (!problem) return;
    setStarterCode(problem, language);
  };

  // Run code against sample cases or custom input
  const handleRun = async () => {
    if (!problem) return;
    try {
      setIsRunning(true);
      setBottomTab('console');
      const res = await submissionsApi.run({
        problem_id: problem.id,
        language,
        code,
        custom_input_json: isCustom ? customInput : undefined,
      });
      setExecutionResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  // Full Submission
  const handleSubmit = async () => {
    if (!problem) return;
    try {
      setIsRunning(true);
      setBottomTab('console');
      const res = await submissionsApi.submit({
        problem_id: problem.id,
        language,
        code,
      });
      setExecutionResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleTabChange = async (tab: 'description' | 'editorial' | 'hints' | 'submissions' | 'notes') => {
    setActiveTab(tab);
    if (tab === 'submissions' && problem) {
      try {
        setIsSubmissionsLoading(true);
        const subData = await submissionsApi.list({ problem_id: problem.id });
        setSubmissions(subData || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSubmissionsLoading(false);
      }
    }
  };

  const handleReaction = async (reaction: 'like' | 'dislike') => {
    if (!problem) return;
    try {
      const res = await problemsApi.setReaction(problem.id, reaction);
      setProblem((prev) =>
        prev
          ? {
              ...prev,
              likes_count: res.likes_count,
              dislikes_count: res.dislikes_count,
              user_reaction: res.user_reaction,
            }
          : null
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!problem) return;
    try {
      const res = await problemsApi.toggleFavorite(problem.id, problem.is_favorited);
      setProblem((prev) =>
        prev
          ? {
              ...prev,
              is_favorited: res.is_favorited,
            }
          : null
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !problem) {
    return (
      <div className="flex justify-center items-center py-32 bg-[#1a1a1a]">
        <svg className="animate-spin h-6 w-6 text-[#FFA116]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const tabs = [
    { id: 'description', label: 'Description', icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'editorial', label: 'Editorial', icon: <BookOpen className="h-3.5 w-3.5" /> },
    {
      id: 'hints',
      label: `Hints (${hints.length})`,
      icon: <HelpCircle className="h-3.5 w-3.5" />,
    },
    { id: 'submissions', label: 'Submissions', icon: <History className="h-3.5 w-3.5" /> },
    { id: 'notes', label: 'Notes', icon: <Edit3 className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-3.25rem)] bg-[#1a1a1a] overflow-hidden text-neutral-300">
      {/* Top Workspace Bar - LeetCode Style */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#222222] border-b border-[#282828] text-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/problems"
            className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors font-medium"
          >
            <ChevronLeft className="h-4 w-4" /> Problems List
          </Link>
          <span className="text-neutral-600">/</span>
          <span className="font-semibold text-white">{problem.title}</span>
          <Badge variant={problem.difficulty as any} size="sm">
            {problem.difficulty}
          </Badge>
        </div>

        {/* Action Buttons: Run & Submit */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRun}
            isLoading={isRunning}
            leftIcon={<Play className="h-3.5 w-3.5 text-neutral-300 fill-current" />}
            className="bg-[#2e2e2e] hover:bg-[#383838] text-neutral-200 border border-[#3e3e3e]"
          >
            Run
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isRunning}
            leftIcon={<Upload className="h-3.5 w-3.5" />}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm border-none"
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Main Draggable Split Workspace */}
      <div className="flex-1 overflow-hidden p-2 bg-[#1a1a1a]">
        <ResizableSplitPane
          defaultSplit={42}
          minLeftWidth={320}
          minRightWidth={450}
          storageKey="arena_workspace_split"
          left={
            <div className="flex flex-col h-full min-w-0 bg-[#222222] border border-[#2e2e2e] rounded-xl overflow-hidden shadow-sm">
              {/* Tab Navigation */}
              <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#282828] bg-[#1c1c1c] text-xs overflow-x-auto min-w-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-[#2a2a2a] text-white shadow-xs border border-[#383838] font-semibold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Active Tab View */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 bg-[#1e1e1e]">
                {activeTab === 'description' && (
                  <DescriptionTab
                    problem={problem}
                    similarProblems={similarProblems}
                    onReaction={handleReaction}
                    onToggleFavorite={handleToggleFavorite}
                  />
                )}
                {activeTab === 'editorial' && <EditorialTab editorialMd={problem.editorial_md} />}
                {activeTab === 'hints' && <HintsTab hints={hints} />}
                {activeTab === 'submissions' && (
                  <SubmissionsTab submissions={submissions} isLoading={isSubmissionsLoading} />
                )}
                {activeTab === 'notes' && <NotesTab problemId={problem.id} />}
              </div>
            </div>
          }
          right={
            <ResizableSplitPane
              direction="vertical"
              defaultSplit={58}
              minFirstSize={180}
              minSecondSize={140}
              storageKey="arena_editor_split"
              top={
                <div className="flex flex-col h-full min-h-0 bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl overflow-hidden">
                  <CodeEditor
                    language={language}
                    code={code}
                    onChange={(val) => setCode(val || '')}
                    onReset={handleResetCode}
                    onLanguageChange={handleLanguageChange}
                    languages={supportedLanguages}
                  />
                </div>
              }
              bottom={
                <div className="flex flex-col h-full min-h-0 bg-[#222222] border border-[#2e2e2e] rounded-xl overflow-hidden shadow-sm">
                  {/* Toggle between Testcases and Console Output */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#282828] bg-[#1c1c1c] text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setBottomTab('testcases')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          bottomTab === 'testcases'
                            ? 'bg-[#2a2a2a] text-white border border-[#383838] shadow-xs font-semibold'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        Test Cases
                      </button>
                      <button
                        onClick={() => setBottomTab('console')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          bottomTab === 'console'
                            ? 'bg-[#2a2a2a] text-white border border-[#383838] shadow-xs font-semibold'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        Console Output
                      </button>
                    </div>

                    {executionResult && (
                      <div className="text-[11px] font-mono">
                        {executionResult.status === 'accepted' ? (
                          <span className="text-emerald-400 font-semibold">✓ Accepted</span>
                        ) : (
                          <span className="text-rose-400 font-semibold capitalize">
                            {executionResult.status.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sub-panel content */}
                  <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
                    {bottomTab === 'testcases' ? (
                      <TestCasePanel
                        sampleCases={sampleCases}
                        customInput={customInput}
                        onCustomInputChange={setCustomInput}
                        isCustom={isCustom}
                        onToggleCustom={setIsCustom}
                      />
                    ) : (
                      <ConsolePanel result={executionResult} isRunning={isRunning} />
                    )}
                  </div>
                </div>
              }
            />
          }
        />
      </div>
    </div>
  );
};
