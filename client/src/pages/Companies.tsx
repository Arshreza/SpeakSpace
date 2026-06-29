import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Search,
  Star,
  MapPin,
  Globe,
  ChevronDown,
  ChevronRight,
  ThumbsUp,
  Plus,
  ArrowLeft,
  CheckCircle,
  Users,
  MessageSquare,
  HelpCircle,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import api from '@/utils/api'
import useAuthStore from '@/store/authStore'
import type { Company } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────────

type ExperienceResult = 'selected' | 'rejected' | 'pending' | 'no_response'

interface ExperienceForm {
  title: string
  experience: string
  result: ExperienceResult
}

// ─── Constants ───────────────────────────────────────────────────────────────

const INDUSTRIES = ['All', 'Technology', 'E-commerce', 'Food Tech', 'Entertainment', 'Social Media', 'Finance', 'Healthcare']

const RESULT_STYLES: Record<string, string> = {
  selected: 'bg-green-500/20 text-green-400 border border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  no_response: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
}

// ─── Stars ───────────────────────────────────────────────────────────────────

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
        />
      ))}
    </div>
  )
}

// ─── Company Card ─────────────────────────────────────────────────────────────

function CompanyCard({ company, onClick }: { company: Company; onClick: () => void }) {
  const letter = company.name.charAt(0).toUpperCase()
  const colors = ['from-indigo-500 to-purple-600', 'from-pink-500 to-rose-600', 'from-green-500 to-emerald-600', 'from-orange-500 to-amber-600', 'from-blue-500 to-cyan-600']
  const color = colors[letter.charCodeAt(0) % colors.length]

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 hover:border-indigo-500/30 transition-all group">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0`}>
          {letter}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">{company.name}</h3>
          <p className="text-xs text-slate-400">{company.industry}</p>
        </div>
      </div>
      {company.headquarters && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5" />
          {company.headquarters}
        </div>
      )}
      <StarRating value={company.difficulty} />
      <div className="flex flex-wrap gap-1.5">
        {company.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {tag}
          </span>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={onClick} className="w-full border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300">
        View Details
      </Button>
    </div>
  )
}

// ─── List View ────────────────────────────────────────────────────────────────

