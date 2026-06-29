import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/utils/api"

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Must contain uppercase").regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string()
}).refine(d => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] })

type FormData = z.infer<typeof schema>

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await api.put(`/auth/reset-password/${token}`, { password: data.password })
      setSuccess(true)
      toast.success("Password reset successfully!")
      setTimeout(() => navigate("/login"), 3000)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Reset link is invalid or expired")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-white font-bold text-lg">SpeckSpace</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8">
          {!success ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 mx-auto">
                <Lock className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-white text-center mb-2">Set new password</h1>
              <p className="text-slate-400 text-center text-sm mb-8">Choose a strong password for your account.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label className="text-slate-300 text-sm">New Password</Label>
                  <div className="relative mt-1.5">
                    <Input type={showPassword ? "text" : "password"} {...register("password")} placeholder="Min. 8 characters" className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Confirm Password</Label>
                  <div className="relative mt-1.5">
                    <Input type={showConfirm ? "text" : "password"} {...register("confirmPassword")} placeholder="Repeat password" className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 pr-10" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 py-2.5">
                  {isLoading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</span> : "Reset Password"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-slate-400 text-sm">Your password has been updated. Redirecting you to login...</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Back to Login</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
