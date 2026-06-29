import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  CheckSquare,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Zap,
  Code,
  Server,
  Layers,
  Globe,
  Database,
  Terminal,
  Brain,
  Loader2,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import api from '@/utils/api'
import type { Roadmap, RoadmapTask, RoadmapWeek } from '@/types'

// ─── Static Data ─────────────────────────────────────────────────────────────

type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced'
type CourseCategory = 'All' | 'Algorithms' | 'System Design' | 'Behavioral' | 'Frontend' | 'Backend' | 'DevOps'

interface StaticCourse {
  id: number
  title: string
  category: Exclude<CourseCategory, 'All'>
  instructor: string
  level: CourseLevel
  duration: string
  enrolledCount: number
  rating: number
  gradient: string
  icon: React.ComponentType<{ className?: string }>
}

const COURSES: StaticCourse[] = [
  { id: 1, title: 'Cracking the Coding Interview', category: 'Algorithms', instructor: 'Dr. Sarah Chen', level: 'Advanced', duration: '20h', enrolledCount: 15420, rating: 4.9, gradient: 'from-indigo-500 to-purple-600', icon: Code },
  { id: 2, title: 'System Design for Beginners', category: 'System Design', instructor: 'Alex Johnson', level: 'Intermediate', duration: '12h', enrolledCount: 9830, rating: 4.8, gradient: 'from-blue-500 to-cyan-600', icon: Server },
  { id: 3, title: 'Behavioral Interview Mastery', category: 'Behavioral', instructor: 'Emily Torres', level: 'Beginner', duration: '6h', enrolledCount: 22100, rating: 4.7, gradient: 'from-green-500 to-emerald-600', icon: Brain },
  { id: 4, title: 'React & Frontend Interview Prep', category: 'Frontend', instructor: 'Mike Kim', level: 'Intermediate', duration: '10h', enrolledCount: 11230, rating: 4.8, gradient: 'from-orange-500 to-amber-600', icon: Globe },
  { id: 5, title: 'Node.js Backend Interview Guide', category: 'Backend', instructor: 'James Wilson', level: 'Intermediate', duration: '8h', enrolledCount: 7640, rating: 4.6, gradient: 'from-pink-500 to-rose-600', icon: Terminal },
  { id: 6, title: 'Data Structures Deep Dive', category: 'Algorithms', instructor: 'Dr. Priya Nair', level: 'Advanced', duration: '15h', enrolledCount: 13890, rating: 4.9, gradient: 'from-violet-500 to-purple-600', icon: Layers },
  { id: 7, title: 'Dynamic Programming Patterns', category: 'Algorithms', instructor: 'Chris Patel', level: 'Advanced', duration: '12h', enrolledCount: 8760, rating: 4.8, gradient: 'from-cyan-500 to-blue-600', icon: Code },
  { id: 8, title: 'Kubernetes & DevOps Interview', category: 'DevOps', instructor: 'Nina Sharma', level: 'Advanced', duration: '9h', enrolledCount: 5430, rating: 4.7, gradient: 'from-red-500 to-orange-600', icon: Database },
]

const COURSE_CATEGORIES: CourseCategory[] = ['All', 'Algorithms', 'System Design', 'Behavioral', 'Frontend', 'Backend', 'DevOps']

