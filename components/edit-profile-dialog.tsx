"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

const INPUT = "w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-sm transition-colors"

export function EditProfileDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name:   user?.name  || "",
    email:  user?.email || "",
    bio:    "",
    skills: "",
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" }); return
    }
    if (!user?.id) return
    setSaving(true)
    try {
      const skillsArr = form.skills.split(",").map(s => s.trim()).filter(Boolean)
      await setDoc(doc(db, "users", user.id), {
        name:      form.name.trim(),
        bio:       form.bio.trim(),
        skills:    skillsArr,
        updatedAt: serverTimestamp(),
      }, { merge: true })
      toast({ title: "Profile updated" })
      onClose()
    } catch {
      toast({ title: "Failed to save", description: "Please try again.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border border-white/[0.08] text-white max-w-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Profile</DialogTitle>
          <DialogDescription className="text-slate-400">Update your name, bio and skills</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Avatar preview */}
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
              {initials}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Name *</p>
            <input value={form.name} onChange={set("name")} placeholder="Your full name" disabled={saving} className={INPUT} />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Email</p>
            <input value={form.email} disabled className={`${INPUT} opacity-50 cursor-not-allowed`} />
            <p className="text-xs text-slate-600">Email cannot be changed here</p>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Bio</p>
            <textarea value={form.bio} onChange={set("bio")} placeholder="A short bio about yourself…" rows={3} disabled={saving} className={INPUT} />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Skills (comma-separated)</p>
            <input value={form.skills} onChange={set("skills")} placeholder="e.g., Communication, Leadership" disabled={saving} className={INPUT} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}
              className="flex-1 border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/5">
              Cancel
            </Button>
            <Button type="submit" disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg font-semibold">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import type React from "react"
