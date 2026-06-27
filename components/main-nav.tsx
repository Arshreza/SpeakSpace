"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, BookOpen, Home, MessageSquare, User } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/components/auth-provider"

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const role = user?.role || (typeof window !== "undefined" ? localStorage.getItem("speakspace_user_role") : "") || "participant"

  const navItems = [
    { name: "Dashboard",    href: "/dashboard",     icon: Home,         roles: ["moderator", "participant", "evaluator"] },
    { name: "Sessions",     href: "/live-sessions", icon: MessageSquare,roles: ["moderator", "participant", "evaluator"] },
    { name: "Leaderboard",  href: "/leaderboard",   icon: BarChart3,    roles: ["moderator", "participant", "evaluator"] },
    { name: "Resume",       href: "/resume",         icon: BookOpen,     roles: ["participant"] },
    { name: "Profile",      href: "/profile",        icon: User,         roles: ["moderator", "participant", "evaluator"] },
  ].filter(item => item.roles.includes(role))

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="flex h-14 items-center px-4 md:px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center mr-8 shrink-0">
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            SpeakSpace
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150",
                  isActive
                    ? "text-blue-400 bg-blue-950/50"
                    : "text-slate-400 hover:text-white hover:bg-white/5",
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-slate-500")} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Right: avatar + menu */}
        <div className="flex items-center ml-auto gap-3">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="text-sm font-medium text-slate-300">
              {user?.name?.split(" ")[0] || "User"}
            </span>
          </div>
          <UserNav />
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden flex overflow-x-auto border-t border-white/[0.05]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 text-[10px] font-medium transition-colors min-w-[4.5rem] flex-1",
                isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300",
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-blue-400")} />
              {item.name}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