const LEVEL_STYLES: Record<CourseLevel, string> = {
  Beginner: 'bg-green-500/20 text-green-400 border border-green-500/30',
  Intermediate: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  Advanced: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

interface StaticQuiz {
  id: number
  title: string
  category: string
  questions: number
  time: number
  xp: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  icon: React.ComponentType<{ className?: string }>
}

const QUIZZES: StaticQuiz[] = [
  { id: 1, title: 'DSA Fundamentals', category: 'Algorithms', questions: 20, time: 15, xp: 100, difficulty: 'Easy', icon: Code },
  { id: 2, title: 'System Design Concepts', category: 'System Design', questions: 15, time: 12, xp: 150, difficulty: 'Hard', icon: Server },
  { id: 3, title: 'JavaScript ES6+', category: 'Frontend', questions: 25, time: 20, xp: 120, difficulty: 'Medium', icon: Globe },
  { id: 4, title: 'Python for Interviews', category: 'Algorithms', questions: 20, time: 15, xp: 100, difficulty: 'Easy', icon: Terminal },
  { id: 5, title: 'Behavioral Questions Bank', category: 'Behavioral', questions: 30, time: 25, xp: 200, difficulty: 'Medium', icon: Brain },
  { id: 6, title: 'Database & SQL', category: 'Backend', questions: 20, time: 15, xp: 130, difficulty: 'Medium', icon: Database },
]

const QUIZ_DIFF_STYLES = {
  Easy: 'bg-green-500/20 text-green-400',
  Medium: 'bg-yellow-500/20 text-yellow-400',
  Hard: 'bg-red-500/20 text-red-400',
}

const TARGET_COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Adobe', 'Uber', 'Apple', 'Other']
const TARGET_ROLES = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Engineer', 'ML Engineer', 'DevOps Engineer', 'Product Manager']

// ─── Courses Tab ─────────────────────────────────────────────────────────────

function CoursesTab() {
  const [category, setCategory] = useState<CourseCategory>('All')
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set())

  const filtered = category === 'All' ? COURSES : COURSES.filter((c) => c.category === category)

  const handleEnroll = (courseId: number) => {
    setEnrolledIds((prev) => {
      const next = new Set(prev)
      next.add(courseId)
      return next
    })
    toast.success('Enrolled successfully! Happy learning!')
  }

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {COURSE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              category === cat
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((course) => {
          const Icon = course.icon
          const isEnrolled = enrolledIds.has(course.id)
          return (
            <div key={course.id} className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all flex flex-col">
              {/* Thumbnail */}
              <div className={`h-32 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}>
                <Icon className="w-12 h-12 text-white/80" />
              </div>
              {/* Content */}
              <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{course.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${LEVEL_STYLES[course.level]}`}>{course.level}</span>
                </div>
                <h3 className="font-semibold text-white text-sm leading-snug">{course.title}</h3>
                <p className="text-xs text-slate-500">{course.instructor}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.enrolledCount.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />{course.rating}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => !isEnrolled && handleEnroll(course.id)}
                  className={`mt-auto w-full ${isEnrolled ? 'bg-green-600/20 text-green-400 border border-green-600/30 cursor-default' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white'}`}
                >
                  {isEnrolled ? (
                    <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5" /> Enrolled</span>
                  ) : (
                    <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5" /> Enroll</span>
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Roadmap Tab ─────────────────────────────────────────────────────────────

function WeekBlock({ week, onToggleTask }: { week: RoadmapWeek; onToggleTask: (taskIndex: number) => void }) {
  const [open, setOpen] = useState(false)
  const done = week.tasks.filter((t) => t.completed).length
  const pct = Math.round((done / week.tasks.length) * 100)

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-5 py-4"
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Week {week.week}: {week.theme}</p>
            <p className="text-xs text-slate-400">{done}/{week.tasks.length} tasks completed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-indigo-400 font-medium">{pct}%</span>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4 space-y-2 border-t border-white/5">
          {week.tasks.map((task, i) => (
            <label key={i} className="flex items-start gap-3 py-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask(i)}
                className="mt-0.5 w-4 h-4 rounded accent-indigo-500"
              />
              <div className="flex-1">
                <p className={`text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                  {task.title}
                </p>
                <p className="text-xs text-slate-500">{task.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{task.type}</span>
                  <span className="text-xs text-slate-500">{task.estimatedHours}h</span>
                </div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

function RoadmapTab() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [formData, setFormData] = useState({ targetCompany: '', targetRole: '', skills: '' })
  const [dayTab, setDayTab] = useState<'30' | '60' | '90'>('30')

  const { data: existingRoadmap, isLoading: isFetchingRoadmap } = useQuery<Roadmap | null>({
    queryKey: ['roadmap'],
    queryFn: async (): Promise<Roadmap | null> => {
      const { data } = await api.get<{ data: Roadmap | null }>('/ai/roadmap')
      return data.data
    },
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (existingRoadmap && !roadmap) setRoadmap(existingRoadmap)
  }, [existingRoadmap])

  const generateMutation = useMutation({
    mutationFn: async () => {
      const skills = formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
      const { data } = await api.post('/ai/roadmap', {
        targetCompany: formData.targetCompany,
        targetRole: formData.targetRole,
        currentSkills: skills,
      })
      return data as { data: Roadmap }
    },
    onSuccess: (data) => {
      setRoadmap(data.data)
      toast.success('Your personalized roadmap is ready!')
    },
    onError: () => toast.error('Failed to generate roadmap. Please try again.'),
  })

  const handleToggleTask = (phase: 'thirtyDays' | 'sixtyDays' | 'ninetyDays', weekIdx: number, taskIdx: number) => {
    if (!roadmap) return
    setRoadmap((prev) => {
      if (!prev) return prev
      const next = { ...prev, plan: { ...prev.plan } }
      const weeks = [...next.plan[phase]]
      weeks[weekIdx] = {
        ...weeks[weekIdx],
        tasks: weeks[weekIdx].tasks.map((t, i) =>
          i === taskIdx ? { ...t, completed: !t.completed } : t
        ),
      }
      next.plan[phase] = weeks
      return next
    })
  }

  const activeRoadmap = roadmap ?? existingRoadmap

  if (isFetchingRoadmap) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  if (!activeRoadmap) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Generate Your Personalized Roadmap</h2>
            <p className="text-sm text-slate-400">Tell us your goals and we'll create a 90-day plan tailored for you.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Current Skills <span className="text-slate-500">(comma-separated)</span></label>
              <input
                value={formData.skills}
                onChange={(e) => setFormData((f) => ({ ...f, skills: e.target.value }))}
                placeholder="e.g. JavaScript, React, SQL, Python"
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Target Company</label>
              <select
                value={formData.targetCompany}
                onChange={(e) => setFormData((f) => ({ ...f, targetCompany: e.target.value }))}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="">Select a company...</option>
                {TARGET_COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Target Role</label>
              <select
                value={formData.targetRole}
                onChange={(e) => setFormData((f) => ({ ...f, targetRole: e.target.value }))}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="">Select a role...</option>
                {TARGET_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={!formData.targetCompany || !formData.targetRole || generateMutation.isPending}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white h-12"
            >
              {generateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating your roadmap with AI...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5" /> Generate Roadmap
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const phaseMap: Record<string, 'thirtyDays' | 'sixtyDays' | 'ninetyDays'> = {
    '30': 'thirtyDays',
    '60': 'sixtyDays',
    '90': 'ninetyDays',
  }

  const currentPhase = phaseMap[dayTab]
  const weeks = activeRoadmap.plan[currentPhase] ?? []
  const totalTasks = weeks.reduce((s, w) => s + w.tasks.length, 0)
  const doneTasks = weeks.reduce((s, w) => s + w.tasks.filter((t) => t.completed).length, 0)
  const overallPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div>
      {/* Roadmap Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            Your 90-Day Roadmap to {activeRoadmap.targetCompany}
          </h2>
          <p className="text-sm text-slate-400 mt-1">{activeRoadmap.targetRole}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setRoadmap(null) }}
          className="border-white/10 hover:border-indigo-500/40 gap-1.5"
        >
          <RotateCcw className="w-4 h-4" /> Regenerate
        </Button>
      </div>

      {/* Day Tabs */}
      <div className="flex items-center gap-4 mb-6">
        {(['30', '60', '90'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDayTab(d)}
            className={`text-sm px-5 py-2 rounded-full border transition-colors ${
              dayTab === d ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-white/10 text-slate-400 hover:border-indigo-500/40'
            }`}
          >
            {d} Days
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 text-sm">
          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
          </div>
          <span className="text-indigo-400 font-medium">{overallPct}% complete</span>
        </div>
      </div>

      {/* Weeks */}
      <div className="space-y-3">
        {weeks.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No tasks for this phase yet.</p>
        ) : (
          weeks.map((week, wi) => (
            <WeekBlock
              key={wi}
              week={week}
              onToggleTask={(ti) => handleToggleTask(currentPhase, wi, ti)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Quizzes Tab ──────────────────────────────────────────────────────────────

function QuizzesTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {QUIZZES.map((quiz) => {
        const Icon = quiz.icon
        return (
          <div key={quiz.id} className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-all flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${QUIZ_DIFF_STYLES[quiz.difficulty]}`}>
                {quiz.difficulty}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">{quiz.title}</h3>
              <p className="text-xs text-slate-500">{quiz.category}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{quiz.questions} questions</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{quiz.time} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-semibold">
              <Zap className="w-3.5 h-3.5" /> {quiz.xp} XP reward
            </div>
            <Button
              size="sm"
              onClick={() => toast('Coming Soon! Quizzes will be available in the next update.', { icon: '🚀' })}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
            >
              Start Quiz
            </Button>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Learning() {
  useEffect(() => {
    document.title = 'Learning Hub | SpeakSpace'
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Learning Hub</h1>
        <p className="text-slate-400">Courses, personalized roadmaps, and quizzes to ace your next interview.</p>
      </div>

      <Tabs defaultValue="courses">
        <TabsList className="bg-slate-800/60 border border-white/10 mb-8">
          <TabsTrigger value="courses" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Courses</TabsTrigger>
          <TabsTrigger value="roadmap" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">My Roadmap</TabsTrigger>
          <TabsTrigger value="quizzes" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="courses"><CoursesTab /></TabsContent>
        <TabsContent value="roadmap"><RoadmapTab /></TabsContent>
        <TabsContent value="quizzes"><QuizzesTab /></TabsContent>
      </Tabs>
    </div>
  )
}
