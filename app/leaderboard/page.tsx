"use client"

import { useEffect, useState } from "react"
import { MainNav } from "@/components/main-nav"
import { Trophy, TrendingUp, Crown, Medal, Star } from "lucide-react"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"

type LBUser = {
  id: string
  name: string
  sessions: number
  score: number
  badges: string[]
  improvement: string
}

export default function Leaderboard() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<LBUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("score", "desc"), limit(20))
        const snap = await getDocs(q)
        setUsers(snap.docs.map(d => {
          const u = d.data()
          return { id: d.id, name: u.name || "Anonymous", sessions: u.sessions || 0, score: u.score || 0, badges: u.badges || [], improvement: u.improvement || "+0%" }
        }))
      } catch { setUsers([]) } finally { setLoading(false) }
    }
    fetch()
  }, [])

  const top3 = users.slice(0, 3)
  const rest = users.slice(3)

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNav />
      <main className="max-w-4xl mx-auto pt-20 pb-16 px-4">
        <div className="py-6 mb-8 border-b border-white/[0.05]">
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Top performers this month</p>
        </div>

        {loading ? <LBSkeleton /> : users.length === 0 ? <Empty /> : (
          <>
            {/* Podium */}
            <div className="flex items-end justify-center gap-4 mb-10">
              {/* 2nd */}
              <PodiumCard user={top3[1]} rank={2} isMe={top3[1]?.id === me?.id} />
              {/* 1st */}
              <PodiumCard user={top3[0]} rank={1} isMe={top3[0]?.id === me?.id} />
              {/* 3rd */}
              <PodiumCard user={top3[2]} rank={3} isMe={top3[2]?.id === me?.id} />
            </div>

            {/* Table */}
            {rest.length > 0 && (
              <div className="bg-slate-900/60 border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.05]">
                  <p className="font-semibold text-white text-sm">Full Rankings</p>
                  <p className="text-slate-500 text-xs mt-0.5">Positions 4 and beyond</p>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {["#", "User", "Sessions", "Score", "Growth"].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((u, i) => {
                      const isMe = u.id === me?.id
                      return (
                        <tr key={u.id} className={`border-b border-white/[0.04] transition-colors ${isMe ? "bg-blue-500/5" : "hover:bg-white/[0.02]"}`}>
                          <td className="py-3.5 px-4">
                            <span className="text-sm font-bold text-slate-500">{i + 4}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {u.name}
                                  {isMe && <span className="ml-2 text-[10px] text-blue-400 font-normal">(you)</span>}
                                </p>
                                {u.badges.length > 0 && (
                                  <div className="flex gap-1 mt-0.5">
                                    {u.badges.slice(0, 2).map((b, bi) => (
                                      <span key={bi} className="text-[9px] bg-white/[0.05] text-slate-500 px-1.5 py-0.5 rounded-full">{b}</span>
                                    ))}
                                    {u.badges.length > 2 && <span className="text-[9px] text-slate-600">+{u.badges.length - 2}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-sm text-slate-400">{u.sessions}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-sm font-bold text-white">{u.score}%</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />{u.improvement}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* My rank callout if not in top 20 */}
            {me && !users.find(u => u.id === me.id) && (
              <div className="mt-4 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {me.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{me.name} <span className="text-blue-400 font-normal text-xs">(you)</span></p>
                    <p className="text-xs text-slate-500">Complete sessions to appear on the leaderboard</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">Not ranked</span>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function PodiumCard({ user, rank, isMe }: { user?: LBUser; rank: number; isMe: boolean }) {
  if (!user) return <div className="flex-1 max-w-[160px]" />

  const config = [
    { medal: "🥇", height: "h-32", glow: "shadow-amber-500/20", border: "border-amber-500/40 bg-amber-500/5", score: "text-amber-400", badge: "bg-amber-500/20 text-amber-400" },
    { medal: "🥈", height: "h-24", glow: "shadow-slate-400/10", border: "border-white/[0.08] bg-white/[0.02]", score: "text-slate-300", badge: "bg-white/5 text-slate-400" },
    { medal: "🥉", height: "h-20", glow: "shadow-orange-500/10", border: "border-orange-500/20 bg-orange-500/5", score: "text-orange-400", badge: "bg-orange-500/15 text-orange-400" },
  ][rank - 1]

  const order = rank === 1 ? "order-2" : rank === 2 ? "order-1" : "order-3"

  return (
    <div className={`flex-1 max-w-[160px] flex flex-col items-center ${order}`}>
      {rank === 1 && <Crown className="h-5 w-5 text-amber-400 mb-2 animate-pulse" />}
      <div className={`w-full border rounded-2xl p-4 text-center shadow-lg ${config.border} ${config.glow} ${isMe ? "ring-2 ring-blue-500/50" : ""}`}>
        <div className="text-2xl mb-2">{config.medal}</div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base mx-auto mb-2">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <p className="text-xs font-bold text-white truncate">{user.name}</p>
        {isMe && <p className="text-[9px] text-blue-400 mt-0.5">you</p>}
        <p className={`text-xl font-bold mt-2 ${config.score}`}>{user.score}%</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{user.sessions} sessions</p>
      </div>
      {/* Platform height visual */}
      <div className={`w-full ${config.height} bg-white/[0.03] border border-white/[0.05] rounded-b-xl -mt-1`} />
    </div>
  )
}

function LBSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-center gap-4 mb-8">
        {[160, 180, 140].map((h, i) => (
          <div key={i} className="flex-1 max-w-[160px]">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-white/[0.06] mx-auto mb-2" />
              <div className="h-3 bg-white/[0.06] rounded mx-auto w-16 mb-1" />
              <div className="h-5 bg-white/[0.06] rounded mx-auto w-12" />
            </div>
            <div style={{ height: h - 60 }} className="bg-white/[0.03] border border-white/[0.04] rounded-b-xl" />
          </div>
        ))}
      </div>
      <div className="bg-slate-900/40 border border-white/[0.06] rounded-2xl overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-white/[0.04] animate-pulse">
            <div className="h-3 w-6 bg-white/[0.05] rounded" />
            <div className="w-8 h-8 rounded-full bg-white/[0.06]" />
            <div className="flex-1 h-3 bg-white/[0.05] rounded w-28" />
            <div className="h-3 w-10 bg-white/[0.05] rounded" />
            <div className="h-3 w-12 bg-white/[0.05] rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
        <Trophy className="h-7 w-7 text-slate-600" />
      </div>
      <p className="text-slate-300 font-semibold">No rankings yet</p>
      <p className="text-slate-500 text-sm mt-1 max-w-xs">Complete sessions to earn a spot on the leaderboard</p>
    </div>
  )
}
