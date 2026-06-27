"use client"

import { MainNav } from "@/components/main-nav"
import { useAuth } from "@/components/auth-provider"
import { EditProfileDialog } from "@/components/edit-profile-dialog"
import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Edit, Calendar, Award, TrendingUp, CheckCircle2, Lightbulb,
  ChevronUp, Download, Crown, Mic, Star,
} from "lucide-react"

function initials(name?: string) {
  if (!name?.trim()) return "U"
  return name.trim().split(" ").filter(Boolean).map(n => n[0].toUpperCase()).join("").slice(0, 2)
}

const GRADIENTS = ["from-blue-500 to-indigo-600", "from-indigo-500 to-purple-600", "from-purple-500 to-pink-600", "from-green-500 to-teal-600"]

const ROLE_CONFIG = {
  moderator:   { label: "Moderator",   color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", icon: <Crown className="h-3 w-3" /> },
  participant: { label: "Participant", color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/30",     icon: <Mic className="h-3 w-3" /> },
  evaluator:   { label: "Evaluator",   color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/30",   icon: <Star className="h-3 w-3" /> },
}

export default function Profile() {
  const { user } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const [memberSince, setMemberSince] = useState("—")
  const [userSkills, setUserSkills] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("progress")

  const role = (typeof window !== "undefined" ? localStorage.getItem("speakspace_user_role") : "participant") || "participant"
  const roleConfig = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.participant
  const gradient = GRADIENTS[(user?.name?.charCodeAt(0) ?? 0) % GRADIENTS.length]

  useEffect(() => {
    if (!user?.id) return
    getDoc(doc(db, "users", user.id)).then(snap => {
      const d = snap.data()
      if (d?.createdAt?.toDate) setMemberSince(d.createdAt.toDate().toLocaleDateString("en-US", { month: "long", year: "numeric" }))
      if (d?.skills?.length) setUserSkills(d.skills)
    })
  }, [user?.id])

  const skills = [
    { name: "Confidence",       value: 75, sub: [{ label: "Body Language", v: 80 }, { label: "Voice Projection", v: 68 }], color: "from-blue-500 to-blue-400",     delta: "+1.2" },
    { name: "Communication",    value: 82, sub: [{ label: "Clarity", v: 85 }, { label: "Conciseness", v: 78 }],            color: "from-indigo-500 to-indigo-400",  delta: "+0.5" },
    { name: "Logical Reasoning",value: 68, sub: [{ label: "Problem Solving", v: 72 }, { label: "Critical Thinking", v: 65 }], color: "from-purple-500 to-purple-400", delta: "+2.0" },
  ]

  const history = [
    { title: "Technical Interview Practice", date: "April 10, 2024", role: "Participant", score: 85 },
    { title: "Group Discussion: AI Ethics",  date: "April 8, 2024",  role: "Moderator",   score: 78 },
    { title: "HR Interview Preparation",     date: "April 5, 2024",  role: "Participant", score: 92 },
    { title: "System Design Interview",      date: "April 2, 2024",  role: "Participant", score: 75 },
    { title: "GD: Remote Work",              date: "March 25, 2024", role: "Evaluator",   score: 82 },
  ]

  const resumeTips = [
    { title: "Highlight System Design",       desc: "Strong performance in system design — emphasize scalable systems projects.",               icon: <TrendingUp className="h-4 w-4 text-blue-400" /> },
    { title: "Quantify Achievements",         desc: "Use numbers: 'Improved performance by 40%' beats 'Improved performance'.",               icon: <TrendingUp className="h-4 w-4 text-green-400" /> },
    { title: "Add Communication Skills",      desc: "Your comms scores are consistently high — list it as a key skill.",                      icon: <CheckCircle2 className="h-4 w-4 text-indigo-400" /> },
    { title: "Tailor for Each Role",          desc: "Customise your resume per job posting to highlight relevant experience.",                 icon: <Lightbulb className="h-4 w-4 text-amber-400" /> },
    { title: "Include Problem-Solving",       desc: "Your logical reasoning shows problem-solving is a strength — add a brief example.",       icon: <Lightbulb className="h-4 w-4 text-purple-400" /> },
  ]

  const achievements = [
    { title: "Communication Pro", desc: "80%+ in communication", color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20" },
    { title: "Quick Thinker",     desc: "Excellent logical reasoning", color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
    { title: "Consistent",        desc: "5 sessions in a row",         color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
    { title: "Team Player",       desc: "Valuable contributions",      color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  ]

  // Role-specific tabs
  const tabs = [
    { id: "progress", label: "Progress", roles: ["participant", "evaluator"] },
    { id: "stats",    label: "Stats",    roles: ["moderator"] },
    { id: "history",  label: "History",  roles: ["moderator", "participant", "evaluator"] },
    { id: "resume",   label: "Resume Tips", roles: ["participant"] },
  ].filter(t => t.roles.includes(role))

  // Ensure active tab is valid for role
  useEffect(() => {
    if (!tabs.find(t => t.id === activeTab)) setActiveTab(tabs[0]?.id ?? "history")
  }, [role])

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNav />
      <main className="max-w-6xl mx-auto pt-20 pb-16 px-4">

        {/* Header */}
        <div className="flex justify-between items-center py-6 mb-6 border-b border-white/[0.05]">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Profile</h1>
            <p className="text-slate-500 text-sm mt-0.5">View and manage your account</p>
          </div>
          <button onClick={() => setEditOpen(true)}
            className="flex items-center gap-2 text-sm text-slate-400 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:text-white rounded-xl px-4 py-2 transition-all">
            <Edit className="h-4 w-4" /> Edit Profile
          </button>
        </div>

        <EditProfileDialog isOpen={editOpen} onClose={() => setEditOpen(false)} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="space-y-4">
            {/* Profile card */}
            <div className="bg-slate-900/60 border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className={`h-16 bg-gradient-to-r ${gradient} opacity-60`} />
              <div className="px-5 pb-5 -mt-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 border-4 border-slate-900 shadow-lg`}>
                  <span className="text-xl font-bold text-white">{initials(user?.name)}</span>
                </div>
                <h2 className="text-base font-bold text-white">{user?.name || "User"}</h2>
                <p className="text-slate-500 text-xs mt-0.5">{user?.email}</p>
                <span className={`inline-flex items-center gap-1 mt-2 text-xs font-medium px-2.5 py-1 rounded-full border ${roleConfig.bg} ${roleConfig.color}`}>
                  {roleConfig.icon} {roleConfig.label}
                </span>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(userSkills.length > 0 ? userSkills : ["Communication", "Interviews", "Public Speaking"]).map(s => (
                        <span key={s} className="text-xs bg-white/[0.05] text-slate-400 px-2.5 py-1 rounded-lg">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Member since {memberSince}
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-slate-900/60 border border-white/[0.07] rounded-2xl p-5">
              <p className="font-semibold text-white text-sm mb-1">Achievements</p>
              <p className="text-slate-500 text-xs mb-4">Badges & milestones</p>
              <div className="grid grid-cols-2 gap-2.5">
                {achievements.map(a => (
                  <div key={a.title} className={`rounded-xl border p-3 flex flex-col items-center text-center ${a.bg}`}>
                    <Award className={`h-5 w-5 mb-1.5 ${a.color}`} />
                    <p className={`text-xs font-semibold leading-tight ${a.color}`}>{a.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2">
            {/* Tab bar */}
            <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 w-fit mb-5">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Progress tab */}
            {activeTab === "progress" && (
              <div className="space-y-4">
                {skills.map(s => (
                  <div key={s.name} className="bg-slate-900/60 border border-white/[0.07] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-semibold text-white">{s.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">{s.value}%</span>
                        <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <ChevronUp className="h-3 w-3" />{s.delta}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/[0.05] rounded-full mb-5 overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${s.color} rounded-full`} style={{ width: `${s.value}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {s.sub.map(sub => (
                        <div key={sub.label}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-400">{sub.label}</span>
                            <span className="text-slate-300 font-semibold">{sub.v}%</span>
                          </div>
                          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${s.color} rounded-full opacity-60`} style={{ width: `${sub.v}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Moderator Stats tab */}
            {activeTab === "stats" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Sessions Hosted",    value: "0", sub: "All time" },
                    { label: "Avg. Rating",         value: "—", sub: "From participants" },
                    { label: "Topics Created",      value: "0", sub: "In your sessions" },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-900/60 border border-white/[0.07] rounded-2xl p-5 text-center">
                      <p className="text-3xl font-bold text-purple-400">{s.value}</p>
                      <p className="text-xs text-white font-medium mt-1">{s.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{s.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900/60 border border-white/[0.07] rounded-2xl p-5">
                  <p className="font-semibold text-white text-sm mb-1">Moderation Tips</p>
                  <p className="text-slate-500 text-xs mb-4">Best practices for running sessions</p>
                  {[
                    { tip: "Set a clear agenda before the session starts", icon: <CheckCircle2 className="h-4 w-4 text-purple-400" /> },
                    { tip: "Ensure all participants introduce themselves",  icon: <CheckCircle2 className="h-4 w-4 text-purple-400" /> },
                    { tip: "Use time-boxing to keep discussions on track",  icon: <CheckCircle2 className="h-4 w-4 text-purple-400" /> },
                    { tip: "End with a structured summary and takeaways",   icon: <CheckCircle2 className="h-4 w-4 text-purple-400" /> },
                  ].map(({ tip, icon }) => (
                    <div key={tip} className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                      <div className="mt-0.5 shrink-0">{icon}</div>
                      <p className="text-sm text-slate-300">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History tab */}
            {activeTab === "history" && (
              <div className="bg-slate-900/60 border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                  <div>
                    <p className="font-semibold text-white text-sm">Session History</p>
                    <p className="text-slate-500 text-xs mt-0.5">Your past sessions</p>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs text-slate-400 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] rounded-lg px-3 py-1.5 transition-all">
                    <Download className="h-3.5 w-3.5" /> Export
                  </button>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {history.map(s => {
                    const roleColors: Record<string, string> = {
                      Moderator:   "text-purple-400 bg-purple-500/10 border-purple-500/25",
                      Evaluator:   "text-amber-400 bg-amber-500/10 border-amber-500/25",
                      Participant: "text-blue-400 bg-blue-500/10 border-blue-500/25",
                    }
                    return (
                      <div key={s.title + s.date} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate pr-4">{s.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">{s.date}</span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${roleColors[s.role] ?? ""}`}>{s.role}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-white">{s.score}%</p>
                          <p className="text-[10px] text-slate-500">Score</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Resume Tips tab (participant only) */}
            {activeTab === "resume" && (
              <div className="space-y-3">
                {resumeTips.map(tip => (
                  <div key={tip.title} className="bg-slate-900/60 border border-white/[0.07] rounded-2xl p-4 flex items-start gap-4 hover:border-white/[0.12] transition-colors">
                    <div className="p-2 rounded-xl bg-white/[0.04] shrink-0">{tip.icon}</div>
                    <div>
                      <p className="font-semibold text-sm text-white mb-1">{tip.title}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
