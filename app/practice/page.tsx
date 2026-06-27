"use client"

import { useEffect, useState } from "react"
import { MainNav } from "@/components/main-nav"
import { Filter, Search, Users, Clock, Tag } from "lucide-react"
import Link from "next/link"

const CARD = "bg-slate-900/60 border border-white/[0.07] rounded-2xl"
const INPUT = "w-full px-3.5 py-2.5 rounded-xl bg-slate-800/50 border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 text-sm"

const SAMPLE_SESSIONS = [
  { title: "Technical Interview Practice", desc: "Practice for software engineering roles", time: "Starting in 15 min", slots: "3/5", tags: ["Technical", "Software"] },
  { title: "Group Discussion: AI Ethics", desc: "Discuss the ethical implications of AI", time: "Starting in 30 min", slots: "6/10", tags: ["Group Discussion", "Ethics"] },
  { title: "HR Interview Preparation", desc: "Common HR questions and best practices", time: "Starting in 1 hr", slots: "2/4", tags: ["HR", "Behavioral"] },
  { title: "Product Management Case Study", desc: "Solve a real-world PM case study", time: "Starting in 2 hr", slots: "4/6", tags: ["Product", "Case Study"] },
  { title: "Mock Interview: Data Science", desc: "Technical questions for data roles", time: "Starting in 3 hr", slots: "2/4", tags: ["Data Science"] },
  { title: "Public Speaking Practice", desc: "Improve your presentation skills", time: "Starting tomorrow", slots: "5/8", tags: ["Public Speaking"] },
]

export default function Practice() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"join" | "create">("join")
  const [search, setSearch] = useState("")

  useEffect(() => {
    setUserRole(localStorage.getItem("speakspace_user_role"))
  }, [])

  const filtered = SAMPLE_SESSIONS.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNav />
      <main className="container mx-auto pt-24 pb-16 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Practice Sessions</h1>
          <p className="text-slate-400 text-sm mt-1">Join or create a session to sharpen your skills</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl w-fit mb-8 border border-white/[0.05]">
          {(["join", "create"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
              {t === "join" ? "Join Session" : "Create Session"}
            </button>
          ))}
        </div>

        {activeTab === "join" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input type="text" placeholder="Search sessions…" value={search} onChange={e => setSearch(e.target.value)}
                  className={`${INPUT} pl-10`} />
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/[0.08] text-slate-400 hover:text-white text-sm transition-colors">
                <Filter className="h-4 w-4" /> Filter
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((s, i) => (
                <div key={i} className={`${CARD} p-5 flex flex-col gap-4`}>
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-white text-sm leading-snug">{s.title}</h3>
                      <span className="text-xs text-slate-400 bg-slate-800/60 border border-white/[0.06] px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                        <Users className="h-3 w-3" />{s.slots}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{s.desc}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />{s.time}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map((tag, ti) => (
                      <span key={ti} className="text-xs bg-white/[0.04] border border-white/[0.06] text-slate-400 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <Link href="/live-sessions"
                    className="block w-full text-center py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow transition-all">
                    Join Session
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "create" && (
          <div className={`${CARD} p-7 max-w-2xl`}>
            <h3 className="text-white font-semibold mb-1">Create a New Session</h3>
            <p className="text-slate-400 text-xs mb-6">Set up a practice session and invite others to join</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Session Title</label>
                <input type="text" placeholder="e.g., Technical Interview Practice" className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Description</label>
                <textarea placeholder="Describe what this session will cover…" rows={3}
                  className={`${INPUT} resize-none`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Date</label>
                  <input type="date" className={`${INPUT} [color-scheme:dark]`} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Time</label>
                  <input type="time" className={`${INPUT} [color-scheme:dark]`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Max Participants</label>
                <input type="number" min="2" max="10" defaultValue={5} className={INPUT} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1"><Tag className="h-3.5 w-3.5" />Tags</label>
                <input type="text" placeholder="e.g., Technical, Beginner, Software" className={INPUT} />
                <p className="text-xs text-slate-600">Separate tags with commas</p>
              </div>
              <div className="pt-2">
                <Link href="/live-sessions"
                  className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all text-sm">
                  Create Session
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
