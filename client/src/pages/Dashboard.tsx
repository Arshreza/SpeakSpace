import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Mic,
  FileText,
  Code2,
  Bot,
  Trophy,
  Flame,
  TrendingUp,
  Calendar,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import useAuthStore from '@/store/authStore'
import api from '@/utils/api'
import toast from 'react-hot-toast'
import type { DashboardStats, Interview, Achievement, LeaderboardEntry } from '@/types'

// ---------------------------------------------------------------------------
// Inline StatCard
// ---------------------------------------------------------------------------
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  trend?: string
  color: string
}) {
  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-slate-400 text-sm mt-1">{label}</p>
      {trend && <p className="text-emerald-400 text-xs mt-2">{trend}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SVG Ring Progress
// ---------------------------------------------------------------------------
function RingProgress({ value, size = 120, strokeWidth = 10 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Skill bar
// ---------------------------------------------------------------------------
function SkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-white font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Type badge colours
// ---------------------------------------------------------------------------
const TYPE_COLORS: Record<string, string> = {
  hr: 'bg-blue-500/20 text-blue-400',
  behavioral: 'bg-purple-500/20 text-purple-400',
  technical: 'bg-orange-500/20 text-orange-400',
  coding: 'bg-green-500/20 text-green-400',
  system_design: 'bg-pink-500/20 text-pink-400',
  custom: 'bg-slate-500/20 text-slate-400',
}

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardStats> => {
      const res = await api.get<{ success: boolean; data: DashboardStats }>('/users/dashboard')
      return res.data.data
    },
  })

  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  // Fallback leaderboard preview data
  const leaderboardPreview: LeaderboardEntry[] = data
    ? []
    : [
        { rank: 1, user: { _id: '1', name: 'Aarav Shah' }, totalInterviews: 42, avgScore: 94, streak: 21, xp: 8400, badges: 12 },
        { rank: 2, user: { _id: '2', name: 'Priya Patel' }, totalInterviews: 38, avgScore: 91, streak: 18, xp: 7600, badges: 10 },
        { rank: 3, user: { _id: '3', name: 'Rohan Mehta' }, totalInterviews: 35, avgScore: 89, streak: 14, xp: 7000, badges: 9 },
        { rank: 4, user: { _id: '4', name: 'Sneha Gupta' }, totalInterviews: 30, avgScore: 87, streak: 11, xp: 6200, badges: 7 },
        { rank: 5, user: { _id: '5', name: 'Karan Verma' }, totalInterviews: 28, avgScore: 85, streak: 9, xp: 5800, badges: 6 },
      ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0] ?? 'User'} 👋
          </h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-2xl px-5 py-3">
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-white font-bold text-lg">{data?.streak ?? 0}</span>
          <span className="text-slate-400 text-sm">day streak</span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl bg-slate-800/60" />
          ))
        ) : (
          <>
            <StatCard
              icon={LayoutDashboard}
              label="Total Interviews"
              value={data?.totalInterviews ?? 0}
              trend={data && data.totalInterviews > 0 ? `+${data.totalInterviews} total` : undefined}
              color="bg-indigo-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Average Score"
              value={`${data?.avgScore ?? 0}%`}
              trend={data?.avgScore && data.avgScore >= 70 ? 'Above average' : undefined}
              color="bg-purple-600"
            />
            <StatCard
              icon={FileText}
              label="Resume ATS Score"
              value={data?.resumeScore ? `${data.resumeScore}%` : 'N/A'}
              color="bg-pink-600"
            />
            <StatCard
              icon={Trophy}
              label="Leaderboard Rank"
              value={data?.leaderboardRank ? `#${data.leaderboardRank}` : 'N/A'}
              color="bg-amber-600"
            />
          </>
        )}
      </motion.div>

      {/* Middle Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* LEFT: Score Ring + Skill Bars */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Overall Performance</h2>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-32 rounded-full mx-auto bg-slate-800/60" />
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 rounded bg-slate-800/60" />)}
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center">
                <div className="relative inline-flex items-center justify-center">
                  <RingProgress value={data?.avgScore ?? 0} size={140} strokeWidth={12} />
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold text-white">{data?.avgScore ?? 0}</span>
                    <span className="text-slate-400 text-xs">Overall</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <SkillBar label="Technical" value={data?.skillScores?.technical ?? 0} />
                <SkillBar label="Communication" value={data?.skillScores?.communication ?? 0} />
                <SkillBar label="Confidence" value={data?.skillScores?.confidence ?? 0} />
                <SkillBar label="Grammar" value={data?.skillScores?.grammar ?? 0} />
                <SkillBar label="Vocabulary" value={data?.skillScores?.vocabulary ?? 0} />
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Weekly Progress Chart */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Weekly Progress</h2>
          {isLoading ? (
            <Skeleton className="h-64 rounded bg-slate-800/60" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={
                  data?.weeklyProgress?.map((w) => ({
                    date: format(new Date(w.date), 'EEE'),
                    interviews: w.interviews,
                    score: w.avgScore,
                  })) ?? []
                }
                margin={{ top: 4, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#f8fafc' }}
                  itemStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="interviews"
                  name="Interviews"
                  stroke="#6366f1"
                  fill="url(#colorInterviews)"
                  strokeWidth={2}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="score"
                  name="Avg Score"
                  stroke="#ec4899"
                  fill="url(#colorScore)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Mic, label: 'Start Interview', desc: 'Practice with AI', route: '/interview', color: 'from-indigo-600 to-purple-600' },
            { icon: FileText, label: 'Upload Resume', desc: 'Get ATS score', route: '/resume', color: 'from-purple-600 to-pink-600' },
            { icon: Code2, label: 'Practice Coding', desc: 'DSA challenges', route: '/coding', color: 'from-pink-600 to-rose-600' },
            { icon: Bot, label: 'AI Coach', desc: 'Personalized tips', route: '/coach', color: 'from-rose-600 to-orange-600' },
          ].map((action) => (
            <button
              key={action.route}
              onClick={() => navigate(action.route)}
              className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 text-left hover:border-white/20 hover:bg-slate-800/60 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{action.label}</p>
              <p className="text-slate-400 text-sm mt-0.5">{action.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Bottom Grid: Recent Interviews + Daily Challenge + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-slate-900/60 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Interviews</h2>
            <button
              onClick={() => navigate('/interview')}
              className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl bg-slate-800/60" />)}
            </div>
          ) : !data?.recentInterviews?.length ? (
            <div className="text-center py-10 text-slate-500">
              <Mic className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No interviews yet. Start your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentInterviews.slice(0, 5).map((interview: Interview) => (
                <div
                  key={interview._id}
                  className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[interview.type] ?? 'bg-slate-700 text-slate-300'}`}>
                      {interview.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <div>
                      <p className="text-white text-sm font-medium">{interview.role}</p>
                      <p className="text-slate-500 text-xs">{format(new Date(interview.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {interview.totalScore !== undefined && (
                      <span className="text-sm font-bold text-white">{interview.totalScore}%</span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        interview.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : interview.status === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-slate-600/30 text-slate-400'
                      }`}
                    >
                      {interview.status === 'in_progress' ? 'Live' : interview.status}
                    </span>
                    {interview.status === 'completed' && (
                      <button
                        onClick={() => navigate(`/interview/${interview._id}/report`)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        View Report
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right column: Daily Challenge + Achievements strip */}
        <div className="space-y-6">
          {/* Daily Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="bg-slate-900/60 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎯</span>
              <h2 className="text-base font-semibold text-white">Daily Challenge</h2>
            </div>
            <p className="text-slate-300 text-sm mb-4">Answer 3 behavioral questions using the STAR method today.</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Progress</span>
                <span>0 / 3</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
              </div>
            </div>
            <button
              onClick={() => navigate('/interview')}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Start Challenge
            </button>
          </motion.div>

          {/* Achievements strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-slate-900/60 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white">Achievements</h2>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            {isLoading ? (
              <Skeleton className="h-20 rounded bg-slate-800/60" />
            ) : !data?.achievements?.length ? (
              <p className="text-slate-500 text-sm text-center py-4">Complete interviews to earn badges!</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {data.achievements.map((ach: Achievement) => (
                  <div key={ach._id} className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-2xl">
                      {ach.icon}
                    </div>
                    <span className="text-xs text-slate-400 text-center max-w-[56px] leading-tight">{ach.name}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Leaderboard Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900/60 border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Leaderboard Preview
          </h2>
          <button
            onClick={() => navigate('/leaderboard')}
            className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 transition-colors"
          >
            Full board <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl bg-slate-800/60" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-white/5">
                  <th className="text-left pb-3 pr-4 font-medium">Rank</th>
                  <th className="text-left pb-3 pr-4 font-medium">User</th>
                  <th className="text-right pb-3 pr-4 font-medium">Score</th>
                  <th className="text-right pb-3 font-medium">XP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardPreview.slice(0, 5).map((entry) => (
                  <tr key={entry.user._id} className="border-b border-white/5 last:border-0 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pr-4">
                      <span
                        className={`font-bold ${
                          entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-slate-300' : entry.rank === 3 ? 'text-orange-400' : 'text-slate-500'
                        }`}
                      >
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                          {entry.user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white">{entry.user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right text-indigo-300 font-semibold">{entry.avgScore}%</td>
                    <td className="py-3 text-right text-amber-400 font-medium">{entry.xp.toLocaleString()} XP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
