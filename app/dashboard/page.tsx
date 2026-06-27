"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { useAuth } from "@/components/auth-provider"
import { FirstTimeSetup } from "@/components/first-time-setup"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Crown, Mic, Award, Users, MessageSquare, Calendar, Clock,
  TrendingUp, BarChart2, Star, ArrowRight, Zap, BookOpen,
  Plus, Eye, CheckCircle2, AlertCircle,
} from "lucide-react"

type Session = {
  id: string
  title: string
  date: string
  time?: string
  participants: string[]
  maxParticipants: number
  status: "live" | "upcoming" | "ended"
  createdBy?: string
  avgRating?: number
}

function useRole(userId: string | undefined) {
  const stored = typeof window !== "undefined" ? localStorage.getItem("speakspace_user_role") : ""
  return stored || "participant"
}

export default function Dashboard() {
  const { user } = useAuth()
  const [isFirstTime, setIsFirstTime] = useState(false)
  const role = useRole(user?.id) as "moderator" | "participant" | "evaluator"

  useEffect(() => {
    if (!localStorage.getItem("speakspace_onboarding_complete")) setIsFirstTime(true)
  }, [])

  if (isFirstTime) {
    return <FirstTimeSetup onComplete={() => {
      localStorage.setItem("speakspace_onboarding_complete", "true")
      setIsFirstTime(false)
    }} />
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNav />
      <main className="max-w-6xl mx-auto pt-20 pb-16 px-4">
        {role === "moderator"   && <ModeratorDashboard />}
        {role === "participant" && <ParticipantDashboard />}
        {role === "evaluator"   && <EvaluatorDashboard />}
      </main>
    </div>
  )
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function PageHeader({ name, sub, cta }: { name: string; sub: string; cta: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <p className="text-slate-500 text-sm mb-0.5">{sub}</p>
        <h1 className="text-2xl font-bold text-white">{name}</h1>
      </div>
      {cta}
    </div>
  )
}

function StatCard({ label, value, sub, icon, accent }: {
  label: string; value: string; sub: string
  icon: React.ReactNode; accent: string
}) {
  return (
    <div className="bg-slate-900/60 border border-white/[0.07] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-400 text-sm">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  )
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-900/60 border border-white/[0.07] rounded-2xl ${className}`}>{children}</div>
  )
}

function CardHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3">
      <div>
        <p className="font-semibold text-white text-sm">{title}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

function SessionRow({ session, accent, action }: { session: Session; accent: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-t border-white/[0.05] hover:bg-white/[0.02] transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <MessageSquare className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{session.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
          <Clock className="h-3 w-3" /> {session.date}{session.time ? ` · ${session.time}` : ""}
        </p>
      </div>
      {session.status === "live" && (
        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">LIVE</span>
      )}
      {action}
    </div>
  )
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="py-10 flex flex-col items-center gap-2 text-slate-600">
      <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  )
}

function ActionLink({ href, icon, label, accent }: { href: string; icon: React.ReactNode; label: string; accent: string }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:opacity-90 ${accent}`}>
      <div className="shrink-0">{icon}</div>
      <span className="text-sm font-medium text-white flex-1">{label}</span>
      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
    </Link>
  )
}

// ─── Moderator Dashboard ──────────────────────────────────────────────────────

