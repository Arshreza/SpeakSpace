import { useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Mic,
  FileText,
  Code2,
  Bot,
  Building2,
  Trophy,
  BookOpen,
  User,
  Settings,
  Users,
  BarChart2,
  Building,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import useAuthStore from '@/store/authStore'
import useUiStore from '@/store/uiStore'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface NavItem {
  label: string
  to: string
  icon: React.ElementType
}

const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Mock Interview', to: '/interview', icon: Mic },
  { label: 'Resume Analyzer', to: '/resume', icon: FileText },
  { label: 'Coding', to: '/coding', icon: Code2 },
  { label: 'AI Coach', to: '/ai-coach', icon: Bot },
  { label: 'Companies', to: '/companies', icon: Building2 },
  { label: 'Leaderboard', to: '/leaderboard', icon: Trophy },
  { label: 'Learning', to: '/learning', icon: BookOpen },
]

const ACCOUNT_NAV: NavItem[] = [
  { label: 'Profile', to: '/profile', icon: User },
  { label: 'Settings', to: '/settings', icon: Settings },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart2 },
  { label: 'Manage Companies', to: '/admin/companies', icon: Building },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const PLAN_BADGE_STYLES: Record<string, string> = {
  free: 'bg-gray-500/20 text-gray-400',
  premium: 'bg-indigo-500/20 text-indigo-400',
  enterprise: 'bg-purple-500/20 text-purple-400',
}

interface SidebarNavItemProps {
  item: NavItem
  isExpanded: boolean
  isActive: boolean
}

function SidebarNavItem({ item, isExpanded, isActive }: SidebarNavItemProps) {
  const Icon = item.icon

  return (
    <Link
      to={item.to}
      title={!isExpanded ? item.label : undefined}
      className={cn(
        'group relative flex items-center rounded-lg transition-all duration-150 overflow-hidden',
        isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5',
        isActive
          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-gradient-to-b from-indigo-400 to-purple-400" />
      )}
      <Icon
        className={cn(
          'w-5 h-5 shrink-0',
          isActive ? 'text-indigo-400' : 'text-current'
        )}
      />
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.span
            key="label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed state */}
      {!isExpanded && (
        <span className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:flex items-center px-2 py-1 rounded-md bg-popover border border-border text-xs font-medium text-foreground shadow-lg whitespace-nowrap">
          {item.label}
        </span>
      )}
    </Link>
  )
}

interface NavSectionProps {
  title: string
  items: NavItem[]
  isExpanded: boolean
  currentPath: string
}

function NavSection({ title, items, isExpanded, currentPath }: NavSectionProps) {
  return (
    <div className="space-y-1">
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.p
            key="section-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60"
          >
            {title}
          </motion.p>
        )}
      </AnimatePresence>
      {items.map((item) => (
        <SidebarNavItem
          key={item.to}
          item={item}
          isExpanded={isExpanded}
          isActive={currentPath === item.to || currentPath.startsWith(item.to + '/')}
        />
      ))}
    </div>
  )
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUiStore()
  const { user } = useAuthStore()
  const location = useLocation()
  const isExpanded = sidebarOpen

  return (
    <motion.aside
      animate={{ width: isExpanded ? 256 : 64 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 h-full flex flex-col bg-card border-r border-border overflow-hidden"
    >
      {/* Header */}
      <div className={cn('flex items-center h-16 shrink-0 border-b border-border', isExpanded ? 'px-4 justify-between' : 'justify-center px-0')}>
        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shrink-0">
                <Brain className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
                SpeckSpace
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="logo-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md"
            >
              <Brain className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {isExpanded && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/10 transition-colors text-muted-foreground"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapse toggle when closed */}
      {!isExpanded && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="mx-auto mt-2 flex items-center justify-center w-9 h-9 rounded-md hover:bg-white/10 transition-colors text-muted-foreground shrink-0"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className={cn('flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-6', isExpanded ? 'px-3' : 'px-2')}>
        <NavSection
          title="Main"
          items={MAIN_NAV}
          isExpanded={isExpanded}
          currentPath={location.pathname}
        />

        <NavSection
          title="Account"
          items={ACCOUNT_NAV}
          isExpanded={isExpanded}
          currentPath={location.pathname}
        />

        {user?.role === 'admin' && (
          <NavSection
            title="Admin"
            items={ADMIN_NAV}
            isExpanded={isExpanded}
            currentPath={location.pathname}
          />
        )}
      </nav>

      {/* Bottom user info */}
      {user && (
        <div className={cn('shrink-0 border-t border-border py-3', isExpanded ? 'px-3' : 'px-2')}>
          <div className={cn('flex items-center rounded-lg p-2', isExpanded ? 'gap-3' : 'justify-center')}>
            <Avatar className="w-8 h-8 shrink-0">
              {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm font-medium text-foreground whitespace-nowrap truncate max-w-[140px]">
                    {user.name}
                  </p>
                  <span
                    className={cn(
                      'inline-block text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize',
                      PLAN_BADGE_STYLES[user.subscription] ?? PLAN_BADGE_STYLES.free
                    )}
                  >
                    {user.subscription}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.aside>
  )
}
