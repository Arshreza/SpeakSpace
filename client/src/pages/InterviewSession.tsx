import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Send,
  CheckCircle,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import Editor from '@monaco-editor/react'
import toast from 'react-hot-toast'

import { Skeleton } from '@/components/ui/skeleton'
import api from '@/utils/api'
import type { Interview, InterviewQuestion, AnswerFeedback } from '@/types'

// ---------------------------------------------------------------------------
// Timer
// ---------------------------------------------------------------------------
function useTimer(initialSeconds: number, onExpire?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (initialSeconds <= 0) return
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!)
          onExpire?.()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [initialSeconds])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const isLow = seconds < 300

  return { display: `${mm}:${ss}`, isLow, seconds }
}

// ---------------------------------------------------------------------------
// Score ring (small, inline)
// ---------------------------------------------------------------------------
function MiniRing({ value }: { value: number }) {
  const size = 72
  const sw = 6
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 10) * circ
  const color = value >= 7 ? '#10b981' : value >= 5 ? '#f59e0b' : '#ef4444'

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={sw} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Voice recorder hook
// ---------------------------------------------------------------------------
function useVoiceRecorder(onTranscript: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const form = new FormData()
        form.append('audio', blob, 'recording.webm')
        try {
          const res = await api.post<{ success: boolean; data: { text: string } }>('/ai/stt', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          onTranscript(res.data.data.text)
        } catch {
          toast.error('Speech recognition failed')
        }
      }
      mr.start()
      mediaRef.current = mr
      setIsRecording(true)
    } catch {
      toast.error('Microphone access denied')
    }
  }, [onTranscript])

  const stop = useCallback(() => {
    mediaRef.current?.stop()
    setIsRecording(false)
  }, [])

  const toggle = useCallback(() => {
    if (isRecording) stop()
    else start()
  }, [isRecording, start, stop])

  return { isRecording, toggle }
}

