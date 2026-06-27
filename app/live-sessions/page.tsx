"use client"

import { useEffect, useState, ChangeEvent } from "react"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import {
  Search, Users, Clock, Plus, Loader2, Mic, MicOff, Video, VideoOff,
  Crown, Award, Eye, Calendar, Settings2, Trash2,
} from "lucide-react"

type Session = {
  id?: string
  title: string
  description: string
  date: string
  time: string
  maxParticipants: number
  evaluators: number
  tags: string[]
  status: "live" | "upcoming" | "ended"
  participants: string[]
  createdBy: string
  createdAt?: Date
}

const INPUT = "w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-sm transition-colors"
const LABEL = "text-xs font-medium text-slate-400 uppercase tracking-wide"

export default function LiveSessionsPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [userRole, setUserRole] = useState("participant")
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showPermission, setShowPermission] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [micPerm, setMicPerm] = useState<boolean | null>(null)
  const [videoPerm, setVideoPerm] = useState<boolean | null>(null)

  const [newSession, setNewSession] = useState<Omit<Session, "id" | "createdAt">>({
    title: "", description: "", date: "", time: "",
    maxParticipants: 5, evaluators: 1, tags: [],
    status: "upcoming", participants: [], createdBy: user?.id || "",
  })

  useEffect(() => {
    setUserRole(localStorage.getItem("speakspace_user_role") || "participant")
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const snap = await getDocs(query(collection(db, "sessions")))
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Session[])
    } catch {
      toast({ title: "Error", description: "Failed to load sessions.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSessions() }, [])

  const createSession = async () => {
    if (!newSession.title.trim() || !newSession.date || !newSession.time) {
      toast({ title: "Missing fields", description: "Fill in title, date and time.", variant: "destructive" })
      return
    }
    try {
      setCreating(true)
      await addDoc(collection(db, "sessions"), {
        ...newSession,
        maxParticipants: Number(newSession.maxParticipants),
        evaluators: Number(newSession.evaluators),
        createdAt: new Date(), status: "upcoming", participants: [], createdBy: user?.id,
      })
      setShowCreate(false)
      setNewSession({ title: "", description: "", date: "", time: "", maxParticipants: 5, evaluators: 1, tags: [], status: "upcoming", participants: [], createdBy: user?.id || "" })
      fetchSessions()
      toast({ title: "Session created!", description: "Your session is now live." })
    } catch {
      toast({ title: "Error", description: "Failed to create session.", variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  const updateSession = async () => {
    if (!editingSession?.id) return
    try {
      await updateDoc(doc(db, "sessions", editingSession.id), {
        ...editingSession,
        maxParticipants: Number(editingSession.maxParticipants),
        evaluators: Number(editingSession.evaluators),
      })
      setShowEdit(false)
      fetchSessions()
      toast({ title: "Session updated" })
    } catch {
      toast({ title: "Error", description: "Failed to update session.", variant: "destructive" })
    }
  }

  const deleteSession = async (id: string) => {
    if (!confirm("Delete this session?")) return
    try {
      await deleteDoc(doc(db, "sessions", id))
      setShowEdit(false)
      fetchSessions()
      toast({ title: "Session deleted" })
    } catch {
      toast({ title: "Error", description: "Failed to delete session.", variant: "destructive" })
    }
  }

  const handleJoin = async (session: Session) => {
    if (!user) { toast({ title: "Login required", variant: "destructive" }); return }
    setSelectedSession(session)
    setMicPerm(null); setVideoPerm(null)
    setShowPermission(true)
    try {
      const [audio, video] = await Promise.all([
        navigator.mediaDevices.getUserMedia({ audio: true }).then(() => true).catch(() => false),
        navigator.mediaDevices.getUserMedia({ video: true }).then(() => true).catch(() => false),
      ])
      setMicPerm(audio); setVideoPerm(video)
      if (session.id && !session.participants.includes(user.id)) {
        await updateDoc(doc(db, "sessions", session.id), { participants: [...session.participants, user.id] })
      }
    } catch { /* permission denied */ }
  }

  const handleContinue = () => {
    if (!selectedSession) return
    setShowPermission(false)
    window.location.href = `/session?id=${selectedSession.id}&role=${userRole}`
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    const map: Record<string, Partial<Omit<Session, "id" | "createdAt">>> = {
      "s-title":    { title: value },
      "s-desc":     { description: value },
      "s-date":     { date: value },
      "s-time":     { time: value },
      "s-max":      { maxParticipants: Number(value) },
      "s-eval":     { evaluators: Number(value) },
      "s-tags":     { tags: value.split(",").map(t => t.trim()) },
    }
    if (map[id]) setNewSession(p => ({ ...p, ...map[id] }))
  }

  const filtered = sessions.filter(s => {
    const q = !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const st = statusFilter === "all" || s.status === statusFilter
    return q && st
  })

  const tabSessions = (() => {
    if (activeTab === "mine" && userRole === "moderator") return filtered.filter(s => s.createdBy === user?.id)
    if (activeTab === "joined" && userRole === "participant") return filtered.filter(s => s.participants.includes(user?.id || ""))
    if (activeTab === "toevaluate" && userRole === "evaluator") return filtered.filter(s => s.status === "live" || s.status === "upcoming")
    if (activeTab === "recommended") return filtered.filter(s => !s.participants.includes(user?.id || ""))
    return filtered
  })()

  const tabs = {
    moderator:   [{ id: "all", label: "All Sessions" }, { id: "mine", label: "My Sessions" }],
    participant: [{ id: "all", label: "All Sessions" }, { id: "joined", label: "Joined" }, { id: "recommended", label: "Recommended" }],
    evaluator:   [{ id: "all", label: "All Sessions" }, { id: "toevaluate", label: "To Evaluate" }],
  }[userRole as "moderator" | "participant" | "evaluator"] ?? [{ id: "all", label: "All Sessions" }]

  const accentBtn = {
    moderator:   "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-purple-500/20",
    participant: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/20",
    evaluator:   "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/20",
  }[userRole as "moderator" | "participant" | "evaluator"] ?? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20"

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNav />
      <main className="max-w-6xl mx-auto pt-20 pb-16 px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 mb-6 border-b border-white/[0.05] gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Sessions</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {userRole === "moderator"   ? "Create and manage your practice sessions"  :
               userRole === "evaluator"  ? "Browse sessions to observe and evaluate"   :
               "Find sessions to practice and grow"}
            </p>
          </div>
          {userRole === "moderator" && (
            <Button onClick={() => setShowCreate(true)}
              className={`${accentBtn} text-white border-0 shadow-lg font-semibold`}>
              <Plus className="mr-2 h-4 w-4" /> New Session
            </Button>
          )}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text" placeholder="Search sessions…" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/[0.07] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/40 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-slate-900/60 border-white/[0.07] text-slate-300 focus:ring-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/[0.08]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/[0.03] rounded-xl p-1 w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5 animate-pulse">
                <div className="flex justify-between mb-3"><div className="h-4 bg-white/[0.06] rounded w-2/3" /><div className="h-5 bg-white/[0.06] rounded-full w-16" /></div>
                <div className="h-3 bg-white/[0.04] rounded w-full mb-2" /><div className="h-3 bg-white/[0.04] rounded w-4/5 mb-4" />
                <div className="flex justify-between pt-3 border-t border-white/[0.05]"><div className="h-3 bg-white/[0.04] rounded w-12" /><div className="h-7 bg-white/[0.06] rounded-lg w-20" /></div>
              </div>
            ))}
          </div>
        ) : tabSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
              <Calendar className="h-7 w-7 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No sessions found</p>
            <p className="text-slate-600 text-sm mt-1">
              {userRole === "moderator" ? "Create a session to get started" : "Check back later"}
            </p>
            {userRole === "moderator" && (
              <Button onClick={() => setShowCreate(true)} className={`mt-4 ${accentBtn} text-white border-0`}>
                <Plus className="mr-2 h-4 w-4" /> Create Session
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabSessions.map(session => (
              <SessionCard
                key={session.id} session={session}
                userId={user?.id || ""} role={userRole}
                onJoin={() => handleJoin(session)}
                onEdit={() => { setEditingSession(session); setShowEdit(true) }}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Create Dialog ── */}
      <DarkDialog open={showCreate} onOpenChange={setShowCreate} title="Create Session" desc="Set up a practice session for others to join">
        <div className="space-y-4">
          <Field label="Title *"><input id="s-title" placeholder="e.g., Technical Interview Practice" value={newSession.title} onChange={handleChange} className={INPUT} /></Field>
          <Field label="Description"><textarea id="s-desc" placeholder="What will this session cover?" rows={3} value={newSession.description} onChange={handleChange} className={INPUT} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *"><input id="s-date" type="date" value={newSession.date} onChange={handleChange} className={INPUT} /></Field>
            <Field label="Time *"><input id="s-time" type="time" value={newSession.time} onChange={handleChange} className={INPUT} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Max Participants"><input id="s-max" type="number" min="2" max="20" value={newSession.maxParticipants} onChange={handleChange} className={INPUT} /></Field>
            <Field label="Evaluator Slots"><input id="s-eval" type="number" min="0" max="5" value={newSession.evaluators} onChange={handleChange} className={INPUT} /></Field>
          </div>
          <Field label="Tags (comma-separated)"><input id="s-tags" placeholder="e.g., Technical, Beginner" onChange={handleChange} className={INPUT} /></Field>
          <Button onClick={createSession} disabled={creating} className={`w-full h-11 ${accentBtn} text-white border-0 shadow-lg font-semibold mt-1`}>
            {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : <><Plus className="mr-2 h-4 w-4" /> Create Session</>}
          </Button>
        </div>
      </DarkDialog>

      {/* ── Edit Dialog ── */}
      <DarkDialog open={showEdit} onOpenChange={setShowEdit} title="Edit Session" desc="Update session details">
        {editingSession && (
          <div className="space-y-4">
            <Field label="Title"><input type="text" value={editingSession.title} onChange={e => setEditingSession({ ...editingSession, title: e.target.value })} className={INPUT} /></Field>
            <Field label="Description"><textarea rows={3} value={editingSession.description} onChange={e => setEditingSession({ ...editingSession, description: e.target.value })} className={INPUT} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date"><input type="date" value={editingSession.date} onChange={e => setEditingSession({ ...editingSession, date: e.target.value })} className={INPUT} /></Field>
              <Field label="Time"><input type="time" value={editingSession.time} onChange={e => setEditingSession({ ...editingSession, time: e.target.value })} className={INPUT} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Max Participants"><input type="number" value={editingSession.maxParticipants} onChange={e => setEditingSession({ ...editingSession, maxParticipants: Number(e.target.value) })} className={INPUT} /></Field>
              <Field label="Status">
                <select value={editingSession.status} onChange={e => setEditingSession({ ...editingSession, status: e.target.value as Session["status"] })} className={INPUT}>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="ended">Ended</option>
                </select>
              </Field>
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="ghost" onClick={() => editingSession.id && deleteSession(editingSession.id)}
                className="border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
              <Button onClick={updateSession} className={`flex-1 ${accentBtn} text-white border-0 shadow-lg font-semibold`}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </DarkDialog>

      {/* ── Permission Dialog ── */}
      <DarkDialog open={showPermission} onOpenChange={setShowPermission} title={`Join ${selectedSession?.title ?? ""}`} desc="Allow microphone access to participate">
        <div className="space-y-4">
          <PermRow icon={micPerm === false ? <MicOff className="h-5 w-5 text-red-400" /> : <Mic className="h-5 w-5 text-green-400" />}
            label="Microphone"
            status={micPerm === true ? "Access granted" : micPerm === false ? "Access denied" : "Checking…"}
            ok={micPerm === true} />
          <PermRow icon={videoPerm === false ? <VideoOff className="h-5 w-5 text-slate-500" /> : <Video className="h-5 w-5 text-green-400" />}
            label="Camera (optional)"
            status={videoPerm === true ? "Access granted" : videoPerm === false ? "Not required" : "Checking…"}
            ok={videoPerm === true || videoPerm === false} />
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-xs text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-300 mb-2">Session Rules</p>
            <p>· Mute when not speaking</p>
            <p>· Be respectful and constructive</p>
            <p>· Stay on topic</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowPermission(false)} className="border border-white/[0.08] text-slate-400 hover:text-white flex-1">Cancel</Button>
            <Button onClick={handleContinue} disabled={micPerm !== true}
              className={`flex-1 ${accentBtn} text-white border-0 shadow-lg font-semibold`}>
              {userRole === "evaluator" ? "Observe Session" : "Join Session"}
            </Button>
          </div>
        </div>
      </DarkDialog>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SessionCard({ session, userId, role, onJoin, onEdit }: {
  session: Session; userId: string; role: string
  onJoin: () => void; onEdit: () => void
}) {
  const { title, description, date, time, participants, maxParticipants, tags = [], status, createdBy } = session
  const isFull = participants.length >= maxParticipants
  const isOwner = createdBy === userId

  const statusStyles = {
    live:     "text-red-400 bg-red-500/10 border-red-500/20",
    upcoming: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    ended:    "text-slate-500 bg-white/[0.03] border-white/[0.06]",
  }

  const roleIcon = {
    moderator:   <Crown className="h-3 w-3" />,
    evaluator:   <Award className="h-3 w-3" />,
    participant: null,
  }[role as "moderator" | "evaluator" | "participant"]

  const btnLabel = {
    moderator:   isOwner ? "Manage" : "Join",
    participant: status === "live" ? "Join Now" : status === "upcoming" ? "Register" : "Ended",
    evaluator:   status === "ended" ? "View" : "Observe",
  }[role as "moderator" | "participant" | "evaluator"] ?? "Join"

  const btnStyle = status === "ended"
    ? "bg-white/[0.04] text-slate-500 border border-white/[0.06] cursor-not-allowed"
    : isFull && role === "participant"
    ? "bg-white/[0.04] text-slate-500 border border-white/[0.06] cursor-not-allowed"
    : {
        moderator:   "bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30",
        participant: "bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30",
        evaluator:   "bg-amber-500/15 text-amber-300 border border-amber-500/25 hover:bg-amber-500/25",
      }[role as "moderator" | "participant" | "evaluator"] ?? "bg-blue-600/20 text-blue-300 border border-blue-500/30"

  const handleClick = () => {
    if (status === "ended") return
    if (isFull && role === "participant") return
    if (role === "moderator" && isOwner) { onEdit(); return }
    onJoin()
  }

  return (
    <div className="bg-slate-900/60 border border-white/[0.07] rounded-2xl p-5 flex flex-col hover:border-white/[0.12] transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-white text-sm leading-tight flex-1">{title}</h3>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusStyles[status]}`}>
          {status === "live" ? "● LIVE" : status === "upcoming" ? "Upcoming" : "Ended"}
        </span>
      </div>

      {description && <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{description}</p>}

      {(date || time) && (
        <div className="flex items-center text-xs text-slate-500 mb-3 gap-1.5">
          <Clock className="h-3 w-3 shrink-0" />
          {date}{time && ` · ${time}`}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] bg-white/[0.05] text-slate-400 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 mt-auto border-t border-white/[0.05]">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Users className="h-3.5 w-3.5" />
          {participants.length}/{maxParticipants}
          {isFull && <span className="text-amber-500 ml-1">· Full</span>}
          {isOwner && role === "moderator" && <span className="text-purple-400 ml-1">· Owner</span>}
        </div>
        <button onClick={handleClick}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${btnStyle}`}>
          {roleIcon}
          {btnLabel}
          {role === "moderator" && isOwner && <Settings2 className="h-3 w-3 ml-0.5" />}
        </button>
      </div>
    </div>
  )
}

function DarkDialog({ open, onOpenChange, title, desc, children }: {
  open: boolean; onOpenChange: (v: boolean) => void
  title: string; desc?: string; children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border border-white/[0.08] text-white max-w-lg shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          {desc && <DialogDescription className="text-slate-400">{desc}</DialogDescription>}
        </DialogHeader>
        <div className="mt-2">{children}</div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className={LABEL}>{label}</p>
      {children}
    </div>
  )
}

function PermRow({ icon, label, status, ok }: { icon: React.ReactNode; label: string; status: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
      {icon}
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className={`text-xs ${ok ? "text-green-400" : "text-slate-500"}`}>{status}</p>
      </div>
    </div>
  )
}

import type React from "react"
