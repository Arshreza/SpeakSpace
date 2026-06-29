import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { useUiStore } from '@/store/uiStore'
import { useEffect } from 'react'
import { SocketProvider } from '@/contexts/SocketContext'

export default function RootLayout() {
  const { theme } = useUiStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
  }, [theme])

  return (
    <SocketProvider>
      <div className="min-h-screen bg-slate-950 text-white">
        <Outlet />
        <Toaster />
      </div>
    </SocketProvider>
  )
}
