import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  MessageSquare,
  BarChart3,
  BookOpen,
  CheckCircle,
  Star,
  Users,
  Award,
  Zap,
  Shield,
  Target,
  TrendingUp,
  Mic,
  Brain,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
          >
            SpeakSpace
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">
              How it works
            </Link>
            <Link href="#testimonials" className="text-sm text-slate-400 hover:text-white transition-colors">
              Testimonials
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 hidden sm:flex">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 text-white shadow-lg shadow-blue-500/20"
            >
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-48 md:pb-36">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative max-w-6xl">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
              <Zap className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">AI-Powered Communication Training Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              Master Your
              <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mt-2">
                Communication Skills
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Practice interviews, group discussions, and presentations with real-time AI feedback. Join thousands who
              have transformed their career with SpeakSpace.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 h-14 px-10 text-base font-semibold"
              >
                <Link href="/auth/register">
                  Start for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/15 text-white hover:bg-white/10 hover:border-white/25 h-14 px-10 text-base bg-transparent"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Free tier available
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Ready in 2 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/[0.05] bg-slate-900/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem number="10K+" label="Active Users" />
            <StatItem number="50K+" label="Sessions Completed" />
            <StatItem number="95%" label="Satisfaction Rate" />
            <StatItem number="4.9★" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-36">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-6">
              <Target className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-sm text-indigo-300 font-medium">Everything you need to succeed</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                SpeakSpace?
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Our platform combines real-time practice, AI analytics, and peer feedback to give you the complete
              communication skills toolkit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={<Mic className="h-6 w-6 text-blue-400" />}
              iconBg="bg-blue-500/10 border border-blue-500/20"
              title="Real-time Practice"
              description="Join live voice sessions for mock interviews, group discussions, and presentation practice with peers and expert mentors."
              highlight="LIVE SESSIONS"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-indigo-400" />}
              iconBg="bg-indigo-500/10 border border-indigo-500/20"
              title="Detailed Analytics"
              description="Get deep insights on your performance with metrics on confidence, communication clarity, and logical reasoning skills."
              highlight="SMART ANALYTICS"
            />
            <FeatureCard
              icon={<BookOpen className="h-6 w-6 text-purple-400" />}
              iconBg="bg-purple-500/10 border border-purple-500/20"
              title="Curated Resources"
              description="Access a library of guides, templates, and practice materials tailored to your specific goals and career path."
              highlight="RESOURCES"
            />
            <FeatureCard
              icon={<Award className="h-6 w-6 text-amber-400" />}
              iconBg="bg-amber-500/10 border border-amber-500/20"
              title="Achievement System"
              description="Track milestones and earn badges as you improve. Our gamified system keeps you motivated throughout your journey."
              highlight="GAMIFIED"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-green-400" />}
              iconBg="bg-green-500/10 border border-green-500/20"
              title="Community Learning"
              description="Learn from peers and mentors in group discussions. Build valuable connections with professionals across industries."
              highlight="COMMUNITY"
            />
            <FeatureCard
              icon={<Brain className="h-6 w-6 text-rose-400" />}
              iconBg="bg-rose-500/10 border border-rose-500/20"
              title="Role-Based Practice"
              description="Practice as a participant, moderator, or evaluator. Each role develops different skills needed in professional settings."
              highlight="FLEXIBLE ROLES"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 md:py-36 bg-slate-900/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              How It{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Get started in minutes and begin improving your communication skills today.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
            <StepCard
              number={1}
              title="Create Your Profile"
              description="Set your goals, preferred role, and areas for improvement in our quick 3-step onboarding process."
              gradient="from-blue-600 to-blue-500"
              icon={<Users className="h-5 w-5 text-white" />}
            />
            <StepCard
              number={2}
              title="Join Practice Sessions"
              description="Browse live and upcoming sessions. Filter by type, level, and topic to find the perfect match for you."
              gradient="from-indigo-600 to-indigo-500"
              icon={<MessageSquare className="h-5 w-5 text-white" />}
            />
            <StepCard
              number={3}
              title="Practice & Get Feedback"
              description="Participate actively in sessions. Receive real-time evaluations and detailed performance metrics from evaluators."
              gradient="from-purple-600 to-purple-500"
              icon={<Shield className="h-5 w-5 text-white" />}
            />
            <StepCard
              number={4}
              title="Track Your Growth"
              description="Monitor improvement with detailed analytics. Earn badges and climb the leaderboard as your skills grow."
              gradient="from-violet-600 to-violet-500"
              icon={<TrendingUp className="h-5 w-5 text-white" />}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 md:py-36">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              What Our{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Users Say
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Thousands of professionals have transformed their communication skills with SpeakSpace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <TestimonialCard
              quote="SpeakSpace completely changed how I approach interviews. The mock sessions felt so real and the feedback was incredibly detailed. Got my dream job after just 3 weeks of practice!"
              author="Michael Johnson"
              role="Software Engineer at Google"
              initials="MJ"
              color="bg-blue-600"
              rating={5}
            />
            <TestimonialCard
              quote="The group discussions improved my confidence in meetings dramatically. I'm now much more comfortable speaking up and leading conversations with my team."
              author="Emily Chen"
              role="Product Manager at Meta"
              initials="EC"
              color="bg-indigo-600"
              rating={5}
            />
            <TestimonialCard
              quote="As someone who struggles with public speaking, these practice sessions made a huge difference. The evaluator feedback helped me pinpoint exactly what to improve."
              author="Sarah Williams"
              role="Marketing Lead at Stripe"
              initials="SW"
              color="bg-purple-600"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(59,130,246,0.12),transparent)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative max-w-4xl">
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/[0.07] rounded-3xl p-12 md:p-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to Transform Your
              <span className="block bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mt-2">
                Communication Skills?
              </span>
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
              Join over 10,000 professionals who have already leveled up their interview game and public speaking
              abilities.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 h-14 px-12 text-base font-semibold"
            >
              <Link href="/auth/register">
                Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-slate-600 mt-6">No credit card required · Free tier available · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/[0.05]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="sm:col-span-2 md:col-span-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-3">
                SpeakSpace
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                AI-powered communication training platform helping professionals excel in interviews and presentations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm mb-5">Product</h3>
              <div className="space-y-3">
                <FooterLink href="#features">Features</FooterLink>
                <FooterLink href="#how-it-works">How It Works</FooterLink>
                <FooterLink href="#testimonials">Testimonials</FooterLink>
                <FooterLink href="/auth/register">Get Started</FooterLink>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm mb-5">Company</h3>
              <div className="space-y-3">
                <FooterLink href="#">About</FooterLink>
                <FooterLink href="#">Blog</FooterLink>
                <FooterLink href="#">Careers</FooterLink>
                <FooterLink href="#">Contact</FooterLink>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm mb-5">Legal</h3>
              <div className="space-y-3">
                <FooterLink href="#">Privacy Policy</FooterLink>
                <FooterLink href="#">Terms of Service</FooterLink>
                <FooterLink href="#">Cookie Policy</FooterLink>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.05] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600">© {new Date().getFullYear()} SpeakSpace. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Built for better communication</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-white mb-2">{number}</div>
      <div className="text-slate-500 text-sm">{label}</div>
    </div>
  )
}

