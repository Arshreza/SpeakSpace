"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { ArrowRight, CheckCircle2, X, Crown, Mic, Award, ChevronRight } from "lucide-react"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

type Role = "moderator" | "participant" | "evaluator"

interface OData {
  role: Role | null
  // moderator
  sessionTypes: string[]
  sessionLength: string
  // participant
  preparation: string
  focusAreas: string[]
  // evaluator
  expertiseAreas: string[]
  feedbackStyle: string
}

const ROLE_META = {
  moderator:   { color: "purple", active: "border-purple-500/50 bg-purple-500/10", bar: "bg-purple-500", btn: "from-purple-600 to-violet-600 shadow-purple-500/20", dot: "bg-purple-600 shadow-purple-500/30" },
  participant: { color: "blue",   active: "border-blue-500/50 bg-blue-500/10",     bar: "bg-blue-500",   btn: "from-blue-600 to-cyan-600 shadow-blue-500/20",     dot: "bg-blue-600 shadow-blue-500/30"   },
  evaluator:   { color: "amber",  active: "border-amber-500/50 bg-amber-500/10",   bar: "bg-amber-500",  btn: "from-amber-500 to-orange-500 shadow-amber-500/20", dot: "bg-amber-500 shadow-amber-500/30" },
}

export function FirstTimeSetup({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OData>({
    role: null, sessionTypes: [], sessionLength: "",
    preparation: "", focusAreas: [], expertiseAreas: [], feedbackStyle: "",
  })

  const set = (patch: Partial<OData>) => setData(d => ({ ...d, ...patch }))
  const toggle = (key: keyof OData, val: string) => {
    const arr = data[key] as string[]
    set({ [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] })
  }

  const skip = () => { localStorage.setItem("speakspace_onboarding_complete", "true"); onComplete() }

  const finish = async () => {
    setSaving(true)
    try {
      localStorage.setItem("speakspace_onboarding_complete", "true")
      localStorage.setItem("speakspace_user_role", data.role ?? "")
      if (user?.id) {
        await setDoc(doc(db, "users", user.id), {
          preferredRole: data.role, onboardingData: data,
          onboardingCompleted: true, onboardingCompletedAt: serverTimestamp(), updatedAt: serverTimestamp(),
        }, { merge: true })
      }
      setDone(true)
    } catch { setDone(true) } finally { setSaving(false) }
  }

  const goTo = (path: string) => { onComplete(); router.push(path) }

  if (done && data.role) {
    return <DoneScreen role={data.role} name={user?.name?.split(" ")[0] ?? "there"} goTo={goTo} back={onComplete} />
  }

  const m = data.role ? ROLE_META[data.role] : ROLE_META.participant
  const labels = {
    moderator:   ["Role", "Session Type", "Run Style"],
    participant: ["Role", "Your Goal",    "Focus"],
    evaluator:   ["Role", "Expertise",    "Feedback"],
  }[data.role ?? "participant"] ?? ["Role", "Details", "Style"]

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-white/[0.05] shrink-0">
        <span className="font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">SpeakSpace</span>
        <button onClick={skip} className="flex items-center gap-1 text-sm text-slate-500 hover:text-white transition-colors">
          Skip <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/[0.05]">
        <div className={`h-full ${m.bar} transition-all duration-500`} style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Step label */}
          <div className="flex items-center gap-2 mb-6">
            {[1,2,3].map(n => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-semibold transition-all ${
                  step === n ? `${m.dot} text-white shadow-lg` : step > n ? "bg-green-600/20 text-green-400" : "bg-white/5 text-slate-600"
                }`}>
                  {step > n ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
                </div>
                <span className={`text-xs ${step === n ? "text-white" : step > n ? "text-green-400" : "text-slate-600"}`}>{labels[n-1]}</span>
                {n < 3 && <div className="w-6 h-px bg-white/[0.08] mx-1" />}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="bg-slate-900/70 border border-white/[0.06] rounded-2xl p-7">
            {step === 1 && <Step1 role={data.role} onSelect={r => set({ role: r })} />}
            {step === 2 && data.role === "moderator"   && <ModStep2 types={data.sessionTypes} onToggle={v => toggle("sessionTypes", v)} />}
            {step === 2 && data.role === "participant"  && <ParStep2 prep={data.preparation} onSet={v => set({ preparation: v })} />}
            {step === 2 && data.role === "evaluator"    && <EvalStep2 areas={data.expertiseAreas} onToggle={v => toggle("expertiseAreas", v)} />}
            {step === 3 && data.role === "moderator"    && <ModStep3 length={data.sessionLength} onSet={v => set({ sessionLength: v })} />}
            {step === 3 && data.role === "participant"  && <ParStep3 areas={data.focusAreas} onToggle={v => toggle("focusAreas", v)} />}
            {step === 3 && data.role === "evaluator"    && <EvalStep3 style={data.feedbackStyle} onSet={v => set({ feedbackStyle: v })} />}

            <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/[0.05]">
              <button onClick={skip} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Skip for now</button>
              {step < 3 ? (
                <Button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !data.role}
                  className={`bg-gradient-to-r ${m.btn} text-white border-0 shadow-lg px-5 h-9 text-sm`}>
                  Next <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button onClick={finish} disabled={saving}
                  className={`bg-gradient-to-r ${m.btn} text-white border-0 shadow-lg px-5 h-9 text-sm`}>
                  {saving ? "Saving…" : <><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Finish</>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 1: Role ─────────────────────────────────────────────────────────────

function Step1({ role, onSelect }: { role: Role | null; onSelect: (r: Role) => void }) {
  const cards = [
    { id: "moderator" as Role,   icon: <Crown className="h-5 w-5" />,  label: "Moderator",   sub: "Lead sessions & set topics",       accent: "hover:border-purple-500/40 data-[sel=true]:border-purple-500/50 data-[sel=true]:bg-purple-500/10", iconCls: "bg-purple-500/15 text-purple-400" },
    { id: "participant" as Role, icon: <Mic className="h-5 w-5" />,    label: "Participant",  sub: "Practice GDs & mock interviews",   accent: "hover:border-blue-500/40   data-[sel=true]:border-blue-500/50   data-[sel=true]:bg-blue-500/10",   iconCls: "bg-blue-500/15 text-blue-400"   },
    { id: "evaluator" as Role,   icon: <Award className="h-5 w-5" />,  label: "Evaluator",   sub: "Score sessions & give feedback",   accent: "hover:border-amber-500/40  data-[sel=true]:border-amber-500/50  data-[sel=true]:bg-amber-500/10",  iconCls: "bg-amber-500/15 text-amber-400" },
  ]
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">What's your role?</h2>
      <p className="text-slate-500 text-sm mb-5">Shapes everything — questions, sessions, feedback</p>
      <div className="space-y-2.5">
        {cards.map(c => (
          <div key={c.id} data-sel={role === c.id} onClick={() => onSelect(c.id)}
            className={`cursor-pointer border rounded-xl p-4 flex items-center gap-4 transition-all border-white/[0.07] ${c.accent}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.iconCls}`}>{c.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{c.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{c.sub}</p>
            </div>
            {role === c.id && <CheckCircle2 className="h-4 w-4 text-white/50 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Moderator Steps ──────────────────────────────────────────────────────────

function ModStep2({ types, onToggle }: { types: string[]; onToggle: (v: string) => void }) {
  const opts = ["Group Discussion", "Mock Interview", "Panel Discussion", "Case Study"]
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">What will you run?</h2>
      <p className="text-slate-500 text-sm mb-5">Pick the session types you'll moderate</p>
      <div className="space-y-2">
        {opts.map(o => {
          const sel = types.includes(o)
          return (
            <div key={o} onClick={() => onToggle(o)}
              className={`cursor-pointer rounded-xl border px-4 py-3 flex items-center justify-between transition-all ${sel ? "border-purple-500/50 bg-purple-500/10 text-white" : "border-white/[0.07] text-slate-400 hover:border-white/20 hover:text-slate-200"}`}>
              <span className="text-sm font-medium">{o}</span>
              {sel && <CheckCircle2 className="h-4 w-4 text-purple-400" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ModStep3({ length, onSet }: { length: string; onSet: (v: string) => void }) {
  const opts = ["15 min", "30 min", "45 min", "60 min"]
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Typical session length?</h2>
      <p className="text-slate-500 text-sm mb-5">Used to auto-configure timers and pacing</p>
      <div className="grid grid-cols-2 gap-2.5">
        {opts.map(o => (
          <div key={o} onClick={() => onSet(o)}
            className={`cursor-pointer rounded-xl border px-4 py-4 text-center transition-all ${length === o ? "border-purple-500/50 bg-purple-500/10 text-white" : "border-white/[0.07] text-slate-400 hover:border-white/20 hover:text-slate-200"}`}>
            <p className="text-base font-bold">{o.split(" ")[0]}</p>
            <p className="text-xs text-slate-500">minutes</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Participant Steps ────────────────────────────────────────────────────────

function ParStep2({ prep, onSet }: { prep: string; onSet: (v: string) => void }) {
  const opts = [
    { id: "campus",  label: "Campus Placements",      sub: "GD & PI rounds" },
    { id: "job",     label: "Job Interview",           sub: "Corporate / lateral" },
    { id: "mba",     label: "MBA Admissions",          sub: "GD-PI rounds" },
    { id: "speaking",label: "Public Speaking",         sub: "Talks & presentations" },
  ]
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">What are you preparing for?</h2>
      <p className="text-slate-500 text-sm mb-5">We'll match you to the right sessions</p>
      <div className="space-y-2">
        {opts.map(o => (
          <div key={o.id} onClick={() => onSet(o.id)}
            className={`cursor-pointer rounded-xl border px-4 py-3 flex items-center justify-between transition-all ${prep === o.id ? "border-blue-500/50 bg-blue-500/10 text-white" : "border-white/[0.07] text-slate-400 hover:border-white/20 hover:text-slate-200"}`}>
            <div>
              <p className="text-sm font-medium">{o.label}</p>
              <p className="text-xs text-slate-600 mt-0.5">{o.sub}</p>
            </div>
            {prep === o.id && <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}

function ParStep3({ areas, onToggle }: { areas: string[]; onToggle: (v: string) => void }) {
  const opts = ["Opening discussions", "Building arguments", "Handling interruptions", "Reducing nervousness", "Active listening", "Body language"]
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">What to improve?</h2>
      <p className="text-slate-500 text-sm mb-5">Sessions will target these areas</p>
      <div className="flex flex-wrap gap-2">
        {opts.map(o => {
          const sel = areas.includes(o)
          return (
            <button key={o} onClick={() => onToggle(o)}
              className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${sel ? "border-blue-500/50 bg-blue-500/10 text-blue-300" : "border-white/[0.07] text-slate-500 hover:border-white/20 hover:text-slate-300"}`}>
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Evaluator Steps ──────────────────────────────────────────────────────────

function EvalStep2({ areas, onToggle }: { areas: string[]; onToggle: (v: string) => void }) {
  const opts = ["Communication", "Leadership", "Logical Reasoning", "Technical Depth", "Confidence", "Time Management"]
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">What can you evaluate?</h2>
      <p className="text-slate-500 text-sm mb-5">Shapes the rubrics shown to you</p>
      <div className="flex flex-wrap gap-2">
        {opts.map(o => {
          const sel = areas.includes(o)
          return (
            <button key={o} onClick={() => onToggle(o)}
              className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${sel ? "border-amber-500/50 bg-amber-500/10 text-amber-300" : "border-white/[0.07] text-slate-500 hover:border-white/20 hover:text-slate-300"}`}>
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EvalStep3({ style, onSet }: { style: string; onSet: (v: string) => void }) {
  const opts = [
    { id: "written",    label: "Detailed Written",  sub: "Full commentary per criterion" },
    { id: "ratings",    label: "Quick Ratings",      sub: "Numeric scores, fast" },
    { id: "coaching",   label: "Verbal Coaching",    sub: "Conversational, in-session" },
  ]
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">How do you give feedback?</h2>
      <p className="text-slate-500 text-sm mb-5">Pre-fills your evaluation templates</p>
      <div className="space-y-2">
        {opts.map(o => (
          <div key={o.id} onClick={() => onSet(o.id)}
            className={`cursor-pointer rounded-xl border px-4 py-3 flex items-center justify-between transition-all ${style === o.id ? "border-amber-500/50 bg-amber-500/10 text-white" : "border-white/[0.07] text-slate-400 hover:border-white/20 hover:text-slate-200"}`}>
            <div>
              <p className="text-sm font-medium">{o.label}</p>
              <p className="text-xs text-slate-600 mt-0.5">{o.sub}</p>
            </div>
            {style === o.id && <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Completion Screens ───────────────────────────────────────────────────────

function DoneScreen({ role, name, goTo, back }: {
  role: Role; name: string; goTo: (p: string) => void; back: () => void
}) {
  const screens = {
    moderator: {
      bg: "#0d0814", glow: "bg-purple-600/15",
      icon: <Crown className="h-10 w-10 text-white" />,
      iconBg: "from-purple-600 to-violet-700 shadow-purple-500/40",
      heading: "Command Center Ready",
      sub: "You're set up to lead structured sessions",
      accent: "text-purple-400",
      widget: (
        <div className="border border-purple-500/20 bg-purple-500/5 rounded-xl p-4 mb-7">
          <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-4">Your Moderator Stats</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Sessions Hosted", value: "0" },
              { label: "Avg. Rating",     value: "—" },
              { label: "Topics Created",  value: "0" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-purple-300">{value}</p>
                <p className="text-xs text-slate-600 mt-1 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      ),
      btnLabel: "Create Your First Session",
      btnCls: "from-purple-600 to-violet-600 shadow-purple-500/25",
      path: "/live-sessions",
    },
    participant: {
      bg: "#010d18", glow: "bg-cyan-600/12",
      icon: <Mic className="h-10 w-10 text-white" />,
      iconBg: "from-blue-600 to-cyan-600 shadow-blue-500/40",
      heading: "Your Journey Begins",
      sub: "Every session makes you sharper",
      accent: "text-blue-400",
      widget: (
        <div className="border border-blue-500/20 bg-blue-500/5 rounded-xl p-4 mb-7">
          <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-3">Skills to track</p>
          {["Communication", "Confidence", "Argumentation"].map(s => (
            <div key={s} className="mb-2.5">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{s}</span>
                <span className="text-slate-600">0%</span>
              </div>
              <div className="h-1 rounded-full bg-white/[0.05]">
                <div className="h-full w-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
              </div>
            </div>
          ))}
        </div>
      ),
      btnLabel: "Find a Session to Join",
      btnCls: "from-blue-600 to-cyan-600 shadow-blue-500/25",
      path: "/live-sessions",
    },
    evaluator: {
      bg: "#130e00", glow: "bg-amber-600/12",
      icon: <Award className="h-10 w-10 text-white" />,
      iconBg: "from-amber-500 to-orange-600 shadow-amber-500/40",
      heading: "Ready to Shape Leaders",
      sub: "Your feedback defines how people grow",
      accent: "text-amber-400",
      widget: (
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-4 mb-7">
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-3">Rubric preview</p>
          {["Communication", "Logic", "Confidence"].map(c => (
            <div key={c} className="flex items-center gap-3 mb-2">
              <span className="text-xs text-slate-400 w-24 shrink-0">{c}</span>
              <div className="flex gap-1 flex-1">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className="h-5 flex-1 rounded bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                    <span className="text-xs text-slate-700">{n}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
      btnLabel: "Browse Sessions to Evaluate",
      btnCls: "from-amber-500 to-orange-500 shadow-amber-500/25",
      path: "/live-sessions",
    },
  }

  const s = screens[role]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{ background: s.bg }}>
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
        <div className={`w-[500px] h-[300px] rounded-full blur-3xl ${s.glow}`} />
      </div>
      <div className="relative w-full max-w-sm text-center">
        {/* Icon */}
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${s.iconBg} flex items-center justify-center mx-auto mb-6 shadow-2xl`}>
          {s.icon}
        </div>
        <div className={`w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mx-auto -mt-9 mb-5 ml-14 relative`}>
          <CheckCircle2 className="h-3 w-3 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">{s.heading},</h1>
        <p className={`text-lg font-bold mb-2 ${s.accent}`}>{name}!</p>
        <p className="text-slate-500 text-sm mb-8">{s.sub}</p>

        {s.widget}

        <Button
          onClick={() => goTo(s.path)}
          className={`w-full h-11 bg-gradient-to-r ${s.btnCls} text-white font-semibold border-0 shadow-xl mb-3`}
        >
          {s.btnLabel} <ChevronRight className="ml-1.5 h-4 w-4" />
        </Button>
        <button onClick={back} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}
