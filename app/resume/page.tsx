"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { useAuth } from "@/components/auth-provider"
import { MainNav } from "@/components/main-nav"
import { FileText, Trash2, UploadCloud, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react"
import { StarRating } from "@/components/star-rating"

const CARD = "bg-slate-900/60 border border-white/[0.07] rounded-2xl p-6"

export default function ResumePage() {
  const { user } = useAuth()
  const router = useRouter()
  const role = typeof window !== "undefined" ? localStorage.getItem("speakspace_user_role") : "participant"

  useEffect(() => {
    if (role && role !== "participant") router.replace("/dashboard")
  }, [role, router])

  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeScore, setResumeScore] = useState<number | null>(null)
  const [resumeFeedback, setResumeFeedback] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [resumeTips, setResumeTips] = useState<string[]>([])
  const [isLoadingTips, setIsLoadingTips] = useState(false)
  const [activeTab, setActiveTab] = useState<"feedback" | "tips">("feedback")

  useEffect(() => {
    const fetchResumeTips = async () => {
      if (!user?.id) return
      setIsLoadingTips(true)
      try {
        const db = getFirestore()
        const q = query(
          collection(db, "resumeAnalyses"),
          where("userId", "==", user.id),
          orderBy("timestamp", "desc"),
          limit(1)
        )
        const snap = await getDocs(q)
        if (!snap.empty) setResumeTips(snap.docs[0].data().feedback ?? [])
      } catch {}
      finally { setIsLoadingTips(false) }
    }
    fetchResumeTips()
  }, [user?.id])

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setResumeFile(file)
    setIsAnalyzing(true)
    setResumeFeedback([])
    setResumeScore(null)
    try {
      const formData = new FormData()
      formData.append("resume", file)
      const res = await fetch("http://localhost:5000/api/analyze-resume", { method: "POST", body: formData })
      if (res.ok) {
        const data = await res.json()
        setResumeScore(data.score ?? null)
        setResumeFeedback(data.feedback ?? [])
      }
    } catch {}
    finally { setIsAnalyzing(false) }
  }

  const iconForIndex = (i: number) => {
    const c = i % 3
    if (c === 0) return <CheckCircle2 className="h-4 w-4" />
    if (c === 1) return <AlertCircle className="h-4 w-4" />
    return <Lightbulb className="h-4 w-4" />
  }
  const colorForIndex = (i: number) => {
    const c = i % 3
    if (c === 0) return "text-green-400 bg-green-500/10"
    if (c === 1) return "text-amber-400 bg-amber-500/10"
    return "text-blue-400 bg-blue-500/10"
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNav />
      <main className="container mx-auto pt-24 pb-16 px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Resume</h1>
          <p className="text-slate-400 text-sm mt-1">Upload your resume for AI feedback, or browse personalized tips</p>
        </div>

        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl w-fit mb-8 border border-white/[0.05]">
          {(["feedback", "tips"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
              {t === "feedback" ? "Resume Feedback" : "Resume Tips"}
            </button>
          ))}
        </div>

        {activeTab === "feedback" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className={CARD}>
                <h3 className="text-white font-semibold mb-1">Upload Resume</h3>
                <p className="text-slate-400 text-xs mb-5">PDF, DOCX or RTF — get instant AI feedback</p>

                {!resumeFile ? (
                  <label htmlFor="resume-upload" className="cursor-pointer block">
                    <div className="border-2 border-dashed border-white/[0.08] rounded-xl p-8 text-center hover:border-blue-500/40 transition-colors">
                      <UploadCloud className="h-9 w-9 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm mb-1">Click to upload</p>
                      <p className="text-slate-600 text-xs">PDF, DOCX, RTF</p>
                    </div>
                    <input type="file" accept=".pdf,.docx,.rtf" className="hidden" id="resume-upload" onChange={handleResumeUpload} />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/[0.06]">
                      <FileText className="h-7 w-7 text-blue-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{resumeFile.name}</p>
                        <p className="text-xs text-slate-500">{(resumeFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button onClick={() => { setResumeFile(null); setResumeFeedback([]); setResumeScore(null) }}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {isAnalyzing && (
                      <div className="text-center py-3">
                        <div className="inline-flex items-center gap-2 text-blue-400 text-sm">
                          <div className="h-3 w-3 rounded-full bg-blue-400 animate-pulse" />
                          Analyzing…
                        </div>
                      </div>
                    )}

                    {resumeScore !== null && !isAnalyzing && (
                      <div className="text-center py-3 bg-slate-800/40 rounded-xl border border-white/[0.05]">
                        <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Resume Score</p>
                        <StarRating value={resumeScore} max={10} readOnly />
                        <p className="text-xs text-slate-500 mt-2">Good — room to grow</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              {resumeFeedback.length > 0 ? (
                <div className={CARD}>
                  <h3 className="text-white font-semibold mb-4">AI Feedback</h3>
                  <div className="space-y-3">
                    {resumeFeedback.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-white/[0.05]">
                        <div className={`p-1.5 rounded-lg shrink-0 ${colorForIndex(i)}`}>
                          {iconForIndex(i)}
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-8">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                    <FileText className="h-7 w-7 text-blue-400" />
                  </div>
                  <p className="text-white font-medium mb-1">No feedback yet</p>
                  <p className="text-slate-400 text-sm">Upload your resume to get instant AI analysis</p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {activeTab === "tips" && (
          <div className={CARD + " max-w-2xl"}>
            <h3 className="text-white font-semibold mb-1">Resume Tips</h3>
            <p className="text-slate-400 text-xs mb-5">Personalized suggestions from your latest analysis</p>
            {isLoadingTips ? (
              <div className="text-center py-8 text-blue-400 text-sm animate-pulse">Loading tips…</div>
            ) : resumeTips.length > 0 ? (
              <div className="space-y-3">
                {resumeTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/40 border border-white/[0.05] hover:bg-slate-800/60 transition-colors">
                    <Lightbulb className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      {tip.includes(":") ? (
                        <>
                          <p className="text-sm font-medium text-white mb-0.5">{tip.split(":")[0]}</p>
                          <p className="text-xs text-slate-400">{tip.split(":").slice(1).join(":").trim()}</p>
                        </>
                      ) : (
                        <p className="text-sm text-slate-300">{tip}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">Upload your resume in the Feedback tab to generate personalized tips.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
