"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronRight, Mic, User, Users } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const ROLES = [
  { id: "participant", title: "Participant", desc: "Join sessions and improve your skills through practice and feedback", Icon: User, color: "blue" },
  { id: "moderator", title: "Moderator", desc: "Create and manage sessions, guide discussions, and set topics", Icon: Mic, color: "purple" },
  { id: "evaluator", title: "Evaluator", desc: "Provide feedback and ratings to help participants improve", Icon: Users, color: "amber" },
]

const TEMPLATES = [
  { id: "professional", title: "Professional", desc: "Clean, minimal interface focused on productivity" },
  { id: "modern", title: "Modern", desc: "Vibrant colors and contemporary design elements" },
  { id: "classic", title: "Classic", desc: "Traditional layout with intuitive navigation" },
]

const ACCENT: Record<string, string> = {
  blue: "border-blue-500/60 bg-blue-500/10",
  purple: "border-violet-500/60 bg-violet-500/10",
  amber: "border-amber-500/60 bg-amber-500/10",
}
const ICON_COLOR: Record<string, string> = {
  blue: "text-blue-400",
  purple: "text-violet-400",
  amber: "text-amber-400",
}

export default function TemplateSelectionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleContinue = () => {
    if (!selectedRole) return
    localStorage.setItem("speakspace_user_role", selectedRole)
    localStorage.setItem("speakspace_template", selectedTemplate || "professional")
    localStorage.setItem("speakspace_onboarding_complete", "true")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="py-5 px-4 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            SpeakSpace
          </h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Choose your primary role to personalize your SpeakSpace experience.
          </p>
        </div>

        {/* Role selection */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Select your role</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROLES.map(({ id, title, desc, Icon, color }) => {
              const sel = selectedRole === id
              return (
                <button key={id} onClick={() => setSelectedRole(id)}
                  className={`relative text-left p-5 rounded-2xl border transition-all ${sel ? ACCENT[color] : "bg-slate-900/60 border-white/[0.07] hover:border-white/[0.15]"}`}>
                  {sel && <CheckCircle2 className={`absolute top-3.5 right-3.5 h-4 w-4 ${ICON_COLOR[color]}`} />}
                  <div className={`p-2.5 rounded-xl bg-slate-800/60 border border-white/[0.08] inline-flex mb-3`}>
                    <Icon className={`h-5 w-5 ${sel ? ICON_COLOR[color] : "text-slate-400"}`} />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Template selection */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Choose interface template</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEMPLATES.map(({ id, title, desc }) => {
              const sel = selectedTemplate === id
              return (
                <button key={id} onClick={() => setSelectedTemplate(id)}
                  className={`relative text-left p-5 rounded-2xl border transition-all ${sel ? "border-blue-500/60 bg-blue-500/10" : "bg-slate-900/60 border-white/[0.07] hover:border-white/[0.15]"}`}>
                  {sel && <CheckCircle2 className="absolute top-3.5 right-3.5 h-4 w-4 text-blue-400" />}
                  <div className="h-20 rounded-xl bg-slate-800/60 border border-white/[0.05] mb-4 flex items-center justify-center">
                    <span className="text-xs text-slate-600">Preview</span>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                  <p className="text-xs text-slate-400">{desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-center">
          <button onClick={handleContinue} disabled={!selectedRole}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-blue-500/20 transition-all">
            Continue to Dashboard <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  )
}
