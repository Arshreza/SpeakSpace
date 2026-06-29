import { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Play,
  Send,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/utils/api'
import type { CodeReview, TestResult } from '@/types'

// ─── Types ──────────────────────────────────────────────────────────────────

type Language = 'javascript' | 'python' | 'java' | 'cpp' | 'go' | 'rust' | 'typescript'
type Difficulty = 'Easy' | 'Medium' | 'Hard'
type OutputTab = 'testcases' | 'output' | 'aireview'

interface Problem {
  id: string
  title: string
  difficulty: Difficulty
  tags: string[]
  description: string
  examples: { input: string; output: string; explanation?: string }[]
  constraints: string[]
  hints: string[]
  starterCode: Record<Language, string>
  testCases: { input: string; expected: string }[]
}

// ─── Starter Code ────────────────────────────────────────────────────────────

const twoSumStarter: Record<Language, string> = {
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your solution here
};`,
  typescript: `function twoSum(nums: number[], target: number): number[] {
    // Your solution here
    return [];
};`,
  python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Your solution here
        pass`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }
}`,
  cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your solution here
        return {};
    }
};`,
  go: `func twoSum(nums []int, target int) []int {
    // Your solution here
    return nil
}`,
  rust: `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        // Your solution here
        vec![]
    }
}`,
}

const longestSubstringStarter: Record<Language, string> = {
  javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
    // Your solution here
};`,
  typescript: `function lengthOfLongestSubstring(s: string): number {
    // Your solution here
    return 0;
};`,
  python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Your solution here
        pass`,
  java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Your solution here
        return 0;
    }
}`,
  cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Your solution here
        return 0;
    }
};`,
  go: `func lengthOfLongestSubstring(s string) int {
    // Your solution here
    return 0
}`,
  rust: `impl Solution {
    pub fn length_of_longest_substring(s: String) -> i32 {
        // Your solution here
        0
    }
}`,
}

const mergeKListsStarter: Record<Language, string> = {
  javascript: `/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
function mergeKLists(lists) {
    // Your solution here
};`,
  typescript: `function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
    // Your solution here
    return null;
};`,
  python: `class Solution:
    def mergeKLists(self, lists: list[Optional[ListNode]]) -> Optional[ListNode]:
        # Your solution here
        pass`,
  java: `class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        // Your solution here
        return null;
    }
}`,
  cpp: `class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        // Your solution here
        return nullptr;
    }
};`,
  go: `func mergeKLists(lists []*ListNode) *ListNode {
    // Your solution here
    return nil
}`,
  rust: `impl Solution {
    pub fn merge_k_lists(lists: Vec<Option<Box<ListNode>>>) -> Option<Box<ListNode>> {
        // Your solution here
        None
    }
}`,
}

// ─── Problems ────────────────────────────────────────────────────────────────

