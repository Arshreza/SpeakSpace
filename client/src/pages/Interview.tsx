import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Heart,
  Cpu,
  Code2,
  Network,
  Sliders,
  Mic,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import api from '@/utils/api'
import type {
  Interview as InterviewType,
  InterviewType as IType,
  InterviewDifficulty,
  InterviewExperience,
  InterviewStatus,
} from '@/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const INTERVIEW_TYPES = [
  { type: 'hr' as IType, icon: Users, label: 'HR Round', desc: 'Company culture, teamwork, motivation', color: 'from-blue-600 to-blue-700' },
  { type: 'behavioral' as IType, icon: Heart, label: 'Behavioral', desc: 'STAR method situational questions', color: 'from-purple-600 to-purple-700' },
  { type: 'technical' as IType, icon: Cpu, label: 'Technical', desc: 'Domain-specific technical depth', color: 'from-orange-600 to-orange-700' },
  { type: 'coding' as IType, icon: Code2, label: 'Coding', desc: 'Live DSA problem solving', color: 'from-green-600 to-green-700' },
  { type: 'system_design' as IType, icon: Network, label: 'System Design', desc: 'Architecture and scalability', color: 'from-pink-600 to-pink-700' },
  { type: 'custom' as IType, icon: Sliders, label: 'Custom', desc: 'Mix of topics you choose', color: 'from-slate-600 to-slate-700' },
]

const ROLE_SUGGESTIONS = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Product Manager',
  'DevOps Engineer',
  'ML Engineer',
]

const DIFFICULTIES: { value: InterviewDifficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'border-green-500 text-green-400 bg-green-500/10' },
  { value: 'medium', label: 'Medium', color: 'border-yellow-500 text-yellow-400 bg-yellow-500/10' },
  { value: 'hard', label: 'Hard', color: 'border-red-500 text-red-400 bg-red-500/10' },
]

const EXPERIENCES: { value: InterviewExperience; label: string }[] = [
  { value: 'fresher', label: 'Fresher' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
]

const DURATIONS = [15, 30, 45, 60]

const TYPE_COLORS: Record<string, string> = {
  hr: 'bg-blue-500/20 text-blue-400',
  behavioral: 'bg-purple-500/20 text-purple-400',
  technical: 'bg-orange-500/20 text-orange-400',
  coding: 'bg-green-500/20 text-green-400',
  system_design: 'bg-pink-500/20 text-pink-400',
  custom: 'bg-slate-500/20 text-slate-400',
}

const STATUS_COLORS: Record<InterviewStatus, string> = {
  pending: 'bg-slate-500/20 text-slate-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              i + 1 === current
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                : i + 1 < current
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-500 border border-white/10'
            }`}
          >
            {i + 1 < current ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 w-12 rounded transition-all ${i + 1 < current ? 'bg-emerald-500' : 'bg-slate-700'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Select button helper
// ---------------------------------------------------------------------------
function SelectBtn({
  active,
  onClick,
  children,
  className = '',
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
        active
          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
          : 'border-white/10 bg-slate-800/40 text-slate-400 hover:border-white/20'
      } ${className}`}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Interview page
