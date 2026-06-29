import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Brain, Mic, FileText, Code2, Bot, Building2, Trophy, Star, Check,
  ArrowRight, Users, TrendingUp, Zap, Play, Github, Twitter, Linkedin,
  MessageSquare, Target, Award, BarChart, Sparkles, ChevronRight, Shield, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import useAuthStore from '@/store/authStore'
import { cn } from '@/utils/cn'

// ─── AnimatedCounter ────────────────────────────────────────────────────────
function AnimatedCounter({
  end,
  duration = 2,
  suffix = '',
}: {
  end: number
  duration?: number
  suffix?: string
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = end / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

// ─── WaveformAnimation ──────────────────────────────────────────────────────
function WaveformAnimation() {
  const bars = [4, 8, 14, 10, 18, 12, 6, 16, 9, 13, 7, 15, 11, 5, 17]
  return (
    <div className="flex items-end gap-[3px] h-10">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-indigo-500 to-purple-400"
          animate={{
            height: [`${height * 2}px`, `${height * 3.5}px`, `${height * 1.5}px`, `${height * 2}px`],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.08,
          }}
        />
      ))}
    </div>
  )
}

// ─── FloatingBadge ──────────────────────────────────────────────────────────
function FloatingBadge({
  label,
  style,
  delay,
}: {
  label: string
  style: React.CSSProperties
  delay: number
}) {
  return (
    <motion.div
      className="absolute px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-medium shadow-lg select-none"
      style={style}
      animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {label}
    </motion.div>
  )
}

// ─── StarRating ─────────────────────────────────────────────────────────────
function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  )
}

