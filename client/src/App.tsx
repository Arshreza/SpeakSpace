import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import RootLayout from '@/layouts/RootLayout'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { Toaster } from '@/components/ui/toaster'
import { useAuthStore } from '@/store/authStore'

// Lazy load all pages
const Landing = lazy(() => import('@/pages/Landing'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'))
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Profile = lazy(() => import('@/pages/Profile'))
const Resume = lazy(() => import('@/pages/Resume'))
const Interview = lazy(() => import('@/pages/Interview'))
const InterviewSession = lazy(() => import('@/pages/InterviewSession'))
const InterviewReport = lazy(() => import('@/pages/InterviewReport'))
const CodingInterview = lazy(() => import('@/pages/CodingInterview'))
const AICoach = lazy(() => import('@/pages/AICoach'))
const Companies = lazy(() => import('@/pages/Companies'))
const Leaderboard = lazy(() => import('@/pages/Leaderboard'))
const Learning = lazy(() => import('@/pages/Learning'))
const Pricing = lazy(() => import('@/pages/Pricing'))
const Settings = lazy(() => import('@/pages/Settings'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminCompanies = lazy(() => import('@/pages/admin/AdminCompanies'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} replace />
  }
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  if (isLoading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <>
      <Toaster />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<RootLayout />}>
            {/* Public landing */}
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Register has its own full-page layout */}
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* Auth routes with shared AuthLayout */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
              <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
            </Route>

            {/* Dashboard routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/resume" element={<ProtectedRoute><Resume /></ProtectedRoute>} />
              <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
              <Route path="/interview/:id/session" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
              <Route path="/interview/:id/report" element={<ProtectedRoute><InterviewReport /></ProtectedRoute>} />
              <Route path="/coding" element={<ProtectedRoute><CodingInterview /></ProtectedRoute>} />
              <Route path="/coach" element={<ProtectedRoute><AICoach /></ProtectedRoute>} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:slug" element={<Companies />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/learning" element={<Learning />} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/companies" element={<AdminRoute><AdminCompanies /></AdminRoute>} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
