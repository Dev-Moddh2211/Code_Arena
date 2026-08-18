import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  Plus,
  Trash2,
  Eye,
  FileText,
  HelpCircle,
  BookOpen,
  Code2,
} from 'lucide-react';
import { adminApi } from '../../api';
import { TestCase, Hint } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const ProblemWizard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [activeStep, setActiveStep] = useState<
    'details' | 'testcases' | 'hints' | 'editorial' | 'preview'
  >('details');

  const [isLoading, setIsLoading] = useState<boolean>(!isNew);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form State
  const [problemId, setProblemId] = useState<string>(id && id !== 'new' ? id : '');
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [points, setPoints] = useState<number>(20);
  const [timeLimit, setTimeLimit] = useState<number>(2000);
  const [memoryLimit, setMemoryLimit] = useState<number>(256);
  const [topicTagsStr, setTopicTagsStr] = useState<string>('');
  const [companyTagsStr, setCompanyTagsStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [constraints, setConstraints] = useState<string>('');
  const [editorial, setEditorial] = useState<string>('');
  const [status, setStatus] = useState<string>('draft');

  // Collections
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [hints, setHints] = useState<Hint[]>([]);
  const [newHint, setNewHint] = useState<string>('');
  const [newTcInput, setNewTcInput] = useState<string>('');
  const [newTcExpected, setNewTcExpected] = useState<string>('');
  const [newTcIsSample, setNewTcIsSample] = useState<boolean>(true);

  useEffect(() => {
    if (!isNew && id) {
      const fetchProblem = async () => {
        try {
          setIsLoading(true);
          const p = await adminApi.getProblem(id);
          setProblemId(p.id);
          setTitle(p.title);
          setSlug(p.slug);
          setDifficulty(p.difficulty);
          setPoints(p.points);
          setTimeLimit(p.time_limit_ms);
          setMemoryLimit(p.memory_limit_mb);
          setTopicTagsStr((p.topic_tags || []).join(', '));
          setCompanyTagsStr((p.company_tags || []).join(', '));
          setDescription(p.description_md);
          setConstraints(p.constraints_md || '');
          setEditorial(p.editorial_md || '');
          setStatus(p.status);
          setTestCases(p.test_cases || []);
          setHints(p.hints || []);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProblem();
    }
  }, [id, isNew]);

  const handleSaveDetails = async (publishImmediately: boolean = false) => {
    setIsSaving(true);
    try {
      const topic_tags = topicTagsStr.split(',').map((t) => t.trim()).filter(Boolean);
      const company_tags = companyTagsStr.split(',').map((c) => c.trim()).filter(Boolean);

      const payload = {
        title,
        slug: slug || undefined,
        difficulty,
        points: Number(points),
        time_limit_ms: Number(timeLimit),
        memory_limit_mb: Number(memoryLimit),
        topic_tags,
        company_tags,
        description_md: description,
        constraints_md: constraints,
        editorial_md: editorial,
        status: publishImmediately ? 'published' : status,
      };

      if (isNew && !problemId) {
        const created = await adminApi.createProblem(payload);
        setProblemId(created.id);
        navigate(`/admin/problems/${created.id}/edit`, { replace: true });
      } else {
        await adminApi.updateProblem(problemId, payload);
      }

      if (publishImmediately) {
        setStatus('published');
      }
      alert(publishImmediately ? 'Problem published live!' : 'Problem saved as draft.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save problem');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTestCase = async () => {
    if (!problemId) {
      alert('Please save problem details first.');
      return;
    }
    if (!newTcInput || !newTcExpected) {
      alert('Please enter both input JSON and expected output JSON');
      return;
    }
    try {
      const tc = await adminApi.addTestCase(problemId, {
        input_json: newTcInput,
        expected_output_json: newTcExpected,
        is_sample: newTcIsSample,
        order_matters: true,
      });
      setTestCases([...testCases, tc]);
      setNewTcInput('');
      setNewTcExpected('');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Invalid JSON format for test case');
    }
  };

  const handleDeleteTestCase = async (tcId?: string) => {
    if (!tcId) return;
    try {
      await adminApi.deleteTestCase(tcId);
      setTestCases(testCases.filter((t) => t.id !== tcId));
    } catch (err) {
      alert('Failed to delete test case');
    }
  };

  const handleAddHint = async () => {
    if (!problemId) {
      alert('Please save problem details first.');
      return;
    }
    if (!newHint.trim()) return;
    try {
      const h = await adminApi.addHint(problemId, {
        content_md: newHint.trim(),
        display_order: hints.length + 1,
      });
      setHints([...hints, h]);
      setNewHint('');
    } catch (err) {
      alert('Failed to add hint');
    }
  };

  const handleDeleteHint = async (hintId?: string) => {
    if (!hintId) return;
    try {
      await adminApi.deleteHint(hintId);
      setHints(hints.filter((h) => h.id !== hintId));
    } catch (err) {
      alert('Failed to delete hint');
    }
  };

  const handleSaveEditorial = async () => {
    if (!problemId) {
      alert('Please save problem details first.');
      return;
    }
    try {
      await adminApi.updateEditorial(problemId, editorial);
      alert('Editorial updated successfully');
    } catch (err) {
      alert('Failed to save editorial');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 bg-[#080c14]">
        <svg className="animate-spin h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const steps = [
    { id: 'details', label: '1. Statement & Meta', icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'testcases', label: `2. Test Cases (${testCases.length})`, icon: <Code2 className="h-3.5 w-3.5" /> },
    { id: 'hints', label: `3. Hints (${hints.length})`, icon: <HelpCircle className="h-3.5 w-3.5" /> },
    { id: 'editorial', label: '4. Editorial', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: 'preview', label: '5. Student Preview', icon: <Eye className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6 bg-[#080c14] text-slate-300 min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to CMS List
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSaveDetails(false)}
            isLoading={isSaving}
            leftIcon={<Save className="h-3.5 w-3.5" />}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSaveDetails(true)}
            isLoading={isSaving}
            leftIcon={<Upload className="h-3.5 w-3.5" />}
          >
            Publish Live
          </Button>
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="flex items-center gap-1 bg-[#0d131f] p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeStep === step.id
                ? 'bg-slate-800 text-white font-semibold shadow-xs border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {step.icon}
            {step.label}
          </button>
        ))}
      </div>

      {/* Step 1: Details & Markdown Form */}
      {activeStep === 'details' && (
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-6 space-y-4 text-xs shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Problem Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Subarray Sum Equals K"
                className="w-full bg-[#090e18] border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated from title if blank"
                className="w-full bg-[#090e18] border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-[#090e18] border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Points</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="w-full bg-[#090e18] border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Time Limit (ms)</label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full bg-[#090e18] border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Memory Limit (MB)</label>
              <input
                type="number"
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(Number(e.target.value))}
                className="w-full bg-[#090e18] border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Topic Tags (comma-separated)</label>
              <input
                type="text"
                value={topicTagsStr}
                onChange={(e) => setTopicTagsStr(e.target.value)}
                placeholder="Array, Hash Map, Dynamic Programming"
                className="w-full bg-[#090e18] border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company Tags (comma-separated)</label>
              <input
                type="text"
                value={companyTagsStr}
                onChange={(e) => setCompanyTagsStr(e.target.value)}
                placeholder="Google, Amazon, Meta"
                className="w-full bg-[#090e18] border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Problem Description (Markdown + LaTeX)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              placeholder="Describe the problem, input format, output format, and examples..."
              className="w-full bg-[#090e18] border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Constraints (Markdown)</label>
            <textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              rows={3}
              placeholder="- 1 <= nums.length <= 10^4&#10;- -10^9 <= target <= 10^9"
              className="w-full bg-[#090e18] border border-slate-800 rounded-lg p-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>
      )}

      {/* Step 2: Test Cases Management */}
      {activeStep === 'testcases' && (
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-6 space-y-6 text-xs shadow-sm">
          <div>
            <h3 className="font-bold text-white text-sm">Configured Test Cases ({testCases.length})</h3>
            <p className="text-slate-400 mt-0.5">Sample cases are shown to the candidate in the workspace. Hidden cases validate full correctness.</p>
          </div>

          <div className="space-y-3">
            {testCases.map((tc, idx) => (
              <div key={tc.id || idx} className="rounded-lg border border-slate-800 bg-[#090e18] p-3.5 flex items-start justify-between gap-4 font-mono">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 font-sans">
                    <span className="font-bold text-white">Case #{idx + 1}</span>
                    <Badge variant={tc.is_sample ? 'accent' : 'neutral'} size="sm">
                      {tc.is_sample ? 'Sample Case (Public)' : 'Hidden Judge Case'}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <span className="text-slate-500">Input:</span> {tc.input_json}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    <span className="text-slate-500">Expected:</span> {tc.expected_output_json}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTestCase(tc.id)}
                  className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Test Case Form */}
          <div className="rounded-lg border border-slate-800 bg-[#090e18] p-4 space-y-3">
            <h4 className="font-semibold text-white">Add New Test Case</h4>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Input (JSON array of arguments):</label>
              <input
                type="text"
                value={newTcInput}
                onChange={(e) => setNewTcInput(e.target.value)}
                placeholder="e.g. [[2,7,11,15], 9]"
                className="w-full bg-[#0d131f] border border-slate-800 rounded p-2 text-slate-200 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Expected Output (JSON):</label>
              <input
                type="text"
                value={newTcExpected}
                onChange={(e) => setNewTcExpected(e.target.value)}
                placeholder="e.g. [0, 1]"
                className="w-full bg-[#0d131f] border border-slate-800 rounded p-2 text-slate-200 font-mono text-xs"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTcIsSample}
                  onChange={(e) => setNewTcIsSample(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-400"
                />
                Mark as Sample Test Case (visible in workspace)
              </label>

              <Button variant="primary" size="sm" onClick={handleAddTestCase} leftIcon={<Plus className="h-3 w-3" />}>
                Add Case
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Hints */}
      {activeStep === 'hints' && (
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-6 space-y-6 text-xs shadow-sm">
          <div>
            <h3 className="font-bold text-white text-sm">Progressive Hints ({hints.length})</h3>
            <p className="text-slate-400 mt-0.5">Revealed to the candidate one by one during practice.</p>
          </div>

          <div className="space-y-3">
            {hints.map((h, idx) => (
              <div key={h.id || idx} className="rounded-lg border border-slate-800 bg-[#090e18] p-3 flex items-start justify-between gap-4">
                <div>
                  <span className="font-semibold text-white block mb-1">Hint #{idx + 1}</span>
                  <p className="text-slate-300 leading-relaxed">{h.content_md}</p>
                </div>
                <button
                  onClick={() => handleDeleteHint(h.id)}
                  className="p-1 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newHint}
              onChange={(e) => setNewHint(e.target.value)}
              placeholder="Add a new progressive hint..."
              className="flex-1 bg-[#090e18] border border-slate-800 rounded p-2 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
            <Button variant="secondary" size="sm" onClick={handleAddHint} leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Add Hint
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Editorial */}
      {activeStep === 'editorial' && (
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-6 space-y-4 text-xs shadow-sm">
          <div>
            <h3 className="font-bold text-white text-sm">Official Solution Editorial</h3>
            <p className="text-slate-400 mt-0.5">Authoritative algorithm explanation and complexity analysis.</p>
          </div>

          <textarea
            value={editorial}
            onChange={(e) => setEditorial(e.target.value)}
            rows={10}
            placeholder="### Approach: Hash Map (Single Pass)&#10;&#10;We iterate through the array and store seen values in a map..."
            className="w-full bg-[#090e18] border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-500 leading-relaxed"
          />

          <Button variant="primary" size="sm" onClick={handleSaveEditorial}>
            Save Editorial
          </Button>
        </div>
      )}

      {/* Step 5: Preview */}
      {activeStep === 'preview' && (
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-6 space-y-4 text-xs shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-white text-sm">Student View Simulation</span>
            {slug && (
              <Link to={`/problems/${slug}`} target="_blank">
                <Button variant="secondary" size="sm" rightIcon={<Eye className="h-3.5 w-3.5" />}>
                  Open Full Live Workspace
                </Button>
              </Link>
            )}
          </div>

          <div className="border border-slate-800 rounded-lg p-4 bg-[#090e18] space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={difficulty as any}>{difficulty.toUpperCase()}</Badge>
              <h2 className="text-lg font-bold text-white">{title || 'Untitled Problem'}</h2>
            </div>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
};