// ─── FAQ data ────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'How is SpeckSpace different from other interview prep platforms?',
    a: 'SpeckSpace uses advanced AI to provide real-time, conversational feedback on every answer — not just a static question bank. Our NLP engine scores your technical accuracy, communication clarity, and confidence, then gives personalized coaching tips so each session genuinely moves you forward.',
  },
  {
    q: 'What types of interviews can I practice?',
    a: 'You can practice HR & behavioral interviews, technical interviews (algorithms, data structures), coding rounds with live code execution, system design discussions, SQL & database design, and voice/speaking interviews with full transcription.',
  },
  {
    q: 'How does the AI feedback work?',
    a: 'After each answer, our AI analyzes it using natural language processing across three dimensions: technical accuracy (is the content correct?), communication (is it clear and structured?), and confidence (tone, pacing, filler words). You get a score, highlighted strengths, and specific improvement tips.',
  },
  {
    q: 'Can I practice voice and speaking interviews?',
    a: 'Yes — our Voice Interview mode uses your microphone to capture spoken answers. The AI transcribes in real time, measures speech rate, identifies filler words, and coaches you on vocal delivery, so you arrive at your interview sounding polished and confident.',
  },
  {
    q: 'What companies are covered in the platform?',
    a: 'We cover 200+ top tech companies including Google, Amazon, Microsoft, Meta, Apple, Netflix, Uber, Adobe, and many more. Each company profile includes real question patterns, culture notes, and role-specific prep tracks curated from thousands of candidate reports.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Our Free plan gives you 5 mock interviews per month and 1 resume scan — forever, no credit card required. You can upgrade to Premium or Enterprise any time for unlimited access and advanced AI features.',
  },
  {
    q: 'How accurate is the AI scoring?',
    a: 'In our internal testing with 500+ real interview transcripts reviewed by experienced interviewers, our AI scoring correlated with human scores 95% of the time. We continuously fine-tune the model as more data comes in, so accuracy only improves over time.',
  },
  {
    q: 'Can I track my progress over time?',
    a: 'Absolutely. Your personal analytics dashboard shows skill evolution graphs, weak-area heatmaps, session history, and a global leaderboard ranking. You can export progress reports to share with mentors or attach to job applications.',
  },
]

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Landing() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [navScrolled, setNavScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  }

  return (
    <div className="min-h-screen bg-[#080b14] text-white overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <motion.nav
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          navScrolled ? 'bg-[#080b14]/90 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'bg-transparent'
        )}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              SpeckSpace
            </span>
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Companies', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Right CTA */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="gradient"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="hidden sm:flex"
              >
                Go to Dashboard <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-white/70 hover:text-white">
                  Sign In
                </Button>
                <Button variant="gradient" size="sm" onClick={() => navigate('/register')} className="hidden sm:flex">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background radial glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/2 w-[300px] h-[300px] rounded-full bg-pink-600/10 blur-[80px]" />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — Text */}
            <div className="flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                  <Sparkles className="w-3 h-3" /> AI-Powered Interview Preparation
                </Badge>
              </motion.div>

              <div className="flex flex-col gap-1">
                {['Practice.', 'Improve.', 'Get Hired.'].map((word, i) => (
                  <motion.h1
                    key={word}
                    className={cn(
                      'text-6xl sm:text-7xl font-extrabold leading-none tracking-tight',
                      i < 2
                        ? 'text-white'
                        : 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'
                    )}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                  >
                    {word}
                  </motion.h1>
                ))}
              </div>

              <motion.p
                className="text-lg text-white/60 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                Master technical interviews with AI-powered mock sessions, real-time feedback, and personalized coaching tailored to your target company.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-3 pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <Button
                  variant="gradient"
                  size="xl"
                  onClick={() => navigate('/register')}
                  className="shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-shadow"
                >
                  Start Free Today <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  className="border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
                  onClick={() => {}}
                >
                  <Play className="mr-2 w-4 h-4 fill-current" /> Watch Demo
                </Button>
              </motion.div>

              <motion.div
                className="flex items-center gap-6 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <div className="flex -space-x-2">
                  {['AM', 'JC', 'PS', 'RK', 'TW'].map((initials, i) => (
                    <div
                      key={initials}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 border-[#080b14] flex items-center justify-center text-[10px] font-bold',
                        ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-emerald-500'][i]
                      )}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-white/50">
                  <span className="text-white font-semibold">50,000+</span> engineers already practicing
                </p>
              </motion.div>
            </div>

            {/* Right — Mock interview card */}
            <motion.div
              className="relative hidden lg:flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {/* Floating tech badges */}
              <FloatingBadge label="⚛️ React" style={{ top: '8%', left: '-5%' }} delay={0} />
              <FloatingBadge label="🐍 Python" style={{ top: '20%', right: '-8%' }} delay={1} />
              <FloatingBadge label="🏗 System Design" style={{ bottom: '20%', left: '-8%' }} delay={0.7} />
              <FloatingBadge label="📊 DSA" style={{ bottom: '8%', right: '-4%' }} delay={1.5} />
              <FloatingBadge label="🗄 SQL" style={{ top: '55%', right: '-10%' }} delay={0.3} />
              <FloatingBadge label="📘 TypeScript" style={{ top: '40%', left: '-12%' }} delay={1.2} />

              {/* Main card */}
              <div className="relative w-full max-w-md">
                {/* Glow behind */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-2xl scale-105" />
                <div className="relative rounded-2xl border border-white/10 bg-[#0d1117]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Mic className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Mock Interview</p>
                        <p className="text-[10px] text-white/50">Frontend Developer · Round 2</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      <span className="text-[10px] text-red-300 font-medium">LIVE</span>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="px-5 py-4 space-y-3">
                    <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">Question 3 of 8</p>
                    <p className="text-sm text-white/90 leading-relaxed">
                      "Explain the difference between <span className="text-indigo-400 font-mono">useCallback</span> and{' '}
                      <span className="text-purple-400 font-mono">useMemo</span> in React and when you would use each."
                    </p>
                  </div>

                  {/* Waveform */}
                  <div className="mx-5 mb-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                    <WaveformAnimation />
                    <div className="flex-1">
                      <p className="text-[11px] text-white/60">Answering...</p>
                      <p className="text-[10px] text-white/30 mt-0.5">2:14 / 5:00</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                      <Mic className="w-3.5 h-3.5 text-red-400" />
                    </div>
                  </div>

                  {/* Score panel */}
                  <div className="mx-5 mb-5 grid grid-cols-3 gap-2">
                    {[
                      { label: 'Technical', score: 88, color: 'from-indigo-500 to-indigo-400' },
                      { label: 'Clarity', score: 92, color: 'from-purple-500 to-purple-400' },
                      { label: 'Confidence', score: 79, color: 'from-pink-500 to-pink-400' },
                    ].map(({ label, score, color }) => (
                      <div key={label} className="rounded-lg bg-white/5 border border-white/10 p-2.5 text-center">
                        <p className={cn('text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent', color)}>
                          {score}
                        </p>
                        <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI tip */}
                  <div className="mx-5 mb-5 px-3 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex gap-2">
                    <Bot className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-indigo-300/80 leading-relaxed">
                      AI Tip: Great start! Consider adding a concrete performance example to strengthen your answer.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-[11px] text-white/30 uppercase tracking-widest">Scroll</p>
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────────────────────────── */}
      <section className="relative py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { end: 50000, suffix: '+', label: 'Engineers Trained', icon: Users, color: 'from-indigo-500 to-indigo-400' },
              { end: 1000000, suffix: '+', label: 'Questions Practiced', icon: MessageSquare, color: 'from-purple-500 to-purple-400' },
              { end: 95, suffix: '%', label: 'Success Rate', icon: Trophy, color: 'from-pink-500 to-pink-400' },
              { end: 200, suffix: '+', label: 'Companies Covered', icon: Building2, color: 'from-cyan-500 to-cyan-400' },
            ].map(({ end, suffix, label, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center overflow-hidden group hover:border-white/20 transition-colors">
                  <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br blur-2xl', color)} style={{ opacity: 0.04 }} />
                  <div className={cn('inline-flex w-10 h-10 rounded-xl items-center justify-center mb-3 bg-gradient-to-br', color, 'shadow-lg')}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className={cn('text-4xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent', color)}>
                    <AnimatedCounter end={end} suffix={suffix} />
                  </p>
                  <p className="text-sm text-white/50 mt-1 font-medium">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <Badge className="mb-4 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-medium">
              Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ace your interview
              </span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              A complete end-to-end platform that takes you from first practice session to signed offer letter.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Mic,
                title: 'AI Mock Interviews',
                desc: 'Conduct full-length mock interviews with our AI interviewer. Get question-by-question feedback on technical depth, structure, and delivery.',
                gradient: 'from-indigo-600 to-indigo-400',
                glow: 'group-hover:shadow-indigo-500/30',
                bg: 'group-hover:border-indigo-500/40',
              },
              {
                icon: FileText,
                title: 'Resume Analyzer',
                desc: 'Upload your resume and get an ATS compatibility score, keyword gap analysis, and targeted rewrite suggestions in seconds.',
                gradient: 'from-purple-600 to-purple-400',
                glow: 'group-hover:shadow-purple-500/30',
                bg: 'group-hover:border-purple-500/40',
              },
              {
                icon: Sparkles,
                title: 'Voice Interview Mode',
                desc: 'Speak your answers aloud. Our voice engine transcribes in real time, analyses your tone, pacing, and filler words, and coaches you on vocal confidence.',
                gradient: 'from-pink-600 to-pink-400',
                glow: 'group-hover:shadow-pink-500/30',
                bg: 'group-hover:border-pink-500/40',
              },
              {
                icon: Code2,
                title: 'Coding Practice',
                desc: 'Solve 500+ curated algorithm and data structure problems in an in-browser IDE with language-agnostic AI hints and optimal solution explanations.',
                gradient: 'from-blue-600 to-blue-400',
                glow: 'group-hover:shadow-blue-500/30',
                bg: 'group-hover:border-blue-500/40',
              },
              {
                icon: Bot,
                title: 'AI Career Coach',
                desc: 'Chat with your personal AI coach 24/7. Get tailored study plans, salary negotiation scripts, and company-specific preparation roadmaps.',
                gradient: 'from-emerald-600 to-emerald-400',
                glow: 'group-hover:shadow-emerald-500/30',
                bg: 'group-hover:border-emerald-500/40',
              },
              {
                icon: Building2,
                title: 'Company Prep Packs',
                desc: 'Deep-dive packs for 200+ companies: culture decode, past question patterns, hiring bar notes, and insider tips from engineers who\'ve been through it.',
                gradient: 'from-orange-600 to-orange-400',
                glow: 'group-hover:shadow-orange-500/30',
                bg: 'group-hover:border-orange-500/40',
              },
            ].map(({ icon: Icon, title, desc, gradient, glow, bg }, i) => (
              <motion.div
                key={title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div
                  className={cn(
                    'group relative h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default',
                    glow,
                    bg
                  )}
                >
                  <div className={cn('inline-flex w-12 h-12 rounded-xl items-center justify-center mb-5 bg-gradient-to-br shadow-lg', gradient)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-white/30 group-hover:text-white/60 transition-colors">
                    Learn more <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Companies Section ───────────────────────────────────────────────── */}
      <section id="companies" className="py-20 px-4 sm:px-6 lg:px-8 border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" {...fadeUp}>
            <p className="text-sm text-white/40 uppercase tracking-widest font-semibold mb-4">Trusted by engineers at</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              The world's top companies
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-4 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {[
              { name: 'Google', color: 'hover:border-blue-500/50 hover:text-blue-300' },
              { name: 'Amazon', color: 'hover:border-orange-500/50 hover:text-orange-300' },
              { name: 'Microsoft', color: 'hover:border-cyan-500/50 hover:text-cyan-300' },
              { name: 'Meta', color: 'hover:border-indigo-500/50 hover:text-indigo-300' },
              { name: 'Netflix', color: 'hover:border-red-500/50 hover:text-red-300' },
              { name: 'Adobe', color: 'hover:border-red-400/50 hover:text-red-200' },
              { name: 'Uber', color: 'hover:border-white/40 hover:text-white' },
              { name: 'Apple', color: 'hover:border-gray-400/50 hover:text-gray-200' },
            ].map(({ name, color }) => (
              <div
                key={name}
                className={cn(
                  'rounded-xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center text-sm font-semibold text-white/40 cursor-default transition-all duration-200',
                  color
                )}
              >
                {name}
              </div>
            ))}
          </motion.div>

          <motion.p
            className="text-center text-sm text-white/30 mt-8"
            {...fadeUp}
            transition={{ delay: 0.4 }}
          >
            + 192 more companies in our library
          </motion.p>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <Badge className="mb-4 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              How It Works
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Three steps to your{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                dream offer
              </span>
            </h2>
          </motion.div>

          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px border-t-2 border-dashed border-white/10 z-0" />

            {[
              {
                step: '01',
                title: 'Create Your Profile',
                desc: 'Set your target role, companies, experience level, and the skills you want to work on. SpeckSpace builds a personalized prep roadmap in under 60 seconds.',
                icon: Target,
                color: 'from-indigo-500 to-indigo-400',
              },
              {
                step: '02',
                title: 'Practice Daily',
                desc: 'Run AI mock interviews, solve coding problems, and review your resume — all in one place. Our adaptive algorithm focuses each session on your weakest areas.',
                icon: Zap,
                color: 'from-purple-500 to-purple-400',
              },
              {
                step: '03',
                title: 'Get Hired',
                desc: 'Track your progress on analytics dashboards, climb the leaderboard, and walk into every interview knowing exactly what to expect — and how to win.',
                icon: Award,
                color: 'from-pink-500 to-pink-400',
              },
            ].map(({ step, title, desc, icon: Icon, color }, i) => (
              <motion.div
                key={step}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative z-10"
              >
                <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 h-full overflow-hidden group hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                  {/* Big faded step number */}
                  <span className="absolute top-4 right-6 text-8xl font-black text-white/[0.04] leading-none select-none pointer-events-none">
                    {step}
                  </span>

                  <div className={cn('inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-5 bg-gradient-to-br shadow-xl', color)}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <div className={cn('text-xs font-bold uppercase tracking-widest bg-gradient-to-r bg-clip-text text-transparent mb-2', color)}>
                    Step {step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <Badge className="mb-4 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-medium">
              Testimonials
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Real engineers.{' '}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Real results.
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                initials: 'MG',
                name: 'Maria Garcia',
                role: 'Software Engineer @ Google',
                color: 'bg-indigo-500',
                quote:
                  'The AI feedback was incredibly detailed and helped me restructure my system design answers completely. I went from vague hand-waving to crisp, confident explanations. SpeckSpace is the real deal.',
              },
              {
                initials: 'JC',
                name: 'James Chen',
                role: 'Backend Developer @ Amazon',
                color: 'bg-purple-500',
                quote:
                  'I went from failing phone screens to receiving three concurrent offers — including Amazon. The company-specific prep packs showed me exactly what topics L4 Amazon interviewers focus on. Worth every penny.',
              },
              {
                initials: 'PS',
                name: 'Priya Sharma',
                role: 'Full-Stack Developer @ Microsoft',
                color: 'bg-pink-500',
                quote:
                  'The coding practice with real-time AI review is unlike anything else out there. It doesn\'t just tell you whether your solution works — it explains time complexity trade-offs and shows you the optimal approach.',
              },
            ].map(({ initials, name, role, color, quote }, i) => (
              <motion.div
                key={name}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-7 flex flex-col gap-5 hover:border-white/20 transition-colors duration-300">
                  <StarRating />
                  <p className="text-sm text-white/70 leading-relaxed flex-1">"{quote}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0', color)}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{name}</p>
                      <p className="text-xs text-white/40">{role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ─────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <Badge className="mb-4 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              Pricing
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Simple, transparent{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                pricing
              </span>
            </h2>
            <p className="text-lg text-white/50 mt-4 max-w-xl mx-auto">
              Start free. Upgrade when you're ready. No surprise bills.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {/* Free */}
            <motion.div {...fadeUp} transition={{ delay: 0 }}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 flex flex-col gap-6">
                <div>
                  <p className="text-sm font-semibold text-white/50 mb-2">Free</p>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-extrabold text-white">$0</span>
                    <span className="text-white/40 mb-2">/month</span>
                  </div>
                  <p className="text-sm text-white/40 mt-2">Forever free. No credit card.</p>
                </div>
                <ul className="space-y-3 flex-1">
                  {[
                    '5 mock interviews / month',
                    'Basic AI feedback',
                    '1 resume scan / month',
                    'Community access',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-white/60">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> {feat}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full" onClick={() => navigate('/register')}>
                  Get Started Free
                </Button>
              </div>
            </motion.div>

            {/* Premium — highlighted */}
            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <div className="h-full relative rounded-2xl border-2 border-indigo-500/60 bg-gradient-to-b from-indigo-500/10 to-purple-500/5 p-8 flex flex-col gap-6 shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] transition-transform duration-300">
                {/* Most Popular badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/40">
                    Most Popular
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-indigo-300 mb-2">Premium</p>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-extrabold text-white">$29</span>
                    <span className="text-white/40 mb-2">/month</span>
                  </div>
                  <p className="text-sm text-white/40 mt-2">Billed monthly. Cancel any time.</p>
                </div>
                <ul className="space-y-3 flex-1">
                  {[
                    'Unlimited mock interviews',
                    'Detailed AI feedback & coaching',
                    'Unlimited resume scans',
                    'Voice interview mode',
                    'Full coding practice library',
                    'AI Career Coach (24/7)',
                    'Global leaderboard access',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-white/80">
                      <Check className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" /> {feat}
                    </li>
                  ))}
                </ul>
                <Button variant="gradient" className="w-full shadow-lg shadow-indigo-500/30" size="lg" onClick={() => navigate('/register')}>
                  Start Premium <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>

            {/* Enterprise */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 flex flex-col gap-6">
                <div>
                  <p className="text-sm font-semibold text-white/50 mb-2">Enterprise</p>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-extrabold text-white">$99</span>
                    <span className="text-white/40 mb-2">/month</span>
                  </div>
                  <p className="text-sm text-white/40 mt-2">Per team. Volume discounts available.</p>
                </div>
                <ul className="space-y-3 flex-1">
                  {[
                    'Everything in Premium',
                    'Team management dashboard',
                    'Custom question bank',
                    'Analytics & reporting',
                    'Priority support (SLA 4h)',
                    'SSO & SCIM provisioning',
                    'Dedicated customer success',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-white/60">
                      <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" /> {feat}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full" onClick={() => {}}>
                  Contact Sales
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-white/[0.015]">
        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-14" {...fadeUp}>
            <Badge className="mb-4 px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-xs font-medium">
              FAQ
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Frequently asked{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                questions
              </span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div
                  className={cn(
                    'rounded-xl border transition-all duration-200 overflow-hidden',
                    activeFaq === i ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  )}
                >
                  <button
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  >
                    <span className="text-sm font-semibold text-white">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: activeFaq === i ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <ChevronRight className={cn('w-4 h-4 transition-colors', activeFaq === i ? 'text-indigo-400' : 'text-white/40')} />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-5">
                          <p className="text-sm text-white/55 leading-relaxed">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="relative rounded-3xl overflow-hidden"
            {...fadeUp}
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600" />
            {/* Noise texture overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
              }}
            />
            {/* Glow blobs */}
            <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

            <div className="relative px-8 py-16 sm:px-16 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-10 h-10 text-white/60 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
                Ready to ace your next interview?
              </h2>
              <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
                Join 50,000+ engineers who've transformed their interview performance with AI-powered practice.
              </p>
              <Button
                size="xl"
                className="bg-white text-indigo-700 hover:bg-white/90 font-bold shadow-2xl shadow-black/30 hover:shadow-black/40 transition-all duration-200 hover:scale-105"
                onClick={() => navigate('/register')}
              >
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-sm text-white/40 mt-5">No credit card required. Free plan includes 5 interviews/month.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-white/[0.015] pt-16 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  SpeckSpace
                </span>
              </Link>
              <p className="text-sm text-white/40 leading-relaxed">
                AI-powered interview preparation for engineers who play to win.
              </p>
              <div className="flex items-center gap-3 mt-5">
                {[
                  { icon: Twitter, href: '#' },
                  { icon: Github, href: '#' },
                  { icon: Linkedin, href: '#' },
                ].map(({ icon: Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              {
                heading: 'Product',
                links: ['Features', 'Pricing', 'Companies', 'Leaderboard', 'Blog'],
              },
              {
                heading: 'Company',
                links: ['About', 'Careers', 'Press', 'Contact'],
              },
              {
                heading: 'Resources',
                links: ['Documentation', 'API', 'Status', 'Community'],
              },
              {
                heading: 'Legal',
                links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
              },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">{heading}</p>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-white/40 hover:text-white/80 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">© 2025 SpeckSpace. All rights reserved.</p>
            <p className="text-xs text-white/30">Made with ❤️ for engineers</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
