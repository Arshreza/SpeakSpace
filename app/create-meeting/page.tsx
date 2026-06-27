"use client"

import { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { Calendar as CalendarIcon, Users, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

const INPUT = "w-full px-3.5 py-2.5 rounded-xl bg-slate-800/50 border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 text-sm"
const LABEL = "text-xs font-medium text-slate-400 uppercase tracking-wide"

export default function CreateMeeting() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    topic: "",
    description: "",
    maxParticipants: "10",
    rules: "",
  })

  const set = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData(p => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !date) return
    setIsSubmitting(true)
    try {
      const meetingId = `gd_${Date.now()}`
      await setDoc(doc(db, "meetings", meetingId), {
        id: meetingId,
        type: "group_discussion",
        topic: formData.topic,
        description: formData.description,
        maxParticipants: parseInt(formData.maxParticipants),
        rules: formData.rules,
        scheduledAt: date,
        createdBy: user.id,
        createdAt: serverTimestamp(),
        status: "scheduled",
        participants: [user.id],
      })
      await setDoc(doc(db, "chatRooms", `chat_${meetingId}`), {
        id: `chat_${meetingId}`,
        meetingId,
        createdAt: serverTimestamp(),
        participants: [user.id],
      })
      router.push("/live-sessions")
    } catch (err) {
      console.error("Error creating meeting:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNav />
      <main className="container mx-auto pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Group Discussion</h1>
            <p className="text-slate-400 text-sm mt-1">Schedule a new group discussion session</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-slate-900/60 border border-white/[0.07] rounded-2xl p-7 space-y-5">
              <div className="space-y-1.5">
                <label className={LABEL}>Discussion Topic *</label>
                <input value={formData.topic} onChange={set("topic")} required
                  placeholder="Enter the main topic for discussion" className={INPUT} />
              </div>

              <div className="space-y-1.5">
                <label className={LABEL}>Description *</label>
                <textarea value={formData.description} onChange={set("description")} required rows={3}
                  placeholder="Provide a brief description of the discussion points"
                  className={`${INPUT} resize-none`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className={LABEL}>Schedule Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button"
                        className={cn(INPUT, "flex items-center gap-2 text-left", !date && "text-slate-500")}>
                        <CalendarIcon className="h-4 w-4 shrink-0" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-slate-900 border border-white/[0.08]" align="start">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus
                        className="text-white [--rdp-accent-color:theme(colors.blue.500)]" />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <label className={LABEL}>Max Participants</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min="2" max="20" value={formData.maxParticipants}
                      onChange={set("maxParticipants")} required className={INPUT} />
                    <Users className="h-4 w-4 text-slate-500 shrink-0" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={LABEL}>Discussion Rules *</label>
                <textarea value={formData.rules} onChange={set("rules")} required rows={3}
                  placeholder="Set any specific rules or guidelines for the discussion"
                  className={`${INPUT} resize-none`} />
              </div>

              <button type="submit" disabled={isSubmitting || !date}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : "Create Discussion"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

import type React from "react"
