"use client"

import React, { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { BookOpen, Download, FileText, Filter, Search, Video, Plus, X, Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

const CARD = "bg-slate-900/60 border border-white/[0.07] rounded-2xl"
const INPUT = "w-full px-3.5 py-2.5 rounded-xl bg-slate-800/50 border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 text-sm"

const FEATURED = [
  { title: "Master the Technical Interview", desc: "A comprehensive guide to acing technical interviews with practice questions.", type: "Guide", icon: "file", tags: ["Technical", "Interview"] },
  { title: "Effective Question Bank Techniques", desc: "Contribute meaningfully in discussions and stand out from the crowd.", type: "Video Course", icon: "video", tags: ["Communication", "Leadership"] },
  { title: "Resume That Gets You Hired", desc: "Templates and tips for creating a resume that catches recruiters' attention.", type: "Template", icon: "file", tags: ["Resume", "Career"] },
]

const POPULAR = [
  { title: "Behavioral Interview Questions", desc: "50+ common behavioral questions with example answers.", type: "Guide", tags: ["Interview", "Behavioral"] },
  { title: "System Design Interview Prep", desc: "How to approach and solve system design problems.", type: "Guide", tags: ["Technical", "System Design"] },
  { title: "Question Bank Topics", desc: "Current affairs and trending topics for GD practice.", type: "List", tags: ["Question Bank"] },
  { title: "Body Language in Interviews", desc: "Master non-verbal communication for better impressions.", type: "Video", tags: ["Interview", "Body Language"], isVideo: true },
  { title: "Resume Templates for Tech Roles", desc: "ATS-friendly templates for software engineers and data scientists.", type: "Template", tags: ["Resume", "Technical"] },
  { title: "Mock Interview Questions", desc: "Practice with real interview questions from top companies.", type: "Practice", tags: ["Interview", "Practice"] },
]

const LATEST = [
  { title: "AI in Technical Interviews", desc: "How to prepare for AI-related questions in tech interviews.", type: "Guide", tags: ["Technical", "AI"] },
  { title: "Remote Interview Success", desc: "Tips for making a great impression in virtual interviews.", type: "Video", tags: ["Interview", "Remote"], isVideo: true },
  { title: "Salary Negotiation Tactics", desc: "How to negotiate your compensation package effectively.", type: "Guide", tags: ["Career", "Negotiation"] },
]

function TypeIcon({ isVideo }: { isVideo?: boolean }) {
  return isVideo
    ? <Video className="h-4 w-4 text-indigo-400" />
    : <FileText className="h-4 w-4 text-blue-400" />
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="text-xs bg-white/[0.04] border border-white/[0.06] text-slate-400 px-2 py-0.5 rounded-full">{type}</span>
  )
}

function Tag({ label }: { label: string }) {
  return <span className="text-xs bg-slate-800/60 border border-white/[0.05] text-slate-500 px-2 py-0.5 rounded-full">{label}</span>
}

function ResourceCard({ title, desc, type, tags, isVideo }: { title: string; desc: string; type: string; tags: string[]; isVideo?: boolean }) {
  return (
    <div className={`${CARD} p-5 flex flex-col gap-3`}>
      <TypeBadge type={type} />
      <div>
        <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t, i) => <Tag key={i} label={t} />)}
      </div>
      <div className="flex gap-2 mt-auto pt-1">
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs transition-colors">
          <BookOpen className="h-3.5 w-3.5" /> View
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04] text-xs transition-colors">
          <Download className="h-3.5 w-3.5" /> Download
        </button>
      </div>
    </div>
  )
}

function FeaturedCard({ title, desc, type, icon, tags }: { title: string; desc: string; type: string; icon: string; tags: string[] }) {
  return (
    <div className={`${CARD} p-5 flex flex-col gap-4`}>
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-white/[0.06] shrink-0">
          {icon === "video" ? <Video className="h-5 w-5 text-indigo-400" /> : <FileText className="h-5 w-5 text-blue-400" />}
        </div>
        <div>
          <TypeBadge type={type} />
          <h3 className="font-semibold text-white text-sm mt-1.5 mb-1 leading-snug">{title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t, i) => <Tag key={i} label={t} />)}
      </div>
      <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow transition-all">
        Access Resource
      </button>
    </div>
  )
}

