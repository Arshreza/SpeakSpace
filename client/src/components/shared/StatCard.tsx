import { cn } from "@/utils/cn"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  trend?: string
  trendUp?: boolean
  color: string
  iconColor?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  color,
  iconColor = "text-indigo-400",
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-sm p-5 flex items-start gap-4">
      <div className={cn("flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center", color)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider truncate">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5 leading-none">{value}</p>
        {trend && (
          <div className={cn("flex items-center gap-1 mt-1.5 text-xs font-medium", trendUp ? "text-emerald-400" : "text-red-400")}>
            {trendUp ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  )
}
