import { create } from 'zustand'
import { Notification } from '@/types'

type Theme = 'dark' | 'light'

const THEME_KEY = 'speakspace-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(THEME_KEY) as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  // Fall back to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }
  localStorage.setItem(THEME_KEY, theme)
}

interface UIState {
  theme: Theme
  sidebarOpen: boolean
  notifications: Notification[]
  commandOpen: boolean
}

interface UIActions {
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  setCommandOpen: (open: boolean) => void
}

type UIStore = UIState & UIActions

const initialTheme = getInitialTheme()
// Apply theme to DOM immediately on store creation
if (typeof window !== 'undefined') {
  applyTheme(initialTheme)
}

const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  theme: initialTheme,
  sidebarOpen: false,
  notifications: [],
  commandOpen: false,

  // Actions
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    set({ theme: next })
  },

  setTheme: (theme: Theme) => {
    applyTheme(theme)
    set({ theme })
  },

  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  addNotification: (notification: Notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n._id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),

  setCommandOpen: (open: boolean) => set({ commandOpen: open }),
}))

export { useUIStore }
export const useUiStore = useUIStore
export default useUIStore
