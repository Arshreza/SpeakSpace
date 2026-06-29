import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trophy, TrendingUp, TrendingDown, Flame, Star, Zap } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import api from '@/utils/api'
import useAuthStore from '@/store/authStore'
import type { LeaderboardEntry } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = 'weekly' | 'monthly' | 'alltime'

interface LeaderboardResponse {
  data: LeaderboardEntry[]
  currentUser?: {
    rank: number
    score: number
    trend: 'up' | 'down' | 'same'
    trendValue: number
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RANK_EMOJI: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

const PODIUM_ORDER = [1, 0, 2] // center=1st, left=2nd, right=3rd

const PODIUM_STYLES: Record<number, { ring: string; crown: string; size: string; height: string }> = {
  0: { ring: 'ring-2 ring-yellow-400 shadow-yellow-400/30', crown: '👑', size: 'w-20 h-20 text-3xl', height: 'h-32' },
  1: { ring: 'ring-2 ring-slate-400 shadow-slate-400/20', crown: '🥈', size: 'w-16 h-16 text-2xl', height: 'h-24' },
  2: { ring: 'ring-2 ring-amber-600 shadow-amber-600/20', crown: '🥉', size: 'w-16 h-16 text-2xl', height: 'h-20' },
}

function getInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Podium Card ─────────────────────────────────────────────────────────────

function PodiumCard({ entry, podiumIndex }: { entry: LeaderboardEntry; podiumIndex: number }) {
  const style = PODIUM_STYLES[podiumIndex]
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-2xl">{style.crown}</span>
      <div className={`rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-xl ${style.ring} ${style.size}`}>
        {entry.user.avatar ? (
          <img src={entry.user.avatar} alt={entry.user.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span>{getInitials(entry.user.name)}</span>
        )}
      </div>
      <div className="text-center">
        <p className="font-semibold text-white text-sm">{entry.user.name}</p>
        <p className="text-xs text-slate-400">{entry.xp.toLocaleString()} XP</p>
        <p className="text-xs text-indigo-400 font-medium">{entry.avgScore}% avg</p>
      </div>
      <div className={`flex items-center justify-center text-white font-bold rounded-t-lg w-20 ${style.height} bg-gradient-to-t from-indigo-900/60 to-indigo-800/40 border border-indigo-500/30`}>
        #{entry.rank}
      </div>
    </div>
  )
}

// ─── Table Row ───────────────────────────────────────────────────────────────

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isCurrentUser = entry.isCurrentUser
  return (
    <tr className={`border-b border-white/5 transition-colors ${isCurrentUser ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : 'hover:bg-white/5'}`}>
      <td className="px-4 py-3 text-sm font-semibold text-slate-300">
        {RANK_EMOJI[entry.rank] ?? entry.rank}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {entry.user.avatar
              ? <img src={entry.user.avatar} alt={entry.user.name} className="w-full h-full rounded-full object-cover" />
              : getInitials(entry.user.name)}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{entry.user.name}</p>
            {isCurrentUser && <span className="text-xs text-indigo-400">You</span>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-400 text-center">{entry.totalInterviews}</td>
      <td className="px-4 py-3 text-sm text-slate-300 text-center font-medium">{entry.avgScore}%</td>
      <td className="px-4 py-3 text-center">
        <span className="flex items-center justify-center gap-1 text-sm text-orange-400">
          <Flame className="w-3.5 h-3.5" /> {entry.streak}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-indigo-400 text-center font-semibold">{entry.xp.toLocaleString()}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1 justify-center">
          {entry.badges > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
              <Star className="w-3 h-3" /> {entry.badges}
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── Leaderboard Tab ─────────────────────────────────────────────────────────

function LeaderboardTab({ period }: { period: Period }) {
  const { user } = useAuthStore()

  const { data, isLoading, error } = useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      const { data } = await api.get(`/leaderboard?period=${period}`)
      return data
    },
    staleTime: 60 * 1000,
  })

  const entries = data?.data ?? []
  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  const currentUser = data?.currentUser

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-14 bg-slate-800/60 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400">Failed to load leaderboard data.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Podium */}
      {top3.length >= 3 && (
        <div className="flex items-end justify-center gap-6 mb-10 py-6">
          {PODIUM_ORDER.map((idx) => (
            <PodiumCard key={top3[idx].rank} entry={top3[idx]} podiumIndex={idx} />
          ))}
        </div>
      )}

      {/* Table */}
      {rest.length > 0 && (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-slate-800/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">User</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">Interviews</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">Avg Score</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">Streak</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">XP</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">Badges</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((entry) => (
                <LeaderboardRow key={entry.user._id} entry={entry} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No rankings yet. Complete interviews to appear here!</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Leaderboard() {
  const { user } = useAuthStore()

  useEffect(() => {
    document.title = 'Leaderboard | SpeakSpace'
  }, [])

  // Mock current user rank data (would come from query in real app)
  const mockRank = { position: 23, score: 847, trend: 'up' as const, trendValue: 3 }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" /> Leaderboard
          </h1>
          <p className="text-slate-400">See how you stack up against other learners</p>
        </div>

        {/* Your Rank Card */}
        {user && (
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 min-w-[200px]">
            <p className="text-xs text-slate-400 mb-2">Your Rank</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">#{mockRank.position}</p>
                <p className="text-xs text-slate-400">{mockRank.score} XP</p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${mockRank.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {mockRank.trend === 'up'
                  ? <TrendingUp className="w-4 h-4" />
                  : <TrendingDown className="w-4 h-4" />}
                {mockRank.trendValue}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="weekly">
        <TabsList className="bg-slate-800/60 border border-white/10 mb-8">
          <TabsTrigger value="weekly" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Monthly</TabsTrigger>
          <TabsTrigger value="alltime" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly"><LeaderboardTab period="weekly" /></TabsContent>
        <TabsContent value="monthly"><LeaderboardTab period="monthly" /></TabsContent>
        <TabsContent value="alltime"><LeaderboardTab period="alltime" /></TabsContent>
      </Tabs>
    </div>
  )
}