// ---------------------------------------------------------------------------
export default function Interview() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false)

  // Config state
  const [selectedType, setSelectedType] = useState<IType>('behavioral')
  const [role, setRole] = useState('')
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('medium')
  const [experience, setExperience] = useState<InterviewExperience>('junior')
  const [duration, setDuration] = useState(30)
  const [questionCount, setQuestionCount] = useState(10)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [language, setLanguage] = useState('English')

  const { data: pastInterviews, isLoading: historyLoading } = useQuery<InterviewType[]>({
    queryKey: ['interviews'],
    queryFn: async (): Promise<InterviewType[]> => {
      const res = await api.get<{ success: boolean; data: InterviewType[] }>('/interview')
      return res.data.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<{ success: boolean; data: InterviewType }>('/interview/create', {
        type: selectedType,
        role,
        difficulty,
        experience,
        duration,
        questionCount,
        voiceEnabled,
        language,
      })
      return res.data.data
    },
    onSuccess: (interview) => {
      toast.success('Interview created! Starting session...')
      navigate(`/interview/${interview._id}/session`)
    },
    onError: () => toast.error('Failed to create interview. Please try again.'),
  })

  const filteredInterviews = (pastInterviews ?? []).filter((iv) => {
    if (activeFilter === 'all') return true
    if (['hr', 'behavioral', 'technical', 'coding', 'system_design', 'custom'].includes(activeFilter)) {
      return iv.type === activeFilter
    }
    if (activeFilter === 'completed') return iv.status === 'completed'
    if (activeFilter === 'in_progress') return iv.status === 'in_progress'
    return true
  })

  const canProceed = step === 1 ? !!selectedType : step === 2 ? role.trim().length > 0 : true

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-1">Start Interview</h1>
        <p className="text-slate-400">Configure your AI-powered mock interview session</p>
      </motion.div>

      {/* Step indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-slate-900/60 border border-white/10 rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <StepIndicator current={step} total={3} />
          <p className="text-slate-400 text-sm">
            Step {step} of 3:{' '}
            <span className="text-white">
              {step === 1 ? 'Select Interview Type' : step === 2 ? 'Configure Details' : 'Final Settings'}
            </span>
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Type Selection */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {INTERVIEW_TYPES.map(({ type, icon: Icon, label, desc, color }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      selectedType === type
                        ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                        : 'border-white/10 bg-slate-800/40 hover:border-white/20 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white font-semibold text-sm">{label}</p>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Configuration */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              {/* Target Role */}
              <div>
                <label className="text-white font-medium mb-2 block">Target Role *</label>
                <div className="relative">
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    onFocus={() => setShowRoleSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 150)}
                    placeholder="e.g. Software Engineer"
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  {showRoleSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded-xl overflow-hidden z-10 shadow-xl">
                      {ROLE_SUGGESTIONS.filter((r) => r.toLowerCase().includes(role.toLowerCase())).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onMouseDown={() => { setRole(r); setShowRoleSuggestions(false) }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-white font-medium mb-2 block">Difficulty</label>
                <div className="flex gap-3">
                  {DIFFICULTIES.map(({ value, label, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDifficulty(value)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        difficulty === value ? color : 'border-white/10 bg-slate-800/40 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="text-white font-medium mb-2 block">Experience Level</label>
                <div className="flex gap-2 flex-wrap">
                  {EXPERIENCES.map(({ value, label }) => (
                    <SelectBtn key={value} active={experience === value} onClick={() => setExperience(value)}>
                      {label}
                    </SelectBtn>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-white font-medium mb-2 block">Duration</label>
                <div className="flex gap-2 flex-wrap">
                  {DURATIONS.map((d) => (
                    <SelectBtn key={d} active={duration === d} onClick={() => setDuration(d)}>
                      {d} min
                    </SelectBtn>
                  ))}
                </div>
              </div>

              {/* Number of questions */}
              <div>
                <label className="text-white font-medium mb-2 block">
                  Number of Questions: <span className="text-indigo-400">{questionCount}</span>
                </label>
                <Slider
                  min={5}
                  max={20}
                  step={1}
                  value={[questionCount]}
                  onValueChange={([v]) => setQuestionCount(v)}
                  className="w-full"
                />
                <div className="flex justify-between text-slate-500 text-xs mt-1">
                  <span>5</span>
                  <span>20</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Final settings */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              {/* Voice toggle */}
              <div className="flex items-start justify-between p-4 bg-slate-800/40 border border-white/10 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mic className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Voice Interview</p>
                    <p className="text-slate-400 text-sm mt-0.5">Speak your answers aloud — AI will transcribe and evaluate your speech</p>
                  </div>
                </div>
                <Switch
                  checked={voiceEnabled}
                  onCheckedChange={setVoiceEnabled}
                  className="mt-1 flex-shrink-0"
                />
              </div>

              {/* Language */}
              <div>
                <label className="text-white font-medium mb-2 block">Interview Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  {['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Chinese'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Summary preview */}
              <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-xl p-5 space-y-3">
                <h3 className="text-white font-semibold">Interview Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">Type</p>
                    <p className="text-white capitalize">{selectedType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Role</p>
                    <p className="text-white">{role || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Difficulty</p>
                    <p className="text-white capitalize">{difficulty}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Experience</p>
                    <p className="text-white capitalize">{experience}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Duration</p>
                    <p className="text-white">{duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Questions</p>
                    <p className="text-white">{questionCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Voice Mode</p>
                    <p className="text-white">{voiceEnabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Language</p>
                    <p className="text-white">{language}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-opacity"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !role.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-opacity"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" /> Start Interview
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>

      {/* Past Interviews (only on step 1) */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Past Interviews</h2>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap mb-5">
            {['all', 'hr', 'technical', 'coding', 'completed', 'in_progress'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                  activeFilter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          {historyLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl bg-slate-800/60" />)}
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Code2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No interviews found. Start your first one above!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredInterviews.map((iv) => (
                <div key={iv._id} className="bg-slate-800/40 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[iv.type] ?? 'bg-slate-600/30 text-slate-400'}`}>
                      {iv.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[iv.status]}`}>
                      {iv.status === 'in_progress' ? 'Live' : iv.status}
                    </span>
                  </div>
                  <p className="text-white font-medium mt-2">{iv.role}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs capitalize ${
                      iv.difficulty === 'easy' ? 'text-green-400' : iv.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {iv.difficulty}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500 text-xs">{format(new Date(iv.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  {iv.totalScore !== undefined && (
                    <p className="text-indigo-300 text-sm font-semibold mt-2">{iv.totalScore}%</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    {iv.status === 'completed' ? (
                      <button
                        onClick={() => navigate(`/interview/${iv._id}/report`)}
                        className="flex-1 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs rounded-lg transition-colors"
                      >
                        View Report
                      </button>
                    ) : iv.status === 'in_progress' ? (
                      <button
                        onClick={() => navigate(`/interview/${iv._id}/session`)}
                        className="flex-1 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs rounded-lg transition-colors"
                      >
                        Continue
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
