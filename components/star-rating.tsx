"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  max?: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StarRating({
  value,
  max = 10,
  onChange,
  readOnly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const displayMax = Math.ceil(max / 2) // Render 5 stars if max is 10

  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverValue(index * 2) // Each star = 2 value
    }
  }

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(null)
    }
  }

  const handleClick = (index: number) => {
    if (!readOnly && onChange) {
      onChange(index * 2) // Each star = 2 value
    }
  }

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <div
      className={cn("flex items-center", className)}
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(displayMax)].map((_, index) => {
        const starIndex = index + 1
        const starValue = starIndex * 2
        const isFilled =
          hoverValue !== null ? starValue <= hoverValue : starValue <= value

        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              "cursor-pointer transition-colors",
              isFilled ? "text-amber-400 fill-amber-400" : "text-slate-600",
              !readOnly && "hover:text-amber-400"
            )}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onClick={() => handleClick(starIndex)}
          />
        )
      })}

      {!readOnly && (
        <span className="ml-2 text-sm text-slate-500">
          {(hoverValue !== null ? hoverValue : value) / 2}/{max / 2}
        </span>
      )}
    </div>
  )
}
