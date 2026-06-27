import Link from "next/link"
import { Lock, LogIn } from "lucide-react"

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="h-9 w-9 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          You don't have permission to view this page. Sign in or contact support if you believe this is an error.
        </p>
        <Link href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all">
          <LogIn className="h-4 w-4" /> Sign In
        </Link>
      </div>
    </div>
  )
}
