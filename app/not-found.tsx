import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">404</p>
        <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-8 text-sm">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Link>
          <Link href="/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all">
            <Home className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
