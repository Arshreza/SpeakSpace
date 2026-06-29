import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Users,
  Video,
  DollarSign,
  CreditCard,
  Bell,
  Plus,
  Database,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import api from '@/utils/api'
import { useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminStats {
  totalUsers: number
  totalInterviews: number
  revenueMTD: number
  activeSubscriptions: number
  userGrowth: { month: string; count: number }[]
  revenueByMonth: { month: string; revenue: number }[]
  interviewTypes: { name: string; value: number }[]
  recentSignups: {
    _id: string
    name: string
    email: string
    role: string
    createdAt: string
    avatar?: string
  }[]
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, change }: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
  change?: string
}) {
  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <span className="text-xs font-medium text-green-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}

// ─── Chart Tooltip ───────────────────────────────────────────────────────────

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b']

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-white/10 rounded-xl p-3 text-sm shadow-xl">
        <p className="text-slate-300 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-semibold text-white">{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

// ─── Send Notification Dialog ─────────────────────────────────────────────────

function SendNotificationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const sendMutation = useMutation({
    mutationFn: async () => {
      await api.post('/admin/notifications/broadcast', { title, message })
    },
    onSuccess: () => {
      toast.success('Notification sent to all users!')
      onClose()
      setTitle('')
      setMessage('')
    },
    onError: () => toast.error('Failed to send notification.'),
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Send Broadcast Notification</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title..."
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message..."
              rows={4}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => sendMutation.mutate()}
            disabled={!title.trim() || !message.trim() || sendMutation.isPending}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
          >
            {sendMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Sending...</> : <><Bell className="w-4 h-4 mr-2" />Send</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [notifDialogOpen, setNotifDialogOpen] = useState(false)

  useEffect(() => {
    document.title = 'Admin Dashboard | SpeakSpace'
  }, [])

  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats')
      return data.data
    },
    staleTime: 60 * 1000,
  })

  const seedCompaniesMutation = useMutation({
    mutationFn: async () => {
      await api.post('/admin/seed/companies')
    },
    onSuccess: () => toast.success('Companies seeded successfully!'),
    onError: () => toast.error('Failed to seed companies.'),
  })

  const createAchievementMutation = useMutation({
    mutationFn: async () => {
      await api.post('/admin/achievements/seed')
    },
    onSuccess: () => toast.success('Default achievements created!'),
    onError: () => toast.error('Failed to create achievements.'),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-32 bg-slate-800/60 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-64 bg-slate-800/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const mockStats = stats ?? {
    totalUsers: 12847,
    totalInterviews: 48293,
    revenueMTD: 24680,
    activeSubscriptions: 3429,
    userGrowth: [
      { month: 'Jan', count: 1200 },
      { month: 'Feb', count: 1850 },
      { month: 'Mar', count: 2400 },
      { month: 'Apr', count: 3100 },
      { month: 'May', count: 4200 },
      { month: 'Jun', count: 5500 },
    ],
    revenueByMonth: [
      { month: 'Jan', revenue: 8400 },
      { month: 'Feb', revenue: 12300 },
      { month: 'Mar', revenue: 15600 },
      { month: 'Apr', revenue: 19200 },
      { month: 'May', revenue: 22800 },
      { month: 'Jun', revenue: 24680 },
    ],
    interviewTypes: [
      { name: 'Technical', value: 35 },
      { name: 'Behavioral', value: 25 },
      { name: 'HR', value: 15 },
      { name: 'Coding', value: 18 },
      { name: 'System Design', value: 7 },
    ],
    recentSignups: [
      { _id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'user', createdAt: new Date().toISOString() },
      { _id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'user', createdAt: new Date().toISOString() },
      { _id: '3', name: 'Carol White', email: 'carol@example.com', role: 'recruiter', createdAt: new Date().toISOString() },
    ],
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Platform overview and management tools.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={mockStats.totalUsers.toLocaleString()} icon={Users} color="bg-indigo-600" change="+12%" />
        <StatCard label="Total Interviews" value={mockStats.totalInterviews.toLocaleString()} icon={Video} color="bg-purple-600" change="+8%" />
        <StatCard label="Revenue MTD" value={`$${mockStats.revenueMTD.toLocaleString()}`} icon={DollarSign} color="bg-green-600" change="+18%" />
        <StatCard label="Active Subscriptions" value={mockStats.activeSubscriptions.toLocaleString()} icon={CreditCard} color="bg-pink-600" change="+5%" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-6">User Growth (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockStats.userGrowth}>
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Users" stroke="#6366f1" fill="url(#userGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-6">Revenue by Month ($)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockStats.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-6">Interview Type Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={mockStats.interviewTypes}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {mockStats.interviewTypes.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
                iconSize={10}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Signups */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Recent Signups</h2>
          <div className="space-y-3">
            {mockStats.recentSignups.slice(0, 10).map((user) => (
              <div key={user._id} className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                    user.role === 'recruiter' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                  <span className="text-xs text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => createAchievementMutation.mutate()}
            disabled={createAchievementMutation.isPending}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 gap-2"
          >
            {createAchievementMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Achievements
          </Button>
          <Button
            variant="outline"
            onClick={() => setNotifDialogOpen(true)}
            className="border-white/10 hover:border-indigo-500/40 gap-2"
          >
            <Bell className="w-4 h-4" /> Send Notification
          </Button>
          <Button
            variant="outline"
            onClick={() => seedCompaniesMutation.mutate()}
            disabled={seedCompaniesMutation.isPending}
            className="border-white/10 hover:border-green-500/40 gap-2"
          >
            {seedCompaniesMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Seed Companies
          </Button>
        </div>
      </div>

      <SendNotificationDialog open={notifDialogOpen} onClose={() => setNotifDialogOpen(false)} />
    </div>
  )
}
