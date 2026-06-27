"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch {
      setError("Couldn't send reset email. Check the address and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <Link href="/landing">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent inline-block">
              SpeakSpace
            </h1>
          </Link>
          <p className="text-slate-400 text-sm mt-2">Reset your password</p>
        </div>

        <div className="bg-slate-900/80 border border-white/[0.07] rounded-2xl p-8 backdrop-blur-sm shadow-xl">
          {!sent ? (
            <>
              {error && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
              )}
              <p className="text-slate-400 text-sm mb-6 text-center">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 text-sm font-medium">Email</label>
                  <input
                    type="email" required placeholder="name@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} disabled={loading}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-800/50 border border-white/[0.08] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 text-sm"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center text-sm">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : "Send Reset Link"}
                </button>
              </form>
              <p className="text-center text-sm text-slate-500 mt-6">
                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="h-7 w-7 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Check your inbox</h3>
              <p className="text-slate-400 text-sm mb-1">We sent a reset link to</p>
              <p className="text-white font-medium text-sm mb-6">{email}</p>
              <p className="text-xs text-slate-600 mb-5">
                Didn't get it?{" "}
                <button onClick={() => setSent(false)} className="text-blue-400 hover:text-blue-300 transition-colors">Try again</button>
              </p>
              <Link href="/auth/login"
                className="block w-full h-10 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm flex items-center justify-center">
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

import type React from "react"
