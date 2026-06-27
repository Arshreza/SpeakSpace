"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard")
      } else {
        router.push("/landing")
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          SpeakSpace
        </h2>
        <p className="text-slate-500 mt-2 text-sm">Loading your workspace...</p>
      </div>
    </main>
  )
}
