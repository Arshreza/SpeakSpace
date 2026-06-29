import { cn } from "@/utils/cn"
import {
  FileText,
  Star,
  StarOff,
  Trash2,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react"

interface ResumeCardProps {
  resume: {
    _id: string
    originalName: string
    overallScore?: number
    atsScore?: number
    analysisStatus: string
    isDefault: boolean
    createdAt: string
  }
  onSetDefault: (id: string) => void
  onDelete: (id: string) => void
  onReanalyze: (id: string) => void
  onView: (id: string) => void
}

const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; cls: string }> = {
  uploaded: { icon: Clock, label: "Pending", cls: "bg-slate-500/15 text-slate-400 border-slate-500/20" },
  analyzing: { icon: Loader2, label: "Analyzing...", cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  analyzed: { icon: CheckCircle, label: "Analyzed", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  failed: { icon: AlertCircle, label: "Failed", cls: "bg-red-500/15 text-red-400 border-red-500/20" },
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-400"
  if (score >= 60) return "text-amber-400"
  return "text-red-400"
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function ResumeCard({ resume, onSetDefault, onDelete, onReanalyze, onView }: ResumeCardProps) {
  const status = statusConfig[resume.analysisStatus] ?? statusConfig.uploaded
  const StatusIcon = status.icon
  const isAnalyzing = resume.analysisStatus === "analyzing"
  const isAnalyzed = resume.analysisStatus === "analyzed"

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-sm p-5 transition-all hover:border-white/20">
      {/* Default badge */}
      {resume.isDefault && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-2.5 h-2.5" />
            Default
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* File icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-indigo-400" />
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0 pr-16">
          <p className="text-sm font-semibold text-white truncate" title={resume.originalName}>
            {resume.originalName}
          </p>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(resume.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Status + Scores */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border", status.cls)}>
          <StatusIcon className={cn("w-3 h-3", isAnalyzing && "animate-spin")} />
          {status.label}
        </span>

        {isAnalyzed && typeof resume.overallScore === "number" && (
          <span className={cn("text-xs font-bold", scoreColor(resume.overallScore))}>
            Score: {resume.overallScore}%
          </span>
        )}

        {isAnalyzed && typeof resume.atsScore === "number" && (
          <span className={cn("text-xs font-medium text-slate-400")}>
            ATS: <span className={scoreColor(resume.atsScore)}>{resume.atsScore}%</span>
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 flex-wrap">
        <button
          onClick={() => onView(resume._id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <Eye className="w-3 h-3" />
          View
        </button>

        {!resume.isDefault && (
          <button
            onClick={() => onSetDefault(resume._id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <Star className="w-3 h-3" />
            Set Default
          </button>
        )}

        <button
          onClick={() => onReanalyze(resume._id)}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={cn("w-3 h-3", isAnalyzing && "animate-spin")} />
          Re-analyze
        </button>

        <button
          onClick={() => onDelete(resume._id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors ml-auto"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </div>
  )
}
