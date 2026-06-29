import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Floating Particle ───────────────────────────────────────────────────────

interface ParticleProps {
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

function Particle({ x, y, size, delay, duration }: ParticleProps) {
  return (
    <motion.div
      className="absolute rounded-full bg-indigo-500/40 blur-sm"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
      }}
      animate={{
        y: [0, -30, 0, 20, 0],
        x: [0, 15, -10, 5, 0],
        opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
        scale: [1, 1.2, 0.9, 1.1, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

const PARTICLES: ParticleProps[] = [
  { x: 10, y: 20, size: 12, delay: 0, duration: 6 },
  { x: 85, y: 15, size: 8, delay: 1, duration: 7 },
  { x: 70, y: 75, size: 14, delay: 0.5, duration: 5 },
  { x: 20, y: 70, size: 10, delay: 2, duration: 8 },
  { x: 50, y: 85, size: 6, delay: 1.5, duration: 6.5 },
  { x: 90, y: 55, size: 16, delay: 0.8, duration: 7.5 },
]

// ─── Main Component ──────────────────────────────────────────────────────────

export default function NotFound() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = '404 – Page Not Found | SpeakSpace'
  }, [])

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Particles */}
      {PARTICLES.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* 404 Text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-[160px] sm:text-[200px] font-black leading-none bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none"
        >
          404
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl sm:text-3xl font-bold text-white mb-3"
        >
          Oops! Page Not Found
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-slate-400 text-base max-w-sm mb-10"
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center gap-4"
        >
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white gap-2 h-11 px-6"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-white/10 text-slate-300 hover:bg-white/5 gap-2 h-11 px-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex items-center gap-2.5 mt-16 opacity-40"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-400">SpeakSpace</span>
        </motion.div>
      </div>
    </div>
  )
}