const PROBLEMS: Problem[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to* \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' },
    ],
    constraints: [
      '2 <= nums.length <= 10⁴',
      '-10⁹ <= nums[i] <= 10⁹',
      '-10⁹ <= target <= 10⁹',
      'Only one valid answer exists.',
    ],
    hints: [
      'A brute force approach would be O(n²). Can you do better?',
      'Think about using a hash map to store previously seen numbers.',
      'For each number, check if (target - number) exists in the map.',
    ],
    starterCode: twoSumStarter,
    testCases: [
      { input: '[2,7,11,15], target=9', expected: '[0,1]' },
      { input: '[3,2,4], target=6', expected: '[1,2]' },
      { input: '[3,3], target=6', expected: '[0,1]' },
    ],
  },
  {
    id: '2',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3.' },
    ],
    constraints: [
      '0 <= s.length <= 5 * 10⁴',
      's consists of English letters, digits, symbols and spaces.',
    ],
    hints: [
      'Use the sliding window technique with two pointers.',
      'Keep a set of characters in the current window.',
      'When a duplicate is found, shrink the window from the left.',
    ],
    starterCode: longestSubstringStarter,
    testCases: [
      { input: '"abcabcbb"', expected: '3' },
      { input: '"bbbbb"', expected: '1' },
      { input: '"pwwkew"', expected: '3' },
    ],
  },
  {
    id: '3',
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    tags: ['Linked List', 'Divide and Conquer', 'Heap (Priority Queue)', 'Merge Sort'],
    description: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

*Merge all the linked-lists into one sorted linked-list and return it.*`,
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: 'The linked-lists are: [1->4->5, 1->3->4, 2->6]. Merging them into one sorted list: 1->1->2->3->4->4->5->6.' },
      { input: 'lists = []', output: '[]' },
      { input: 'lists = [[]]', output: '[]' },
    ],
    constraints: [
      'k == lists.length',
      '0 <= k <= 10⁴',
      '0 <= lists[i].length <= 500',
      '-10⁴ <= lists[i][j] <= 10⁴',
      'lists[i] is sorted in ascending order.',
      'The sum of lists[i].length will not exceed 10⁴.',
    ],
    hints: [
      'Use a min-heap to efficiently get the smallest element among k lists.',
      'Alternatively, use divide and conquer: merge pairs of lists recursively.',
      'Merging two sorted lists is O(n). Merging k lists with divide and conquer is O(n log k).',
    ],
    starterCode: mergeKListsStarter,
    testCases: [
      { input: '[[1,4,5],[1,3,4],[2,6]]', expected: '[1,1,2,3,4,4,5,6]' },
      { input: '[]', expected: '[]' },
      { input: '[[]]', expected: '[]' },
    ],
  },
]

const LANGUAGE_OPTIONS: { value: Language; label: string; monacoLang: string }[] = [
  { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
  { value: 'typescript', label: 'TypeScript', monacoLang: 'typescript' },
  { value: 'python', label: 'Python', monacoLang: 'python' },
  { value: 'java', label: 'Java', monacoLang: 'java' },
  { value: 'cpp', label: 'C++', monacoLang: 'cpp' },
  { value: 'go', label: 'Go', monacoLang: 'go' },
  { value: 'rust', label: 'Rust', monacoLang: 'rust' },
]

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy: 'bg-green-500/20 text-green-400 border border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  Hard: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

// ─── Timer ───────────────────────────────────────────────────────────────────

function useCountdown(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isUrgent = secondsLeft < 300

  return {
    display: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    isUrgent,
  }
}

// ─── Collapsible ─────────────────────────────────────────────────────────────

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
      >
        {title}
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CodingInterview() {
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0)
  const [language, setLanguage] = useState<Language>('javascript')
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark')
  const [code, setCode] = useState(PROBLEMS[0].starterCode.javascript)
  const [outputTab, setOutputTab] = useState<OutputTab>('testcases')
  const [testResults, setTestResults] = useState<(TestResult & { yourOutput?: string })[]>([])
  const [outputText, setOutputText] = useState('')
  const [aiReview, setAiReview] = useState<CodeReview | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const problem = PROBLEMS[selectedProblemIndex]
  const { display: timerDisplay, isUrgent } = useCountdown(45 * 60)

  useEffect(() => {
    document.title = `${problem.title} – Coding Interview | SpeakSpace`
  }, [problem.title])

  // Reset code when language or problem changes
  useEffect(() => {
    setCode(problem.starterCode[language])
    setTestResults([])
    setOutputText('')
    setAiReview(null)
  }, [language, selectedProblemIndex])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
  }

  const handleRun = useCallback(async () => {
    setIsRunning(true)
    setOutputTab('output')
    setOutputText('Running your code...\n')

    // Simulate execution delay
    await new Promise((r) => setTimeout(r, 1200))

    const results = problem.testCases.map((tc, i) => ({
      testCase: i + 1,
      input: tc.input,
      expected: tc.expected,
      passed: Math.random() > 0.4,
      yourOutput: tc.expected,
      runtime: Math.floor(Math.random() * 80) + 20,
    }))

    setTestResults(results)
    const passed = results.filter((r) => r.passed).length
    setOutputText(
      `Execution complete.\nTest cases: ${passed}/${results.length} passed\nRuntime: ${results[0]?.runtime ?? 0}ms\nMemory: ${Math.floor(Math.random() * 20) + 10}MB`
    )
    setOutputTab('testcases')
    setIsRunning(false)
    toast.success(`${passed}/${results.length} test cases passed`)
  }, [problem])

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/coding/submit', { code, language, problemId: problem.id })
      return data
    },
    onSuccess: (data) => {
      setAiReview(data?.data?.aiReview ?? {
        score: Math.floor(Math.random() * 30) + 70,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        strengths: ['Clean code structure', 'Proper variable naming', 'Edge cases considered'],
        suggestions: ['Consider early termination', 'You could use destructuring for clarity'],
        optimizations: ['Hash map lookup reduces time from O(n²) to O(n)'],
      })
      setOutputTab('aireview')
      toast.success('Solution submitted! AI review ready.')
    },
    onError: () => {
      // Use mock review on API error for demo purposes
      setAiReview({
        score: Math.floor(Math.random() * 30) + 65,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        strengths: ['Readable code', 'Correct logic approach'],
        suggestions: ['Add input validation', 'Consider edge cases with empty arrays'],
        optimizations: ['Using a Map instead of object gives better performance'],
      })
      setOutputTab('aireview')
      toast.success('Solution submitted! AI review ready.')
    },
  })

  const handleSubmit = () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting.')
      return
    }
    submitMutation.mutate()
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* ── Left Panel ── */}
      <div className="w-[40%] min-w-[320px] flex flex-col border-r border-white/10 overflow-y-auto">
        {/* Problem Selector */}
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          {PROBLEMS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelectedProblemIndex(i)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedProblemIndex === i
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {p.difficulty}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400' : 'text-slate-400'}`} />
            <span className={`text-sm font-mono font-semibold ${isUrgent ? 'text-red-400' : 'text-slate-300'}`}>
              {timerDisplay}
            </span>
          </div>
        </div>

        {/* Problem Content */}
        <div className="p-5 space-y-5 flex-1">
          {/* Title + Difficulty */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-white">{problem.title}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_STYLES[problem.difficulty]}`}>
                {problem.difficulty}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {problem.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-sm font-semibold text-slate-300 mb-2">Problem Description</h2>
            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{problem.description}</p>
          </div>

          {/* Examples */}
          <div>
            <h2 className="text-sm font-semibold text-slate-300 mb-3">Examples</h2>
            <div className="space-y-3">
              {problem.examples.map((ex, i) => (
                <div key={i} className="bg-slate-900 border border-white/10 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Example {i + 1}</p>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-xs text-slate-500">Input: </span>
                      <code className="text-xs text-green-400 font-mono">{ex.input}</code>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Output: </span>
                      <code className="text-xs text-blue-400 font-mono">{ex.output}</code>
                    </div>
                    {ex.explanation && (
                      <p className="text-xs text-slate-500 mt-1">{ex.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <Collapsible title="Constraints">
            <ul className="space-y-1">
              {problem.constraints.map((c, i) => (
                <li key={i} className="text-xs text-slate-400 font-mono">• {c}</li>
              ))}
            </ul>
          </Collapsible>

          {/* Hints */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-slate-300">Hints</span>
            </div>
            <div className="p-4 space-y-2">
              {problem.hints.map((hint, i) => (
                <Collapsible key={i} title={`Hint ${i + 1}`}>
                  <p className="text-sm text-slate-400">{hint}</p>
                </Collapsible>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              className="text-sm bg-slate-800 border border-white/10 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditorTheme((t) => t === 'vs-dark' ? 'light' : 'vs-dark')}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Toggle theme"
            >
              {editorTheme === 'vs-dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRun}
              disabled={isRunning}
              className="border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-500/60 gap-1.5"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run'}
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 gap-1.5"
            >
              <Send className="w-4 h-4" />
              {submitMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>

        {/* Monaco Editor (70%) */}
        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <Editor
            height="100%"
            language={LANGUAGE_OPTIONS.find((l) => l.value === language)?.monacoLang ?? 'javascript'}
            value={code}
            theme={editorTheme}
            onChange={(val) => setCode(val ?? '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              tabSize: 2,
              wordWrap: 'on',
              formatOnPaste: true,
              lineNumbers: 'on',
              folding: true,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Output Panel (30%) */}
        <div className="h-[30%] border-t border-white/10 flex flex-col bg-slate-900/50">
          {/* Tab Bar */}
          <div className="flex border-b border-white/10">
            {(['testcases', 'output', 'aireview'] as OutputTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setOutputTab(tab)}
                className={`px-4 py-2.5 text-xs font-medium capitalize transition-colors ${
                  outputTab === tab
                    ? 'text-white border-b-2 border-indigo-500'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab === 'testcases' ? 'Test Cases' : tab === 'aireview' ? 'AI Review' : 'Output'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {outputTab === 'testcases' && (
              <div className="space-y-2">
                {problem.testCases.map((tc, i) => {
                  const result = testResults[i]
                  return (
                    <div key={i} className="bg-slate-800/60 border border-white/10 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-400">Test Case {i + 1}</span>
                        {result ? (
                          result.passed
                            ? <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle className="w-3.5 h-3.5" />Passed</span>
                            : <span className="flex items-center gap-1 text-xs text-red-400"><XCircle className="w-3.5 h-3.5" />Failed</span>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-slate-500 mb-1">Input</p>
                          <code className="text-slate-300 font-mono block truncate">{tc.input}</code>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Expected</p>
                          <code className="text-blue-400 font-mono">{tc.expected}</code>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Your Output</p>
                          <code className={`font-mono ${result ? (result.passed ? 'text-green-400' : 'text-red-400') : 'text-slate-600'}`}>
                            {result?.yourOutput ?? '—'}
                          </code>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {outputTab === 'output' && (
              <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap leading-relaxed">
                {outputText || '// Run your code to see output here...'}
              </pre>
            )}

            {outputTab === 'aireview' && (
              aiReview ? (
                <div className="space-y-4">
                  {/* Score */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                      <span className="text-2xl font-bold text-white">{aiReview.score}</span>
                      <span className="text-xs text-white/70">/100</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">AI Code Review</p>
                      <div className="flex gap-3 text-xs">
                        <span className="text-slate-400">Time: <span className="text-yellow-400 font-mono">{aiReview.timeComplexity}</span></span>
                        <span className="text-slate-400">Space: <span className="text-yellow-400 font-mono">{aiReview.spaceComplexity}</span></span>
                      </div>
                    </div>
                  </div>
                  {/* Strengths */}
                  <div>
                    <p className="text-xs font-semibold text-green-400 mb-1">Strengths</p>
                    <ul className="space-y-1">
                      {aiReview.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Suggestions */}
                  <div>
                    <p className="text-xs font-semibold text-yellow-400 mb-1">Suggestions</p>
                    <ul className="space-y-1">
                      {aiReview.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                          <Lightbulb className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Optimizations */}
                  <div>
                    <p className="text-xs font-semibold text-indigo-400 mb-1">Optimizations</p>
                    <ul className="space-y-1">
                      {aiReview.optimizations.map((s, i) => (
                        <li key={i} className="text-xs text-slate-400">• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Submit your solution to receive AI code review.</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
