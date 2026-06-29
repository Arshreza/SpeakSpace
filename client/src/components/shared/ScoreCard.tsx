import { useEffect, useRef, useState } from "react"
import { cn } from "@/utils/cn"

interface ScoreCardProps {
  score: number
  label: string
  color?: string
  size?: "sm" | "md" | "lg"
}

const sizeConfig = {
  sm: { r: 30, sz: 80, fontSize: 14, strokeWidth: 5 },
  md: { r: 45, sz: 110, fontSize: 20, strokeWidth: 6 },
  lg: { r: 60, sz: 140, fontSize: 26, strokeWidth: 7 },
}

export function ScoreCard({ score, label, color = "#6366f1", size = "md" }: ScoreCardProps) {
  const { r, sz, fontSize, strokeWidth } = sizeConfig[size]
  const circumference = 2 * Math.PI * r
  const clampedScore = Math.min(100, Math.max(0, score))

  const [displayScore, setDisplayScore] = useState(0)
  const animRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const duration = 900

  useEffect(() => {
    startTimeRef.current = null
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(eased * clampedScore))
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      }
    }
    animRef.current = requestAnimationFrame(animate)
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current)
    }
  }, [clampedScore])

  const offset = circumference * (1 - displayScore / 100)
  const cx = sz / 2
  const cy = sz / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: sz, height: sz }}>
        <svg
          width={sz}
          height={sz}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-bold text-white"
          style={{ fontSize }}
        >
          {displayScore}
        </div>
      </div>
      <span className="text-xs text-slate-400 text-center font-medium">{label}</span>
    </div>
  )
}
