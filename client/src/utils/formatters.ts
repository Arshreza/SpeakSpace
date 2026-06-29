import { format, formatDistanceToNow } from 'date-fns'

/**
 * Format a date string or Date object using date-fns format.
 * @param date - The date to format
 * @param formatStr - The format string (default: 'MMM dd, yyyy')
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, formatStr)
}

/**
 * Format a date as relative time (e.g., "3 days ago").
 * @param date - The date to format
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

/**
 * Format a duration in seconds to a human-readable string.
 * Returns "Xh Ym" if >= 3600 seconds, otherwise "Xm Ys".
 * @param seconds - Duration in seconds
 */
export function formatDuration(seconds: number): string {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}m ${secs}s`
}

/**
 * Format a score number as a percentage string with one decimal place.
 * @param score - The score value (0–100)
 */
export function formatScore(score: number): string {
  return `${score.toFixed(1)}%`
}

/**
 * Return a Tailwind CSS text color class based on score value.
 * <40 → red, <60 → orange, <75 → yellow, <90 → blue, else green
 * @param score - The score value (0–100)
 */
export function getScoreColor(score: number): string {
  if (score < 40) return 'text-red-500'
  if (score < 60) return 'text-orange-500'
  if (score < 75) return 'text-yellow-500'
  if (score < 90) return 'text-blue-500'
  return 'text-green-500'
}

/**
 * Return a human-readable label for a score.
 * <40 → Needs Improvement, <60 → Fair, <75 → Good, <90 → Very Good, else Excellent
 * @param score - The score value (0–100)
 */
export function getScoreLabel(score: number): string {
  if (score < 40) return 'Needs Improvement'
  if (score < 60) return 'Fair'
  if (score < 75) return 'Good'
  if (score < 90) return 'Very Good'
  return 'Excellent'
}

/**
 * Capitalize the first character of a string.
 * @param str - The input string
 */
export function capitalizeFirst(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Truncate a string to a maximum length, appending '...' if truncated.
 * @param str - The input string
 * @param length - Maximum allowed length before truncation
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Format a file size in bytes to a human-readable string (B, KB, MB, GB).
 * @param bytes - File size in bytes
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
