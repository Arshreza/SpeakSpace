import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/utils/api"

const schema = z.object({ email: z.string().email("Please enter a valid email") })
type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState("")

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await api.post("/auth/forgot-password", { email: data.email })
      setSentEmail(data.email)
      setSent(true)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-white font-bold text-lg">SpeckSpace</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8">
          {!sent ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 mx-auto">
                <Mail className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-white text-center mb-2">Forgot your password?</h1>
              <p className="text-slate-400 text-center text-sm mb-8">
                No worries! Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-slate-300 text-sm">Email address</Label>
                  <Input id="email" type="email" {...register("email")} placeholder="john@example.com" className="mt-1.5 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50" />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 py-2.5">
                  {isLoading ? (
                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</span>
                  ) : "Send Reset Link"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm mb-2">
                We sent a password reset link to
              </p>
              <p className="text-indigo-400 font-medium mb-6">{sentEmail}</p>
              <p className="text-slate-500 text-xs mb-6">
                Didn't receive it? Check your spam folder, or{" "}
                <button onClick={() => setSent(false)} className="text-indigo-400 hover:underline">try again</button>.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link to="/login" className="flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
