import { useState, useEffect, useCallback } from "react"

function readFromStorage<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") return initialValue
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return initialValue
    return JSON.parse(raw) as T
  } catch {
    return initialValue
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readFromStorage(key, initialValue)
  )

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(next))
          }
          return next
        })
      } catch (error) {
        console.warn(`useLocalStorage: failed to set key "${key}"`, error)
      }
    },
    [key]
  )

  // Sync across tabs
  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T)
        } catch {
          // ignore parse errors
        }
      }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [key])

  return [storedValue, setValue]
}
