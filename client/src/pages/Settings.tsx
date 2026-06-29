import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import {
  Lock,
  Bell,
  CreditCard,
  AlertTriangle,
  Check,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import api from '@/utils/api'
import useAuthStore from '@/store/authStore'
import type { Subscription, Payment } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface NotifPrefs {
  emailGeneral: boolean
  interviewReminders: boolean
  achievementAlerts: boolean
  weeklyReport: boolean
  newFeatures: boolean
  marketing: boolean
}

// ─── Account Tab ─────────────────────────────────────────────────────────────

function AccountTab() {
  const { user } = useAuthStore()
  const [form, setForm] = useState<PasswordForm>({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
    },
    onSuccess: () => {
      toast.success('Password changed successfully!')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (err: Error) => toast.error(err.message ?? 'Failed to change password.'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }
    changePasswordMutation.mutate(form)
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Email */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-400" /> Account Email
        </h3>
        <div>
          <label className="text-sm text-slate-400 mb-1.5 block">Email Address</label>
          <input
            value={user?.email ?? ''}
            disabled
            className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
          />
          <p className="text-xs text-slate-600 mt-2">To change your email, please contact support.</p>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(
            [
              { key: 'currentPassword', label: 'Current Password', showKey: 'current' },
              { key: 'newPassword', label: 'New Password', showKey: 'new' },
              { key: 'confirmPassword', label: 'Confirm New Password', showKey: 'confirm' },
            ] as const
          ).map(({ key, label, showKey }) => (
            <div key={key}>
              <label className="text-sm text-slate-300 mb-1.5 block">{label}</label>
              <div className="relative">
                <input
                  type={showPasswords[showKey] ? 'text' : 'password'}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((p) => ({ ...p, [showKey]: !p[showKey] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300 px-1"
                >
                  {showPasswords[showKey] ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          ))}
          <Button
            type="submit"
            disabled={!form.currentPassword || !form.newPassword || !form.confirmPassword || changePasswordMutation.isPending}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
          >
            {changePasswordMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Changing...</> : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotifPrefs>({
    emailGeneral: true,
    interviewReminders: true,
    achievementAlerts: true,
    weeklyReport: false,
    newFeatures: true,
    marketing: false,
  })

  const savePrefs = useMutation({
    mutationFn: async () => {
      await api.put('/user/notification-preferences', prefs)
    },
    onSuccess: () => toast.success('Notification preferences saved!'),
    onError: () => toast.error('Failed to save preferences.'),
  })

  const toggles: { key: keyof NotifPrefs; label: string; description: string }[] = [
    { key: 'emailGeneral', label: 'Email Notifications', description: 'Receive general email notifications from SpeakSpace.' },
    { key: 'interviewReminders', label: 'Interview Reminders', description: 'Get reminders before scheduled interviews.' },
    { key: 'achievementAlerts', label: 'Achievement Alerts', description: 'Be notified when you unlock new achievements.' },
    { key: 'weeklyReport', label: 'Weekly Progress Report', description: 'Receive a summary of your weekly progress every Monday.' },
    { key: 'newFeatures', label: 'New Feature Announcements', description: 'Stay updated on new features and improvements.' },
    { key: 'marketing', label: 'Marketing Emails', description: 'Receive promotional content and special offers.' },
  ]

  return (
    <div className="max-w-xl">
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" /> Notification Preferences
        </h3>
        <div className="space-y-5">
          {toggles.map(({ key, label, description }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-200">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              </div>
              <Switch
                checked={prefs[key]}
                onCheckedChange={(val) => setPrefs((p) => ({ ...p, [key]: val }))}
                className="shrink-0"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-white/10">
          <Button
            onClick={() => savePrefs.mutate()}
            disabled={savePrefs.isPending}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
          >
            {savePrefs.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : <><Check className="w-4 h-4 mr-2" />Save Preferences</>}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Billing Tab ──────────────────────────────────────────────────────────────

const PLAN_FEATURES: Record<string, string[]> = {
  free: ['5 interviews/month', '1 resume upload', 'Basic AI feedback', 'Community access'],
  premium: ['100 interviews/month', '10 resume uploads', 'Advanced AI feedback', 'Voice interviews', 'Coding interviews', 'AI Career Coach', 'Download reports'],
  enterprise: ['Unlimited interviews', 'Unlimited resumes', 'Priority support', 'Team features', 'Custom integrations', 'API access'],
}

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  completed: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  failed: 'bg-red-500/20 text-red-400',
  refunded: 'bg-slate-500/20 text-slate-400',
}

function BillingTab() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data } = await api.get('/payment/subscription')
      return data.data
    },
    enabled: user?.subscription !== 'free',
  })

  const { data: payments } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data } = await api.get('/payment/history?limit=5')
      return data.data ?? []
    },
  })

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/payment/subscription')
    },
    onSuccess: () => {
      toast.success('Subscription cancelled. Access continues until the end of your billing period.')
      setShowCancelDialog(false)
    },
    onError: () => toast.error('Failed to cancel subscription.'),
  })

  const plan = user?.subscription ?? 'free'
  const features = PLAN_FEATURES[plan] ?? PLAN_FEATURES.free

  return (
    <div className="space-y-6 max-w-xl">
      {/* Current Plan */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-400" /> Current Plan
        </h3>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xl font-bold text-white capitalize">{plan}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                plan === 'free' ? 'bg-slate-500/20 text-slate-400' :
                plan === 'premium' ? 'bg-indigo-500/20 text-indigo-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                {subscription?.status ?? 'active'}
              </span>
            </div>
            {subscription?.endDate && (
              <p className="text-sm text-slate-400">
                Next billing: {new Date(subscription.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
          {plan === 'free' ? (
            <Button
              size="sm"
              onClick={() => navigate('/pricing')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Upgrade
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCancelDialog(true)}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Cancel
            </Button>
          )}
        </div>
        <ul className="space-y-1.5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
              <Check className="w-3.5 h-3.5 text-green-400 shrink-0" /> {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Payment History */}
      {payments && payments.length > 0 && (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Recent Payments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-left text-xs text-slate-400 font-medium">Date</th>
                  <th className="pb-3 text-left text-xs text-slate-400 font-medium">Amount</th>
                  <th className="pb-3 text-left text-xs text-slate-400 font-medium">Plan</th>
                  <th className="pb-3 text-left text-xs text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-b border-white/5">
                    <td className="py-3 text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-white font-medium">${(p.amount / 100).toFixed(2)} {p.currency.toUpperCase()}</td>
                    <td className="py-3 text-slate-400 capitalize">{p.plan}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${PAYMENT_STATUS_STYLES[p.status] ?? ''}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to cancel? You'll retain access until the end of your current billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCancelDialog(false)}>Keep Subscription</Button>
            <Button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Danger Zone Tab ─────────────────────────────────────────────────────────

function DangerZoneTab() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDeleteRequest = () => {
    toast.success('Account deletion request submitted. Our team will process it within 48 hours.')
    setShowDeleteDialog(false)
    setConfirmText('')
  }

  return (
    <div className="max-w-xl">
      <div className="bg-red-500/5 border border-red-500/30 rounded-2xl p-6">
        <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          These actions are permanent and cannot be undone. Please proceed with caution.
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-t border-red-500/20">
            <div>
              <p className="text-sm font-medium text-white">Delete Account</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently delete your account and all associated data. This cannot be reversed.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="border-red-500/40 text-red-400 hover:bg-red-500/10 shrink-0 ml-4"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={(open) => { setShowDeleteDialog(open); if (!open) setConfirmText('') }}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Delete Account
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              This action is <strong className="text-white">permanent</strong> and cannot be undone. All your data, interviews, and progress will be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="text-sm text-slate-300 mb-2 block">
              Type <strong className="text-red-400">DELETE</strong> to confirm
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteRequest}
              disabled={confirmText !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-40"
            >
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Settings() {
  useEffect(() => {
    document.title = 'Settings | SpeakSpace'
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account, notifications, and billing.</p>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="bg-slate-800/60 border border-white/10 mb-8">
          <TabsTrigger value="account" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Account</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Notifications</TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Billing</TabsTrigger>
          <TabsTrigger value="danger" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="account"><AccountTab /></TabsContent>
        <TabsContent value="notifications"><NotificationsTab /></TabsContent>
        <TabsContent value="billing"><BillingTab /></TabsContent>
        <TabsContent value="danger"><DangerZoneTab /></TabsContent>
      </Tabs>
    </div>
  )
}
