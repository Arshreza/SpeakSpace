import { cn } from "@/utils/cn"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Star } from "lucide-react"

interface AchievementBadgeProps {
  achievement: {
    name: string
    description: string
    icon: string
    category: string
    xpReward: number
    earnedAt?: string
  }
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: {
    card: "p-3 gap-2",
    emoji: "w-9 h-9 text-lg",
    name: "text-xs font-semibold",
    meta: "text-[10px]",
  },
  md: {
    card: "p-4 gap-3",
    emoji: "w-12 h-12 text-2xl",
    name: "text-sm font-semibold",
    meta: "text-xs",
  },
  lg: {
    card: "p-5 gap-4",
    emoji: "w-16 h-16 text-3xl",
    name: "text-base font-semibold",
    meta: "text-sm",
  },
}

export function AchievementBadge({ achievement, size = "md" }: AchievementBadgeProps) {
  const s = sizeClasses[size]

  const formattedDate = achievement.earnedAt
    ? new Date(achievement.earnedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex flex-col items-center rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-sm cursor-default select-none transition-all hover:border-indigo-500/30 hover:bg-slate-800/60",
              s.card
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                "flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/10",
                s.emoji
              )}
            >
              <span role="img" aria-label={achievement.name}>
                {achievement.icon}
              </span>
            </div>

            {/* Name */}
            <p className={cn("text-white text-center leading-tight mt-1", s.name)}>
              {achievement.name}
            </p>

            {/* Category chip */}
            <span
              className={cn(
                "px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 capitalize",
                s.meta
              )}
            >
              {achievement.category}
            </span>

            {/* XP reward */}
            <div className={cn("flex items-center gap-1 text-amber-400 font-medium", s.meta)}>
              <Star className="w-3 h-3 fill-amber-400" />
              <span>+{achievement.xpReward} XP</span>
            </div>

            {/* Earned date */}
            {formattedDate && (
              <p className={cn("text-slate-500", s.meta)}>{formattedDate}</p>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[220px] bg-slate-800 border-white/10 text-slate-200 text-xs p-3"
        >
          <p className="font-semibold text-white mb-1">{achievement.name}</p>
          <p className="leading-relaxed">{achievement.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