function ModeratorDashboard() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    getDocs(collection(db, "sessions")).then(snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Session[]
      setSessions(all.filter(s => s.createdBy === user.id))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user?.id])

  const hosted = sessions.length
  const live   = sessions.filter(s => s.status === "live").length
  const totalPart = sessions.reduce((acc, s) => acc + (s.participants?.length ?? 0), 0)
  const upcoming  = sessions.filter(s => s.status === "upcoming").slice(0, 5)

  return (
    <>
      <PageHeader
        sub={`Welcome back, ${user?.name?.split(" ")[0] ?? "Moderator"}`}
        name="Moderator Command Center"
        cta={
          <Link href="/live-sessions"
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-purple-500/20 transition-all">
            <Plus className="h-4 w-4" /> New Session
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Sessions Hosted"    value={loading ? "—" : String(hosted)}    sub="All time"                      icon={<Crown className="h-4 w-4 text-purple-400" />}  accent="bg-purple-500/10" />
        <StatCard label="Live Right Now"     value={loading ? "—" : String(live)}      sub={live > 0 ? "In progress" : "None active"}  icon={<Zap className="h-4 w-4 text-red-400" />}      accent="bg-red-500/10" />
        <StatCard label="Total Participants" value={loading ? "—" : String(totalPart)} sub="Across all sessions"           icon={<Users className="h-4 w-4 text-indigo-400" />}  accent="bg-indigo-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* My Sessions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHead title="Your Sessions" sub="Sessions you've created"
              action={<Link href="/live-sessions" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">View all</Link>} />
            {loading ? (
              <div className="px-5 pb-5 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />)}
              </div>
            ) : upcoming.length === 0 ? (
              <EmptyState icon={<MessageSquare className="h-5 w-5 text-slate-600" />} text="No sessions yet — create your first one" />
            ) : (
              <div className="pb-2">
                {upcoming.map(s => (
                  <SessionRow key={s.id} session={s}
                    accent="bg-purple-500/10 text-purple-400"
                    action={
                      <Link href="/live-sessions" className="text-xs text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-lg hover:bg-purple-500/10 transition-colors">
                        Manage
                      </Link>
                    }
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="p-5">
            <p className="font-semibold text-white text-sm mb-4">Quick Actions</p>
            <div className="space-y-2.5">
              <ActionLink href="/live-sessions" icon={<Plus className="h-4 w-4 text-purple-400" />}       label="Create Session"       accent="border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10" />
              <ActionLink href="/live-sessions" icon={<Eye className="h-4 w-4 text-blue-400" />}          label="View All Sessions"    accent="border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10" />
              <ActionLink href="/leaderboard"   icon={<BarChart2 className="h-4 w-4 text-indigo-400" />}  label="Leaderboard"          accent="border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10" />
              <ActionLink href="/profile"       icon={<Users className="h-4 w-4 text-slate-400" />}       label="Your Profile"         accent="border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]" />
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

// ─── Participant Dashboard ─────────────────────────────────────────────────────

function ParticipantDashboard() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [allUpcoming, setAllUpcoming] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    getDocs(collection(db, "sessions")).then(snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Session[]
      setSessions(all.filter(s => s.participants?.includes(user.id)))
      setAllUpcoming(all.filter(s => s.status === "upcoming").slice(0, 4))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user?.id])

  const skills = [
    { name: "Communication",   pct: 74, color: "from-blue-500 to-blue-400" },
    { name: "Confidence",      pct: 61, color: "from-cyan-500 to-cyan-400" },
    { name: "Argumentation",   pct: 55, color: "from-indigo-500 to-indigo-400" },
    { name: "Active Listening", pct: 80, color: "from-violet-500 to-violet-400" },
  ]

  return (
    <>
      <PageHeader
        sub={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
        name="Your Practice Dashboard"
        cta={
          <Link href="/live-sessions"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition-all">
            <Zap className="h-4 w-4" /> Find Session
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Sessions Joined"   value={loading ? "—" : String(sessions.length)} sub={sessions.length === 0 ? "Join your first session" : "All time"}     icon={<MessageSquare className="h-4 w-4 text-blue-400" />}  accent="bg-blue-500/10" />
        <StatCard label="Avg. Performance"  value="—"                                        sub="Complete sessions to score"                                           icon={<TrendingUp className="h-4 w-4 text-cyan-400" />}     accent="bg-cyan-500/10" />
        <StatCard label="Available Now"     value={loading ? "—" : String(allUpcoming.length)} sub="Sessions open to join"                                             icon={<Calendar className="h-4 w-4 text-indigo-400" />}     accent="bg-indigo-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Skill Progress */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-semibold text-white text-sm">Skill Progress</p>
                <p className="text-xs text-slate-500 mt-0.5">Tracked across sessions</p>
              </div>
              <Link href="/profile" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View profile</Link>
            </div>
            <div className="space-y-4">
              {skills.map(s => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-300">{s.name}</span>
                    <span className="text-sm font-bold text-white">{s.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${s.color} transition-all duration-700`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming sessions */}
          <Card>
            <CardHead title="Open Sessions" sub="Available to join now"
              action={<Link href="/live-sessions" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Browse all</Link>} />
            {loading ? (
              <div className="px-5 pb-5 space-y-3">{[1,2].map(i => <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
            ) : allUpcoming.length === 0 ? (
              <EmptyState icon={<Calendar className="h-5 w-5 text-slate-600" />} text="No open sessions right now" />
            ) : (
              <div className="pb-2">
                {allUpcoming.map(s => (
                  <SessionRow key={s.id} session={s}
                    accent="bg-blue-500/10 text-blue-400"
                    action={
                      <Link href="/live-sessions" className="text-xs text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg hover:bg-blue-500/10 transition-colors">
                        Join
                      </Link>
                    }
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="p-5">
            <p className="font-semibold text-white text-sm mb-4">Quick Actions</p>
            <div className="space-y-2.5">
              <ActionLink href="/live-sessions" icon={<Zap className="h-4 w-4 text-blue-400" />}       label="Join a Session"    accent="border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10" />
              <ActionLink href="/leaderboard"   icon={<Star className="h-4 w-4 text-amber-400" />}     label="Leaderboard"       accent="border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10" />
              <ActionLink href="/resume"        icon={<BookOpen className="h-4 w-4 text-green-400" />} label="My Resume"         accent="border-green-500/20 bg-green-500/5 hover:bg-green-500/10" />
              <ActionLink href="/profile"       icon={<TrendingUp className="h-4 w-4 text-indigo-400" />} label="Track Progress" accent="border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10" />
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

// ─── Evaluator Dashboard ──────────────────────────────────────────────────────

function EvaluatorDashboard() {
  const { user } = useAuth()
  const [toEval, setToEval] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDocs(collection(db, "sessions")).then(snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Session[]
      setToEval(all.filter(s => s.status === "live" || s.status === "upcoming").slice(0, 5))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const live = toEval.filter(s => s.status === "live").length

  return (
    <>
      <PageHeader
        sub={`Welcome back, ${user?.name?.split(" ")[0] ?? "Evaluator"}`}
        name="Evaluator Dashboard"
        cta={
          <Link href="/live-sessions"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 transition-all">
            <Eye className="h-4 w-4" /> Browse Sessions
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Sessions Evaluated"    value="0"  sub="Complete your first evaluation"  icon={<CheckCircle2 className="h-4 w-4 text-amber-400" />}  accent="bg-amber-500/10" />
        <StatCard label="Live to Evaluate"      value={loading ? "—" : String(live)} sub={live > 0 ? "Jump in now" : "Check back soon"} icon={<Zap className="h-4 w-4 text-red-400" />}    accent="bg-red-500/10" />
        <StatCard label="Participants Reviewed" value="0"  sub="People you've given feedback to" icon={<Users className="h-4 w-4 text-indigo-400" />}         accent="bg-indigo-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sessions to evaluate */}
        <div className="lg:col-span-2">
          <Card>
            <CardHead title="Sessions to Evaluate" sub="Live and upcoming sessions"
              action={<Link href="/live-sessions" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">View all</Link>} />
            {loading ? (
              <div className="px-5 pb-5 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />)}</div>
            ) : toEval.length === 0 ? (
              <EmptyState icon={<AlertCircle className="h-5 w-5 text-slate-600" />} text="No sessions available right now" />
            ) : (
              <div className="pb-2">
                {toEval.map(s => (
                  <SessionRow key={s.id} session={s}
                    accent="bg-amber-500/10 text-amber-400"
                    action={
                      <Link href="/live-sessions" className="text-xs text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg hover:bg-amber-500/10 transition-colors">
                        Evaluate
                      </Link>
                    }
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right col */}
        <div className="space-y-5">
          {/* Rubric preview */}
          <Card className="p-5">
            <p className="font-semibold text-white text-sm mb-1">Your Rubric</p>
            <p className="text-xs text-slate-500 mb-4">Default scoring criteria</p>
            {["Communication", "Leadership", "Logic", "Confidence"].map(c => (
              <div key={c} className="flex items-center gap-2 mb-2.5">
                <span className="text-xs text-slate-400 w-24 shrink-0">{c}</span>
                <div className="flex gap-1 flex-1">
                  {[1,2,3,4,5].map(n => (
                    <div key={n} className="h-5 flex-1 rounded bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
                      <span className="text-[10px] text-slate-700">{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>

          {/* Quick actions */}
          <Card className="p-5">
            <p className="font-semibold text-white text-sm mb-4">Quick Actions</p>
            <div className="space-y-2.5">
              <ActionLink href="/live-sessions" icon={<Eye className="h-4 w-4 text-amber-400" />}      label="Browse Sessions"   accent="border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10" />
              <ActionLink href="/leaderboard"   icon={<BarChart2 className="h-4 w-4 text-indigo-400" />} label="Leaderboard"     accent="border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10" />
              <ActionLink href="/profile"       icon={<Award className="h-4 w-4 text-slate-400" />}    label="Your Profile"      accent="border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]" />
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

// ─── React import for JSX ─────────────────────────────────────────────────────
import type React from "react"
