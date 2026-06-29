import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Upload,
  Trash2,
  RefreshCw,
  Star,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/utils/api'
import { formatFileSize } from '@/utils/formatters'
import type { Resume as ResumeType, ResumeAnalysis, ResumeSuggestion } from '@/types'

// ---------------------------------------------------------------------------
// Score ring
// ---------------------------------------------------------------------------
function ScoreRing({
  value,
  label,
  color,
  size = 100,
}: {
  value: number
  label: string
  color: string
  size?: number
}) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-bold text-white">{value}</span>
        </div>
      </div>
      <span className="text-slate-400 text-sm font-medium">{label}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="text-slate-500 hover:text-indigo-400 transition-colors flex-shrink-0"
      title="Copy suggestion"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Resume page
// ---------------------------------------------------------------------------
export default function Resume() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const { data: resumes, isLoading: resumesLoading } = useQuery<ResumeType[]>({
    queryKey: ['resumes'],
    queryFn: async (): Promise<ResumeType[]> => {
      const res = await api.get<{ success: boolean; data: ResumeType[] }>('/resume')
      return res.data.data
    },
  })

  const activeResume = resumes?.find((r) => r._id === activeResumeId) ?? resumes?.find((r) => r.isDefault) ?? resumes?.[0]

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('resume', file)
      const res = await api.post<{ success: boolean; data: ResumeType }>('/resume/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data
    },
    onSuccess: async (resume) => {
      toast.success('Resume uploaded! Analyzing...')
      setSelectedFile(null)
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
      setActiveResumeId(resume._id)
      setIsAnalyzing(true)
      try {
        await api.post(`/resume/${resume._id}/analyze`)
        queryClient.invalidateQueries({ queryKey: ['resumes'] })
        toast.success('Analysis complete!')
      } catch {
        toast.error('Analysis failed. Please try again.')
      } finally {
        setIsAnalyzing(false)
      }
    },
    onError: () => toast.error('Upload failed. Check file size and format.'),
  })

  const analyzeMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsAnalyzing(true)
      await api.post(`/resume/${id}/analyze`)
    },
    onSuccess: () => {
      toast.success('Re-analysis complete!')
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
    },
    onError: () => toast.error('Analysis failed'),
    onSettled: () => setIsAnalyzing(false),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/resume/${id}`),
    onSuccess: () => {
      toast.success('Resume deleted')
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => api.put(`/resume/${id}/default`),
    onSuccess: () => {
      toast.success('Set as default resume')
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
    },
    onError: () => toast.error('Failed to set default'),
  })

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10 MB.')
      return
    }
    setSelectedFile(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    multiple: false,
  })

  const analysis: ResumeAnalysis | undefined = activeResume?.analysis

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-1">Resume Analyzer</h1>
        <p className="text-slate-400">Upload your resume for AI-powered ATS analysis and improvement suggestions</p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-slate-900/60 border border-white/10 rounded-2xl p-6"
      >
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-white/20 hover:border-white/40 hover:bg-white/5'
          }`}
        >
          <input {...getInputProps()} />
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          {selectedFile ? (
            <div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-slate-400 text-sm mt-1">{formatFileSize(selectedFile.size)}</p>
            </div>
          ) : (
            <div>
              <p className="text-white font-medium text-lg">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p className="text-slate-400 text-sm mt-2">or</p>
              <button
                type="button"
                className="mt-3 px-5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-lg text-sm transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Browse files
              </button>
              <p className="text-slate-500 text-xs mt-3">PDF only · Max 10 MB</p>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => uploadMutation.mutate(selectedFile)}
              disabled={uploadMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload & Analyze
            </button>
            <button
              onClick={() => setSelectedFile(null)}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </motion.div>

      {/* Analyzing progress */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/60 border border-indigo-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <p className="text-white font-medium">Analyzing your resume with AI...</p>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-pulse w-3/4" />
            </div>
            <p className="text-slate-400 text-sm mt-2">This may take 10-30 seconds</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results */}
      {analysis && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Score cards */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Analysis Scores</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <ScoreRing value={analysis.atsScore} label="ATS Score" color="#10b981" />
              <ScoreRing value={analysis.grammarScore} label="Grammar" color="#3b82f6" />
              <ScoreRing value={analysis.keywordScore} label="Keywords" color="#a855f7" />
              <ScoreRing value={analysis.overallScore} label="Overall" color="#6366f1" />
            </div>
          </div>

          {/* Analysis Tabs */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <Tabs defaultValue="overview">
              <TabsList className="bg-slate-800/60 border border-white/10 rounded-xl p-1 mb-6 flex gap-1">
                {['overview', 'skills', 'suggestions', 'issues'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-lg px-3 py-1.5 text-slate-400 text-sm capitalize data-[state=active]:bg-slate-700 data-[state=active]:text-white transition-all"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-emerald-400 font-medium flex items-center gap-2">
                      <Check className="w-4 h-4" /> Key Strengths
                    </h3>
                    <ul className="space-y-2">
                      {(analysis.improvements ?? []).slice(0, 3).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                          <span className="text-emerald-500 mt-0.5">•</span> {s}
                        </li>
                      ))}
                      {(analysis.improvements ?? []).length === 0 && (
                        <li className="text-slate-500 text-sm">No specific strengths highlighted</li>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-orange-400 font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Key Improvements
                    </h3>
                    <ul className="space-y-2">
                      {(analysis.suggestions ?? []).slice(0, 3).map((s: ResumeSuggestion, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                          <span className="text-orange-400 mt-0.5">•</span> {s.suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Section checklist */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-white font-medium mb-3">Resume Sections</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(analysis.sections ?? {}).map(([key, present]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${present ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                          {present
                            ? <Check className="w-2.5 h-2.5 text-emerald-400" />
                            : <AlertTriangle className="w-2.5 h-2.5 text-red-400" />}
                        </div>
                        <span className="text-slate-300 text-sm capitalize">
                          {key.replace('has', '').replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Skills */}
              <TabsContent value="skills">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-emerald-400 font-medium mb-3">Found Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {(analysis.skills?.found ?? []).map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                      {(analysis.skills?.found ?? []).length === 0 && <p className="text-slate-500 text-sm">None found</p>}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-red-400 font-medium mb-3">Missing Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {(analysis.skills?.missing ?? []).map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-full flex items-center gap-1">
                          <Plus className="w-3 h-3" /> {skill}
                        </span>
                      ))}
                      {(analysis.skills?.missing ?? []).length === 0 && <p className="text-slate-500 text-sm">No missing skills detected</p>}
                    </div>
                    <h3 className="text-blue-400 font-medium mt-4 mb-3">Recommended Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {(analysis.skills?.recommended ?? []).map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Suggestions */}
              <TabsContent value="suggestions">
                <div className="space-y-3">
                  {(analysis.suggestions ?? []).length === 0 ? (
                    <p className="text-slate-500 text-center py-6">No suggestions at this time.</p>
                  ) : (
                    (analysis.suggestions ?? []).map((s: ResumeSuggestion, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-slate-800/40 border border-white/5 rounded-xl">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              s.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              s.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {s.priority}
                            </span>
                            <span className="text-slate-500 text-xs capitalize">{s.category}</span>
                          </div>
                          <p className="text-slate-300 text-sm">{s.suggestion}</p>
                          {s.impact && <p className="text-slate-500 text-xs mt-1">Impact: {s.impact}</p>}
                        </div>
                        <CopyButton text={s.suggestion} />
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Issues */}
              <TabsContent value="issues">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 border-b border-white/10">
                        <th className="text-left pb-3 pr-4 font-medium">Issue</th>
                        <th className="text-left pb-3 font-medium">Suggestion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analysis.suggestions ?? []).filter((s: ResumeSuggestion) => s.category === 'grammar').length === 0 ? (
                        <tr>
                          <td colSpan={2} className="py-6 text-center text-slate-500">No grammar issues found — great job!</td>
                        </tr>
                      ) : (
                        (analysis.suggestions ?? [])
                          .filter((s: ResumeSuggestion) => s.category === 'grammar')
                          .map((s: ResumeSuggestion, i: number) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-slate-800/30">
                              <td className="py-3 pr-4 text-red-300 align-top">{s.category}</td>
                              <td className="py-3 text-slate-300">{s.suggestion}</td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      )}

      {/* Previous Resumes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-slate-900/60 border border-white/10 rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Your Resumes</h2>
        {resumesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl bg-slate-800/60" />)}
          </div>
        ) : !resumes?.length ? (
          <p className="text-slate-500 text-sm text-center py-6">No resumes uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                onClick={() => setActiveResumeId(resume._id)}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  (activeResume?._id === resume._id || (!activeResumeId && resume.isDefault))
                    ? 'border-indigo-500/50 bg-indigo-500/10'
                    : 'border-white/5 bg-slate-800/40 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">{resume.fileName}</p>
                    <p className="text-slate-500 text-xs">
                      {format(new Date(resume.createdAt), 'MMM d, yyyy')} · {formatFileSize(resume.fileSize)}
                      {resume.isDefault && <span className="ml-2 text-indigo-400">· Default</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {resume.analysis?.overallScore !== undefined && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      resume.analysis.overallScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                      resume.analysis.overallScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {resume.analysis.overallScore}%
                    </span>
                  )}
                  {!resume.isDefault && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDefaultMutation.mutate(resume._id) }}
                      className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors"
                      title="Set as default"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); analyzeMutation.mutate(resume._id) }}
                    disabled={analyzeMutation.isPending}
                    className="p-1.5 text-slate-500 hover:text-indigo-400 transition-colors"
                    title="Re-analyze"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(resume._id) }}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* AI Resume Builder CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> AI Resume Builder
          </h3>
          <p className="text-slate-400 text-sm mt-1">Let AI generate a tailored resume based on your profile and target role.</p>
        </div>
        <button
          onClick={() => navigate('/resume/builder')}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Generate Resume <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  )
}

// Missing icon
function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