function CompanyList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('All')

  useEffect(() => {
    document.title = 'Companies | SpeakSpace'
  }, [])

  const { data, isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Company[] }>('/company')
      return data.data ?? []
    },
    staleTime: 5 * 60 * 1000,
  })

  const companies = data ?? []
  const filtered = companies.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase())
    const matchIndustry = industry === 'All' || c.industry === industry
    return matchSearch && matchIndustry
  })

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Companies</h1>
        <p className="text-slate-400">Explore interview processes and experiences at top companies.</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies..."
          className="w-full bg-slate-800/60 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
      </div>

      {/* Industry Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind}
            onClick={() => setIndustry(ind)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              industry === ind
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-400'
            }`}
          >
            {ind}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 h-52 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-slate-400">Failed to load companies.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No companies found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((company) => (
            <CompanyCard
              key={company._id}
              company={company}
              onClick={() => navigate(`/companies/${company.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Detail View ──────────────────────────────────────────────────────────────

function CompanyDetail({ slug }: { slug: string }) {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [showExpDialog, setShowExpDialog] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [expForm, setExpForm] = useState<ExperienceForm>({ title: '', experience: '', result: 'pending' })

  const { data: company, isLoading, refetch } = useQuery({
    queryKey: ['company', slug],
    queryFn: async () => {
      const { data } = await api.get<{ data: Company }>(`/company/${slug}`)
      return data.data
    },
  })

  useEffect(() => {
    if (company) document.title = `${company.name} | SpeakSpace`
  }, [company])

  const addExperienceMutation = useMutation({
    mutationFn: async (form: ExperienceForm) => {
      await api.post(`/company/${slug}/experience`, form)
    },
    onSuccess: () => {
      toast.success('Experience added successfully!')
      setShowExpDialog(false)
      setExpForm({ title: '', experience: '', result: 'pending' })
      refetch()
    },
    onError: () => toast.error('Failed to add experience.'),
  })

  const upvoteMutation = useMutation({
    mutationFn: async (expId: string) => {
      await api.post(`/company/${slug}/experience/${expId}/upvote`)
    },
    onSuccess: () => refetch(),
    onError: () => toast.error('Failed to upvote.'),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-slate-800 rounded-2xl" />
          <div className="h-12 bg-slate-800 rounded-xl" />
          <div className="h-64 bg-slate-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <p className="text-slate-400 mb-4">Company not found.</p>
        <Button onClick={() => navigate('/companies')}>Back to Companies</Button>
      </div>
    )
  }

  const letter = company.name.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-slate-900/50 border-b border-white/10">
        <div className="px-6 py-10">
          <button
            onClick={() => navigate('/companies')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Companies
          </button>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-purple-500/25">
              {letter}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                  {company.industry}
                </span>
                {company.headquarters && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{company.headquarters}</span>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-6 pb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Difficulty', value: <StarRating value={company.difficulty} />, icon: Star },
            { label: 'Interview Rounds', value: company.interviewRounds, icon: Users },
            { label: 'Questions', value: company.commonQuestions?.length ?? 0, icon: HelpCircle },
            { label: 'Experiences', value: company.experiences?.length ?? 0, icon: MessageSquare },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
              <div className="text-lg font-semibold text-white">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="p-6">
        <Tabs defaultValue="overview">
          <TabsList className="bg-slate-800/60 border border-white/10 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="process" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Interview Process</TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Questions</TabsTrigger>
            <TabsTrigger value="experiences" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Experiences</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {company.description && (
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-sm font-semibold text-slate-300 mb-3">About</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">{company.description}</p>
                </div>
              )}
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-slate-300 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {company.tags.map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Interview Process */}
          <TabsContent value="process">
            <div className="space-y-4">
              {(company.interviewProcess ?? []).length === 0 ? (
                <p className="text-slate-400 text-sm">No interview process data available yet.</p>
              ) : (
                company.interviewProcess.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {step.step}
                      </div>
                      {i < company.interviewProcess.length - 1 && (
                        <div className="w-0.5 flex-1 bg-indigo-500/20 mt-2" />
                      )}
                    </div>
                    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 flex-1 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{step.title}</h3>
                        {step.duration && <span className="text-xs text-slate-500">{step.duration}</span>}
                      </div>
                      <p className="text-sm text-slate-400">{step.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Questions */}
          <TabsContent value="questions">
            <div className="space-y-3">
              {(company.commonQuestions ?? []).length === 0 ? (
                <p className="text-slate-400 text-sm">No questions data available yet.</p>
              ) : (
                company.commonQuestions.map((q, i) => {
                  const qId = q._id ?? String(i)
                  return (
                    <div key={qId} className="bg-slate-900/60 border border-white/10 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedQuestion(expandedQuestion === qId ? null : qId)}
                        className="flex items-center justify-between w-full px-5 py-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            q.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                            q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {q.difficulty}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{q.category}</span>
                          <span className="text-sm text-slate-200">{q.question}</span>
                        </div>
                        {expandedQuestion === qId ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                      </button>
                      {expandedQuestion === qId && (
                        <div className="px-5 pb-4 text-sm text-slate-400 border-t border-white/5">
                          <p className="mt-3 italic">Hint: Think about the problem systematically. Start with the brute force approach and optimize.</p>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </TabsContent>

          {/* Experiences */}
          <TabsContent value="experiences">
            <div className="space-y-4">
              {(company.experiences ?? []).length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No experiences shared yet. Be the first!</p>
                </div>
              ) : (
                company.experiences.map((exp, i) => (
                  <div key={exp._id ?? i} className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                          {exp.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{exp.user.name}</p>
                          <p className="text-xs text-slate-500">{exp.role} · {new Date(exp.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${RESULT_STYLES[exp.result] ?? ''}`}>
                        {exp.result.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-3 line-clamp-3">{exp.experience}</p>
                    <button
                      onClick={() => isAuthenticated ? upvoteMutation.mutate(exp._id ?? '') : toast.error('Please login to upvote.')}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${exp.hasUpvoted ? 'fill-indigo-400 text-indigo-400' : ''}`} />
                      {exp.upvotes} upvotes
                    </button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Experience FAB */}
      {isAuthenticated && (
        <button
          onClick={() => setShowExpDialog(true)}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-purple-500/30 hover:opacity-90 transition-all flex items-center justify-center"
          title="Add your experience"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Add Experience Dialog */}
      <Dialog open={showExpDialog} onOpenChange={setShowExpDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Your Interview Experience</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Title</label>
              <input
                value={expForm.title}
                onChange={(e) => setExpForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. SDE-2 Interview at Google"
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Experience</label>
              <textarea
                value={expForm.experience}
                onChange={(e) => setExpForm((f) => ({ ...f, experience: e.target.value }))}
                placeholder="Share your interview experience in detail..."
                rows={5}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Result</label>
              <select
                value={expForm.result}
                onChange={(e) => setExpForm((f) => ({ ...f, result: e.target.value as ExperienceResult }))}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
                <option value="no_response">No Response</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowExpDialog(false)}>Cancel</Button>
            <Button
              onClick={() => addExperienceMutation.mutate(expForm)}
              disabled={!expForm.title.trim() || !expForm.experience.trim() || addExperienceMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
            >
              {addExperienceMutation.isPending ? 'Submitting...' : 'Submit Experience'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Router Wrapper ───────────────────────────────────────────────────────────

export default function Companies() {
  const { slug } = useParams<{ slug?: string }>()
  return slug ? <CompanyDetail slug={slug} /> : <CompanyList />
}
