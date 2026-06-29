import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  Download,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Mic,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/utils/api'
import type { Interview, InterviewFeedback, InterviewAnswer } from '@/types'

// ---------------------------------------------------------------------------
// Animated counter
// ---------------------------------------------------------------------------
function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setValue(Math.round(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    const id = requestAnimationFrame(step)
    return () => cancelAnimationFrame(id)
  }, [target, duration])
  return value
}

// ---------------------------------------------------------------------------
// Large animated score ring
// ---------------------------------------------------------------------------
function AnimatedRing({
  value,
  label,
  color,
  size = 120,
}: {
  value: number
  label: string
  color: string
  size?: number
}) {
  const count = useCountUp(value)
  const sw = 10
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (count / 100) * circ

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
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
            style={{ transition: 'stroke-dashoffset 0.03s linear' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-white">{count}</span>
          <span className="text-slate-500 text-xs">/ 100</span>
        </div>
      </div>
      <span className="text-slate-300 text-sm font-medium">{label}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Question accordion item
// ---------------------------------------------------------------------------
function QuestionAccordionItem({
  answer,
  index,
}: {
  answer: InterviewAnswer & { questionText?: string }
  index: number
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <p className="text-white text-sm font-medium line-clamp-1">
            {answer.questionText ?? `Question ${index + 1}`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
          {answer.feedback?.score !== undefined && (
            <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${
              answer.feedback.score >= 7 ? 'bg-emerald-500/20 text-emerald-400' :
              answer.feedback.score >= 5 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {answer.feedback.score}/10
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/10">
          {/* Your answer */}
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">Your Answer</p>
            <div className="p-3 bg-slate-800/40 rounded-xl">
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {answer.answer || <span className="text-slate-600 italic">No answer submitted</span>}
              </p>
            </div>
          </div>
          {/* AI Feedback */}
          {answer.feedback && (
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-2">AI Feedback</p>
              <div className="space-y-2">
                {answer.feedback.strengths?.length > 0 && (
                  <div>
                    <p className="text-emerald-400 text-xs mb-1">Strengths</p>
                    {answer.feedback.strengths.map((s, i) => (
                      <p key={i} className="text-slate-300 text-sm">• {s}</p>
                    ))}
                  </div>
                )}
                {answer.feedback.improvements?.length > 0 && (
                  <div>
                    <p className="text-orange-400 text-xs mb-1">Improvements</p>
                    {answer.feedback.improvements.map((s, i) => (
                      <p key={i} className="text-slate-300 text-sm">• {s}</p>
                    ))}
                  </div>
                )}
                {answer.feedback.detailedFeedback && (
                  <p className="text-slate-400 text-sm leading-relaxed pt-1 border-t border-white/10">
                    {answer.feedback.detailedFeedback}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// InterviewReport type (extends Interview with report-specific data)
// ---------------------------------------------------------------------------
interface InterviewReportData extends Interview {
  communicationAnalysis?: {
    fillerWords: { word: string; count: number }[]
    speakingSpeed: number
    totalPauses: number
    avgPauseDuration: number
    grammarScore: number
  }
}

// ---------------------------------------------------------------------------
// InterviewReport page
// ---------------------------------------------------------------------------
export default function InterviewReport() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: report, isLoading, isError } = useQuery<InterviewReportData>({
    queryKey: ['interview-report', id],
    queryFn: async (): Promise<InterviewReportData> => {
      const res = await api.get<{ success: boolean; data: InterviewReportData }>(`/interview/${id}/report`)
      return res.data.data
    },
    enabled: !!id,
    retry: 1,
  })

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-48 rounded-3xl bg-slate-800/60" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl bg-slate-800/60" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl bg-slate-800/60" />
      </div>
    )
  }

  if (isError || !report) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-white text-xl font-semibold mb-2">Report Not Found</h2>
        <p className="text-slate-400 mb-6">This interview report doesn't exist or you don't have access.</p>
        <button
          onClick={() => navigate('/interview')}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors"
        >
          Back to Interviews
        </button>
      </div>
    )
  }

  const feedback: InterviewFeedback | undefined = report.feedback

  const radarData = [
    { subject: 'Technical', value: feedback?.technicalScore ?? 0, fullMark: 100 },
    { subject: 'Communication', value: feedback?.communicationScore ?? 0, fullMark: 100 },
    { subject: 'Confidence', value: feedback?.confidenceScore ?? 0, fullMark: 100 },
    { subject: 'Grammar', value: feedback?.grammarScore ?? 0, fullMark: 100 },
    { subject: 'Vocabulary', value: feedback?.vocabularyScore ?? 0, fullMark: 100 },
    { subject: 'Clarity', value: feedback?.clarityScore ?? 0, fullMark: 100 },
  ]

  const commAnalysis = report.communicationAnalysis

  return (
    <div className="max-w-5xl mx-auto space-y-8 print:space-y-6">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-white/10 rounded-3xl p-8 text-center overflow-hidden"
      >
        {/* Confetti-like decorative dots */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-30"
            style={{
              background: ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b'][i % 5],
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 0.5, 0.3] }}
            transition={{ delay: i * 0.05, duration: 0.6 }}
          />
        ))}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-2">Interview Complete!</h1>
        <div className="flex items-center justify-center gap-4 flex-wrap mt-2">
          <span className={`text-xs px-3 py-1 rounded-full capitalize ${
            report.type === 'technical' ? 'bg-orange-500/20 text-orange-400' :
            report.type === 'coding' ? 'bg-green-500/20 text-green-400' :
            'bg-indigo-500/20 text-indigo-400'
          }`}>
            {report.type.replace('_', ' ')}
          </span>
          <span className="text-slate-400 text-sm">{format(new Date(report.createdAt), 'MMMM d, yyyy')}</span>
          <span className="text-slate-400 text-sm">{report.duration} minutes</span>
        </div>
      </motion.div>

      {/* Score rings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/60 border border-white/10 rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-6">Performance Scores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <AnimatedRing value={feedback?.overallScore ?? 0} label="Overall" color="#6366f1" />
          <AnimatedRing value={feedback?.technicalScore ?? 0} label="Technical" color="#f59e0b" />
          <AnimatedRing value={feedback?.communicationScore ?? 0} label="Communication" color="#10b981" />
          <AnimatedRing value={feedback?.confidenceScore ?? 0} label="Confidence" color="#ec4899" />
        </div>
      </motion.div>

      {/* Radar chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-slate-900/60 border border-white/10 rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Skill Radar</h2>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              labelStyle={{ color: '#f8fafc' }}
              itemStyle={{ color: '#94a3b8' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Main tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/60 border border-white/10 rounded-2xl p-6"
      >
        <Tabs defaultValue="summary">
          <TabsList className="bg-slate-800/60 border border-white/10 rounded-xl p-1 mb-6 flex gap-1 flex-wrap">
            {['summary', 'questions', 'communication', 'download'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-lg px-3 py-1.5 text-slate-400 text-sm capitalize data-[state=active]:bg-slate-700 data-[state=active]:text-white transition-all"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Summary tab */}
          <TabsContent value="summary" className="space-y-5">
            {/* Strengths */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
              <h3 className="text-emerald-400 font-semibold flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4" /> Strengths
              </h3>
              <ul className="space-y-2">
                {(feedback?.strengths ?? ['Strong problem-solving approach', 'Clear communication skills']).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-emerald-100 text-sm">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
              <h3 className="text-red-400 font-semibold flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4" /> Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {(feedback?.weaknesses ?? ['Could improve technical depth', 'Work on structuring longer answers']).map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-red-100 text-sm">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">•</span> {w}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvement plan */}
            {(feedback?.improvementPlan ?? []).length > 0 && (
              <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-3">Improvement Plan</h3>
                <ol className="space-y-2">
                  {(feedback?.improvementPlan ?? []).map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Detailed feedback */}
            {feedback?.summary && (
              <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-2">Detailed Feedback</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{feedback.summary}</p>
              </div>
            )}
          </TabsContent>

          {/* Questions tab */}
          <TabsContent value="questions">
            <div className="space-y-3">
              {report.answers?.length > 0 ? (
                report.answers.map((answer, i) => {
                  const q = report.questions?.find((q) => q._id === answer.question)
                  return (
                    <QuestionAccordionItem
                      key={answer._id ?? i}
                      answer={{ ...answer, questionText: q?.question }}
                      index={i}
                    />
                  )
                })
              ) : (
                <p className="text-slate-500 text-center py-8">No answers recorded for this interview.</p>
              )}
            </div>
          </TabsContent>

          {/* Communication tab */}
          <TabsContent value="communication">
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-5 h-5 text-indigo-400" />
                <h3 className="text-white font-semibold">Communication Analysis</h3>
              </div>

              {!report.voiceEnabled ? (
                <div className="text-center py-10 text-slate-500">
                  <Mic className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>Voice mode was not enabled for this interview.</p>
                  <p className="text-xs mt-1">Enable voice mode to get communication analysis.</p>
                </div>
              ) : (
                <>
                  {/* Filler words */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5">
                    <h4 className="text-white font-medium mb-3">Filler Words</h4>
                    {commAnalysis?.fillerWords?.length ? (
                      <div className="flex flex-wrap gap-3">
                        {commAnalysis.fillerWords.map(({ word, count }) => (
                          <div key={word} className="bg-slate-700/60 rounded-xl px-3 py-2 text-center">
                            <p className="text-orange-300 font-semibold">"{word}"</p>
                            <p className="text-slate-400 text-xs">{count}x</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-emerald-400 text-sm">Great job! No filler words detected.</p>
                    )}
                  </div>

                  {/* Speaking speed + pauses */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-slate-800/40 border border-white/10 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-indigo-300">
                        {commAnalysis?.speakingSpeed ?? 0}
                      </p>
                      <p className="text-slate-400 text-sm mt-1">Words per minute</p>
                    </div>
                    <div className="bg-slate-800/40 border border-white/10 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-purple-300">
                        {commAnalysis?.totalPauses ?? 0}
                      </p>
                      <p className="text-slate-400 text-sm mt-1">Total pauses</p>
                    </div>
                    <div className="bg-slate-800/40 border border-white/10 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-pink-300">
                        {commAnalysis?.avgPauseDuration?.toFixed(1) ?? '0.0'}s
                      </p>
                      <p className="text-slate-400 text-sm mt-1">Avg pause duration</p>
                    </div>
                  </div>

                  {/* Grammar score bar */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5">
                    <div className="flex justify-between mb-2">
                      <h4 className="text-white font-medium">Grammar Score</h4>
                      <span className="text-indigo-300 font-bold">{commAnalysis?.grammarScore ?? feedback?.grammarScore ?? 0}%</span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${commAnalysis?.grammarScore ?? feedback?.grammarScore ?? 0}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Download tab */}
          <TabsContent value="download">
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto">
                <Download className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-white font-semibold text-lg">Download Report</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Save a copy of your interview report as a PDF for future reference.
              </p>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity mx-auto"
              >
                <Download className="w-4 h-4" /> Print / Save as PDF
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex items-center justify-between"
      >
        <button
          onClick={() => navigate('/interview')}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Interviews
        </button>
        <button
          onClick={() => navigate('/interview')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Practice Again
        </button>
      </motion.div>
    </div>
  )
}
