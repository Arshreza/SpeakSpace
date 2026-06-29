import { cn } from "@/utils/cn"
import { ProgressRing } from "@/components/shared/ProgressRing"
import {
  Mic,
  Brain,
  Code,
  Layers,
  Users,
  MessageSquare,
  Calendar,
  ChevronRight,
  Play,
} from "lucide-react"

interface InterviewCardProps {
  interview: {
    _id: string
    type: string
    role: string
    difficulty: string
    status: string
    overallScore?: number
    createdAt: string
    completedAt?: string
  }
  onViewReport?: (id: string) => void
  onContinue?: (id: string) => void
}

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  hr: { icon: Users, label: "HR", color: "text-violet-400" },
  behavioral: { icon: MessageSquare, label: "Behavioral", color: "text-blue-400" },
  technical: { icon: Brain, label: "Technical", color: "text-cyan-400" },
  coding: { icon: Code, label: "Coding", color: "text-emerald-400" },
  system_design: { icon: Layers, label: "System Design", color: "text-orange-400" },
  custom: { icon: Mic, label: "Custom", color: "text-pink-400" },
}

const difficultyConfig: Record<string, { label: string; cls: string }> = {
  easy: { label: "Easy", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  medium: { label: "Medium", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  hard: { label: "Hard", cls: "bg-red-500/15 text-red-400 border-red-500/20" },
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  completed: { label: "Completed", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  in_progress: { label: "In Progress", cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  pending: { label: "Pending", cls: "bg-slate-500/15 text-slate-400 border-slate-500/20" },
  cancelled: { label: "Cancelled", cls: "bg-red-500/15 text-red-400 border-red-500/20" },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function InterviewCard({ interview, onViewReport, onContinue }: InterviewCardProps) {
  const type = typeConfig[interview.type] ?? typeConfig.custom
  const TypeIcon = type.icon
  const difficulty = difficultyConfig[interview.difficulty] ?? difficultyConfig.medium
  const status = statusConfig[interview.status] ?? statusConfig.pending

  const isCompleted = interview.status === "completed"
  const isActive = interview.status === "in_progress"

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-sm p-5 transition-all hover:border-white/20 hover:bg-slate-800/60">
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon + Info */}
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn("flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center")}>
            <TypeIcon className={cn("w-5 h-5", type.color)} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{interview.role}</p>
            <p className={cn("text-xs font-medium mt-0.5", type.color)}>{type.label}</p>
          </div>
        </div>

        {/* Right: Score ring (completed only) */}
        {isCompleted && typeof interview.overallScore === "number" && (
          <ProgressRing
            value={interview.overallScore}
            size={52}
            strokeWidth={4}
            color={interview.overallScore >= 70 ? "#22c55e" : interview.overallScore >= 50 ? "#f59e0b" : "#ef4444"}
          />
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border", difficulty.cls)}>
          {difficulty.label}
        </span>
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border", status.cls)}>
          {status.label}
        </span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
        <Calendar className="w-3 h-3" />
        <span>{isCompleted && interview.completedAt ? formatDate(interview.completedAt) : formatDate(interview.createdAt)}</span>
      </div>

      {/* Action buttons */}
      {(isCompleted || isActive) && (
        <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
          {isCompleted && onViewReport && (
            <button
              onClick={() => onViewReport(interview._id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/25 transition-colors"
            >
              View Report
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
          {isActive && onContinue && (
            <button
              onClick={() => onContinue(interview._id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:bg-blue-500/25 transition-colors"
            >
              <Play className="w-3 h-3" />
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  )
}