function FeatureCard({
  icon,
  iconBg,
  title,
  description,
  highlight,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  highlight: string
}) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.06] hover:border-white/[0.12] hover:bg-slate-900 transition-all duration-200 group">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-5`}>{icon}</div>
      <div className="text-[10px] font-semibold text-slate-500 mb-2 tracking-widest">{highlight}</div>
      <h3 className="text-base font-semibold text-white mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
  gradient,
  icon,
}: {
  number: number
  title: string
  description: string
  gradient: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex gap-5 p-6 rounded-2xl bg-slate-900/60 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200">
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs font-semibold text-slate-500 mb-1">STEP {number}</div>
        <h3 className="font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function TestimonialCard({
  quote,
  author,
  role,
  initials,
  color,
  rating,
}: {
  quote: string
  author: string
  role: string
  initials: string
  color: string
  rating: number
}) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 flex flex-col">
      <div className="flex gap-1 mb-5">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
        ))}
      </div>
      <p className="text-slate-300 mb-6 leading-relaxed text-sm flex-1">"{quote}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
        <div
          className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}
        >
          {initials}
        </div>
        <div>
          <div className="font-semibold text-white text-sm">{author}</div>
          <div className="text-slate-500 text-xs mt-0.5">{role}</div>
        </div>
      </div>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block text-sm text-slate-500 hover:text-slate-300 transition-colors">
      {children}
    </Link>
  )
}