export default function Resources() {
  const [activeTab, setActiveTab] = useState<"all" | "interview" | "gd">("all")
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", type: "guide", tags: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await addDoc(collection(db, "resources"), {
        title: form.title,
        description: form.description,
        type: form.type,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        createdAt: serverTimestamp(),
      })
      setForm({ title: "", description: "", type: "guide", tags: "" })
      setShowAdd(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNav />
      <main className="container mx-auto pt-24 pb-16 px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Resources</h1>
            <p className="text-slate-400 text-sm mt-1">Guides, tips and materials to help you improve</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                type="text" placeholder="Search resources…"
                className={`${INPUT} pl-10`} />
            </div>
            <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/50 border border-white/[0.08] text-slate-400 hover:text-white text-sm transition-colors">
              <Filter className="h-4 w-4" /> Filter
            </button>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>

        {/* Add Resource Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold">Add New Resource</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Resource title" required className={INPUT} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Short description…" rows={2} className={`${INPUT} resize-none`} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className={`${INPUT} bg-slate-800/50`}>
                    <option value="guide">Guide</option>
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="template">Template</option>
                    <option value="practice">Practice</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="e.g., Interview, Technical" className={INPUT} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAdd(false)} disabled={saving}
                    className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Add Resource"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Recommended */}
        <div className={`${CARD} p-6 mb-8`}>
          <h2 className="text-white font-semibold mb-1">Recommended for You</h2>
          <p className="text-slate-400 text-xs mb-5">Based on your recent sessions and performance</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Improving Logical Reasoning", desc: "Techniques to enhance problem-solving and critical thinking skills.", type: "Guide", reason: "Based on your logical reasoning scores", isVideo: false },
              { title: "Technical Interview Questions", desc: "Common coding and system design questions with detailed solutions.", type: "Practice", reason: "Matches your profile and career interests", isVideo: false },
              { title: "Effective Communication", desc: "Learn how to articulate your thoughts clearly and concisely.", type: "Video", reason: "Popular among users with similar goals", isVideo: true },
            ].map((r, i) => (
              <div key={i} className="bg-slate-800/40 border border-white/[0.05] rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 shrink-0">
                    <TypeIcon isVideo={r.isVideo} />
                  </div>
                  <div>
                    <TypeBadge type={r.type} />
                    <h4 className="text-sm font-semibold text-white mt-1 mb-1">{r.title}</h4>
                    <p className="text-xs text-slate-400">{r.desc}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic">{r.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl w-fit mb-6 border border-white/[0.05]">
          {(["all", "interview", "gd"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
              {t === "all" ? "All Resources" : t === "interview" ? "Interview Prep" : "Question Bank"}
            </button>
          ))}
        </div>

        {activeTab === "all" && (
          <>
            <h2 className="text-white font-semibold mb-4">Featured</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {FEATURED.map((f, i) => <FeaturedCard key={i} {...f} />)}
            </div>

            <h2 className="text-white font-semibold mb-4">Popular Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {POPULAR.map((r, i) => <ResourceCard key={i} {...r} />)}
            </div>

            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              Latest Resources
              <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full">New</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LATEST.map((r, i) => <ResourceCard key={i} {...r} />)}
            </div>
          </>
        )}

        {activeTab !== "all" && (
          <div className={`${CARD} p-12 text-center`}>
            <p className="text-slate-400 text-sm">
              {activeTab === "interview" ? "Interview-specific" : "Question Bank"} resources — full content coming soon.
            </p>
            <button onClick={() => setActiveTab("all")} className="mt-4 text-blue-400 hover:text-blue-300 text-sm transition-colors">
              ← View all resources
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