// ---------------------------------------------------------------------------
// Hint accordion
// ---------------------------------------------------------------------------
function HintAccordion({ hints }: { hints: string[] }) {
  const [open, setOpen] = useState(false)
  if (!hints?.length) return null
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors"
      >
        <Lightbulb className="w-4 h-4" />
        {open ? 'Hide Hint' : 'Show Hint'}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1.5">
              {hints.map((h, i) => (
                <p key={i} className="text-amber-200 text-sm">• {h}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Feedback panel
// ---------------------------------------------------------------------------
function FeedbackPanel({ feedback }: { feedback: AnswerFeedback | null }) {
  const [showExample, setShowExample] = useState(false)

  if (!feedback) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
          <Send className="w-7 h-7 text-slate-600" />
        </div>
        <p className="text-slate-400 font-medium">Submit your answer</p>
        <p className="text-slate-600 text-sm mt-1">AI feedback will appear here</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 h-full overflow-y-auto"
    >
      {/* Score */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <MiniRing value={feedback.score} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{feedback.score}</span>
          </div>
        </div>
        <div>
          <p className="text-white font-semibold">AI Score</p>
          <p className="text-slate-400 text-xs">Out of 10</p>
        </div>
      </div>

      {/* Strengths */}
      {feedback.strengths?.length > 0 && (
        <div>
          <p className="text-emerald-400 text-sm font-medium mb-1.5">Strengths</p>
          <ul className="space-y-1">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-slate-300 text-sm">
                <span className="text-emerald-500 mt-0.5">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {feedback.improvements?.length > 0 && (
        <div>
          <p className="text-orange-400 text-sm font-medium mb-1.5">Areas to Improve</p>
          <ul className="space-y-1">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 text-slate-300 text-sm">
                <span className="text-orange-400 mt-0.5">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed feedback */}
      {feedback.detailedFeedback && (
        <div>
          <button
            type="button"
            onClick={() => setShowExample((s) => !s)}
            className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
          >
            {showExample ? '▲ Hide' : '▼ Show'} Example Answer
          </button>
          <AnimatePresence>
            {showExample && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <p className="text-slate-300 text-sm leading-relaxed">{feedback.detailedFeedback}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Completion overlay
// ---------------------------------------------------------------------------
function CompletionOverlay({ score, interviewId, onNewInterview }: { score: number; interviewId: string; onNewInterview: () => void }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/80 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Interview Complete!</h2>
        <p className="text-slate-400 mb-6">You've completed the interview session</p>
        <div className="bg-slate-800/60 rounded-2xl py-4 px-6 mb-6 inline-block w-full">
          <p className="text-slate-400 text-sm">Overall Score</p>
          <p className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-1">
            {score}%
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(`/interview/${interviewId}/report`)}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            View Full Report
          </button>
          <button
            onClick={onNewInterview}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
          >
            Start New Interview
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// InterviewSession page
// ---------------------------------------------------------------------------
export default function InterviewSession() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [code, setCode] = useState('')
  const [codeLanguage, setCodeLanguage] = useState('javascript')
  const [feedback, setFeedback] = useState<Record<string, AnswerFeedback>>({})
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [completionData, setCompletionData] = useState<{ score: number } | null>(null)
  const [transcript, setTranscript] = useState('')
  const [interviewStarted, setInterviewStarted] = useState(false)

  const { data: interview, isLoading } = useQuery<Interview>({
    queryKey: ['interview', id],
    queryFn: async (): Promise<Interview> => {
      const res = await api.get<{ success: boolean; data: Interview }>(`/interview/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })

  // Start interview on mount
  useEffect(() => {
    if (interview && !interviewStarted && interview.status === 'pending') {
      api.post(`/interview/${id}/start`).catch(() => {})
      setInterviewStarted(true)
    }
    if (interview && interview.status === 'in_progress' && !interviewStarted) {
      setInterviewStarted(true)
    }
  }, [interview, id, interviewStarted])

  const durationSeconds = (interview?.duration ?? 30) * 60
  const { display: timerDisplay, isLow } = useTimer(
    durationSeconds,
    () => toast('Time is up!', { icon: '⏰' })
  )

  const questions: InterviewQuestion[] = interview?.questions ?? []
  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isCodingType = currentQuestion?.type === 'coding'

  const currentAnswer = isCodingType
    ? code
    : (answers[currentQuestion?._id ?? ''] ?? transcript)

  const { isRecording, toggle: toggleRecording } = useVoiceRecorder((text) => {
    setTranscript((prev) => prev + (prev ? ' ' : '') + text)
  })

  const submitAnswerMutation = useMutation({
    mutationFn: async (isComplete: boolean) => {
      if (!currentQuestion) return null
      setSubmittingAnswer(true)
      const res = await api.post<{ success: boolean; data: { feedback: AnswerFeedback } }>(
        `/interview/${id}/answer`,
        {
          questionId: currentQuestion._id,
          answer: currentAnswer,
          timeTaken: 0,
        }
      )
      if (isComplete) {
        const completeRes = await api.post<{ success: boolean; data: { totalScore: number } }>(
          `/interview/${id}/complete`
        )
        return { feedback: res.data.data.feedback, totalScore: completeRes.data.data.totalScore, isComplete }
      }
      return { feedback: res.data.data.feedback, isComplete }
    },
    onSuccess: (data) => {
      if (!data) return
      if (currentQuestion) {
        setFeedback((prev) => ({ ...prev, [currentQuestion._id]: data.feedback }))
      }
      if (data.isComplete && 'totalScore' in data) {
        setCompletionData({ score: data.totalScore ?? 0 })
      } else if (!data.isComplete) {
        setCurrentQuestionIndex((i) => i + 1)
        setTranscript('')
        setCode('')
      }
    },
    onError: () => toast.error('Failed to submit answer'),
    onSettled: () => setSubmittingAnswer(false),
  })

  const handleSubmit = (isComplete: boolean) => {
    submitAnswerMutation.mutate(isComplete)
  }

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1)
      setTranscript('')
      setCode('')
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1)
      setTranscript('')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <Skeleton className="h-14 rounded-2xl bg-slate-800/60" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="col-span-2 h-[500px] rounded-2xl bg-slate-800/60" />
          <Skeleton className="h-[500px] rounded-2xl bg-slate-800/60" />
        </div>
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Interview not found.</p>
        <button onClick={() => navigate('/interview')} className="mt-4 text-indigo-400 hover:text-indigo-300">
          Back to Interviews
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Completion overlay */}
      {completionData && (
        <CompletionOverlay
          score={completionData.score}
          interviewId={id!}
          onNewInterview={() => navigate('/interview')}
        />
      )}

      {/* Top progress bar */}
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
          style={{ width: questions.length > 0 ? `${((currentQuestionIndex + 1) / questions.length) * 100}%` : '0%' }}
        />
      </div>

      {/* Header bar */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-white font-semibold capitalize">{interview.type.replace('_', ' ')} Interview</p>
          <p className="text-slate-400 text-sm">{interview.role}</p>
        </div>
        <div className="text-center">
          <span className={`text-2xl font-mono font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>
            {timerDisplay}
          </span>
          {isLow && <p className="text-red-400 text-xs animate-pulse">Less than 5 min!</p>}
        </div>
        <div className="text-right">
          <p className="text-white font-semibold">
            {currentQuestionIndex + 1} / {questions.length}
          </p>
          <p className="text-slate-400 text-sm">Questions</p>
        </div>
      </div>

      {/* Main content */}
      {currentQuestion ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* LEFT: Question panel (60%) */}
          <div className="lg:col-span-3 bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
            {/* Question */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {currentQuestionIndex + 1}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 capitalize">
                  {currentQuestion.type.replace('_', ' ')}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${
                  currentQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                  currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
              <p className="text-white text-lg leading-relaxed font-medium">{currentQuestion.question}</p>
              <HintAccordion hints={currentQuestion.hints ?? []} />
            </div>

            {/* Answer area */}
            {isCodingType ? (
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm font-medium">Code Editor</p>
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                  >
                    {['javascript', 'typescript', 'python', 'java', 'cpp', 'go', 'rust'].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: '300px' }}>
                  <Editor
                    height="300px"
                    language={codeLanguage}
                    value={code || currentQuestion.codeTemplate || ''}
                    onChange={(v) => setCode(v ?? '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      padding: { top: 12, bottom: 12 },
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-3">
                {interview.voiceEnabled && (
                  <div>
                    <p className="text-slate-400 text-sm mb-3">Voice Answer</p>
                    <div className="flex justify-center mb-4">
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                          isRecording
                            ? 'bg-red-600 shadow-lg shadow-red-600/40 scale-110 animate-pulse'
                            : 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:scale-105'
                        }`}
                      >
                        {isRecording ? (
                          <MicOff className="w-8 h-8 text-white" />
                        ) : (
                          <Mic className="w-8 h-8 text-white" />
                        )}
                      </button>
                    </div>
                    {transcript && (
                      <div className="p-3 bg-slate-800/60 rounded-xl border border-white/10">
                        <p className="text-slate-300 text-sm leading-relaxed">{transcript}</p>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <p className="text-slate-400 text-sm mb-2">
                    {interview.voiceEnabled ? 'Or type your answer:' : 'Your Answer:'}
                  </p>
                  <textarea
                    value={answers[currentQuestion._id] ?? ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [currentQuestion._id]: e.target.value }))
                    }
                    placeholder="Type your answer here..."
                    rows={8}
                    style={{ minHeight: '200px' }}
                    className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-xl transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <div className="flex gap-2">
                {!isLastQuestion && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition-colors"
                  >
                    <SkipForward className="w-4 h-4" /> Skip
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSubmit(isLastQuestion)}
                  disabled={submittingAnswer || (!currentAnswer?.trim())}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-xl font-medium transition-opacity"
                >
                  {submittingAnswer ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isLastQuestion ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isLastQuestion ? 'Complete Interview' : 'Submit Answer'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Feedback panel (40%) */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <p className="text-white font-semibold mb-4">AI Feedback</p>
            <FeedbackPanel feedback={feedback[currentQuestion._id] ?? null} />
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p>Loading questions...</p>
        </div>
      )}
    </div>
  )
}
