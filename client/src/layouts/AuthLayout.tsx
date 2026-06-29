import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function BrainIcon() {
  return (
    <svg
      className="w-8 h-8 text-indigo-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  )
}

const features = [
  {
    title: 'AI-Powered Feedback',
    description: 'Get instant, detailed feedback on your answers from advanced AI models.',
  },
  {
    title: 'Real Interview Questions',
    description: 'Practice with questions sourced from top companies and updated regularly.',
  },
  {
    title: 'Track Progress',
    description: 'Monitor your improvement with detailed analytics and performance reports.',
  },
]

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Left panel — hidden on mobile */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-16 overflow-hidden"
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Abstract geometric decorations */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Large outer ring */}
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full border border-indigo-700/20" />
          {/* Medium ring */}
          <div className="absolute -top-16 -left-16 w-[320px] h-[320px] rounded-full border border-purple-600/15" />
          {/* Small inner circle */}
          <div className="absolute top-0 left-0 w-[160px] h-[160px] rounded-full bg-indigo-900/10" />

          {/* Bottom right decorations */}
          <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full border border-purple-700/20" />
          <div className="absolute -bottom-8 -right-8 w-[240px] h-[240px] rounded-full border border-indigo-600/15" />
          <div className="absolute bottom-12 right-12 w-[100px] h-[100px] rounded-full bg-purple-900/10" />

          {/* Center accent dots */}
          <div className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full bg-indigo-500/40" />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-purple-400/30" />
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full bg-indigo-600/25" />
          <div className="absolute top-2/3 right-1/3 w-1 h-1 rounded-full bg-purple-500/35" />

          {/* Gradient blobs */}
          <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-indigo-800/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full bg-purple-800/10 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <BrainIcon />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">SpeckSpace</span>
          </div>

          {/* Tagline */}
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Practice.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Improve.
            </span>{' '}
            Get Hired.
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-slate-400 mb-12 leading-relaxed max-w-sm">
            The AI-powered interview preparation platform that helps you land your dream job with
            confidence.
          </p>

          {/* Feature bullets */}
          <ul className="space-y-5">
            {features.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3">
                <CheckIcon />
                <div>
                  <p className="text-white font-semibold text-sm">{feature.title}</p>
                  <p className="text-slate-400 text-sm mt-0.5">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Right panel — auth form */}
      <motion.div
        className="flex flex-1 items-center justify-center px-4 sm:px-8 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Mobile logo (visible only on small screens) */}
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <BrainIcon />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SpeckSpace</span>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
            <Outlet />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
