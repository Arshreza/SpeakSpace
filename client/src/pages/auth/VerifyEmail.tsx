import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/utils/api"

type Status = "loading" | "success" | "error"

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Invalid verification link."); return }
    const verify = async () => {
      try {
        await api.get(`/auth/verify-email/${token}`)
        setStatus("success")
        setMessage("Your email has been verified successfully!")
        setTimeout(() => navigate("/login"), 4000)
      } catch (err: any) {
        setStatus("error")
        setMessage(err.response?.data?.message || "Verification link is invalid or has expired.")
      }
    }
    verify()
  }, [token])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-white font-bold text-lg">SpeckSpace</span>
          </div>

          {status === "loading" && (
            <>
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Verifying your email...</h2>
              <p className="text-slate-400 text-sm">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-slate-400 text-sm mb-6">{message}</p>
              <p className="text-slate-500 text-xs">Redirecting to login in a few seconds...</p>
              <Button onClick={() => navigate("/login")} className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white border-0">Go to Login</Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-slate-400 text-sm mb-6">{message}</p>
              <div className="flex gap-3 justify-center">
                <Link to="/login">
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">Back to Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-0">Register Again</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
