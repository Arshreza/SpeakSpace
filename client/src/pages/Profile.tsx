import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Camera, Plus, X, Loader2, Save, Trash2, GraduationCap, Briefcase, Award, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import useAuthStore from '@/store/authStore'
import api from '@/utils/api'
import type { Profile as ProfileType, Education, WorkExperience, Achievement } from '@/types'

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  github: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  portfolio: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  targetCompany: z.string().optional(),
  targetRole: z.string().optional(),
  preferredLanguage: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust']

const educationSchema = z.object({
  institution: z.string().min(1, 'Required'),
  degree: z.string().min(1, 'Required'),
  field: z.string().min(1, 'Required'),
  startYear: z.coerce.number().min(1950).max(2100),
  endYear: z.coerce.number().min(1950).max(2100).optional(),
  current: z.boolean(),
  gpa: z.coerce.number().min(0).max(10).optional(),
})
type EducationFormData = z.infer<typeof educationSchema>

const experienceSchema = z.object({
  company: z.string().min(1, 'Required'),
  position: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().optional(),
})
type ExperienceFormData = z.infer<typeof experienceSchema>

// ---------------------------------------------------------------------------
// XP Level bar
// ---------------------------------------------------------------------------
function XpBar({ xp, level }: { xp: number; level: number }) {
  const xpPerLevel = 1000
  const currentLevelXp = xp % xpPerLevel
  const progress = (currentLevelXp / xpPerLevel) * 100
  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-semibold">Level {level}</span>
        <span className="text-slate-400 text-sm">{currentLevelXp} / {xpPerLevel} XP</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Education form inline
// ---------------------------------------------------------------------------
function EducationEntry({
  edu,
  onDelete,
}: {
  edu: Education
  onDelete: (id: string) => void
}) {
  return (
    <div className="bg-slate-800/40 border border-white/5 rounded-xl p-4 flex justify-between items-start">
      <div>
        <p className="text-white font-medium">{edu.institution}</p>
        <p className="text-slate-400 text-sm">{edu.degree} in {edu.field}</p>
        <p className="text-slate-500 text-xs mt-0.5">
          {edu.startYear} – {edu.current ? 'Present' : edu.endYear ?? ''}
          {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
        </p>
      </div>
      {edu._id && (
        <button onClick={() => onDelete(edu._id!)} className="text-slate-500 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

function AddEducationForm({ onSave, onCancel }: { onSave: (data: EducationFormData) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: { current: false },
  })
  return (
    <form onSubmit={handleSubmit(onSave)} className="bg-slate-800/40 border border-indigo-500/30 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Institution *</label>
          <input {...register('institution')} placeholder="MIT" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
          {errors.institution && <p className="text-red-400 text-xs mt-0.5">{errors.institution.message}</p>}
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Degree *</label>
          <input {...register('degree')} placeholder="Bachelor of Science" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Field *</label>
          <input {...register('field')} placeholder="Computer Science" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Start Year *</label>
          <input type="number" {...register('startYear')} placeholder="2020" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">End Year</label>
          <input type="number" {...register('endYear')} placeholder="2024" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">GPA</label>
          <input type="number" step="0.01" {...register('gpa')} placeholder="3.8" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-slate-400 text-sm cursor-pointer">
        <input type="checkbox" {...register('current')} className="rounded" />
        Currently studying here
      </label>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">Add</button>
        <button type="button" onClick={onCancel} className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">Cancel</button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Experience form inline
// ---------------------------------------------------------------------------
function ExperienceEntry({ exp, onDelete }: { exp: WorkExperience; onDelete: (id: string) => void }) {
  return (
    <div className="bg-slate-800/40 border border-white/5 rounded-xl p-4 flex justify-between items-start">
      <div>
        <p className="text-white font-medium">{exp.position}</p>
        <p className="text-slate-400 text-sm">{exp.company}</p>
        <p className="text-slate-500 text-xs mt-0.5">
          {format(new Date(exp.startDate), 'MMM yyyy')} – {exp.current ? 'Present' : exp.endDate ? format(new Date(exp.endDate), 'MMM yyyy') : ''}
        </p>
        {exp.description && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{exp.description}</p>}
      </div>
      {exp._id && (
        <button onClick={() => onDelete(exp._id!)} className="text-slate-500 hover:text-red-400 transition-colors ml-4 flex-shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

function AddExperienceForm({ onSave, onCancel }: { onSave: (data: ExperienceFormData) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: { current: false },
  })
  return (
    <form onSubmit={handleSubmit(onSave)} className="bg-slate-800/40 border border-indigo-500/30 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Company *</label>
          <input {...register('company')} placeholder="Google" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Position *</label>
          <input {...register('position')} placeholder="Software Engineer" className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Start Date *</label>
          <input type="date" {...register('startDate')} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          {errors.startDate && <p className="text-red-400 text-xs mt-0.5">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">End Date</label>
          <input type="date" {...register('endDate')} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
        </div>
      </div>
      <div>
        <label className="text-slate-400 text-xs mb-1 block">Description</label>
        <textarea {...register('description')} rows={2} placeholder="What you worked on..." className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none" />
      </div>
      <label className="flex items-center gap-2 text-slate-400 text-sm cursor-pointer">
        <input type="checkbox" {...register('current')} className="rounded" />
        Currently working here
      </label>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">Add</button>
        <button type="button" onClick={onCancel} className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">Cancel</button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Profile page
// ---------------------------------------------------------------------------
export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showAddEdu, setShowAddEdu] = useState(false)
  const [showAddExp, setShowAddExp] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  const { data: profileData, isLoading } = useQuery<ProfileType>({
    queryKey: ['profile'],
    queryFn: async (): Promise<ProfileType> => {
      const res = await api.get<{ success: boolean; data: ProfileType }>('/users/profile')
      return res.data.data
    },
  })

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? '',
      bio: profileData?.bio ?? '',
      phone: profileData?.phone ?? '',
      location: profileData?.location ?? '',
      website: profileData?.website ?? '',
      linkedin: profileData?.linkedin ?? '',
      github: profileData?.github ?? '',
      portfolio: profileData?.portfolio ?? '',
      targetCompany: profileData?.targetCompany ?? '',
      targetRole: profileData?.targetRole ?? '',
      preferredLanguage: profileData?.preferredLanguage ?? '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) => api.put('/users/profile', data),
    onSuccess: () => {
      toast.success('Profile updated successfully')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: () => toast.error('Failed to update profile'),
  })

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('avatar', file)
      const res = await api.post<{ success: boolean; data: { avatar: string } }>('/users/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data.data
    },
    onSuccess: (data) => {
      if (user) setUser({ ...user, avatar: data.avatar })
      toast.success('Avatar updated')
    },
    onError: () => toast.error('Failed to upload avatar'),
  })

  const addEducationMutation = useMutation({
    mutationFn: (data: EducationFormData) => api.post('/users/profile/education', data),
    onSuccess: () => {
      toast.success('Education added')
      setShowAddEdu(false)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: () => toast.error('Failed to add education'),
  })

  const deleteEducationMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/profile/education/${id}`),
    onSuccess: () => {
      toast.success('Removed')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: () => toast.error('Failed to remove education'),
  })

  const addExperienceMutation = useMutation({
    mutationFn: (data: ExperienceFormData) => api.post('/users/profile/experience', data),
    onSuccess: () => {
      toast.success('Experience added')
      setShowAddExp(false)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: () => toast.error('Failed to add experience'),
  })

  const deleteExperienceMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/profile/experience/${id}`),
    onSuccess: () => {
      toast.success('Removed')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: () => toast.error('Failed to remove experience'),
  })

  const updateSkillsMutation = useMutation({
    mutationFn: (skills: string[]) => api.put('/users/profile/skills', { skills }),
    onSuccess: () => {
      toast.success('Skills saved')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: () => toast.error('Failed to save skills'),
  })

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      const existing = profileData?.skills ?? []
      if (!existing.includes(skillInput.trim())) {
        const updated = [...existing, skillInput.trim()]
        updateSkillsMutation.mutate(updated)
      }
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    const updated = (profileData?.skills ?? []).filter((s) => s !== skill)
    updateSkillsMutation.mutate(updated)
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-40 rounded-2xl bg-slate-800/60" />
        <Skeleton className="h-96 rounded-2xl bg-slate-800/60" />
      </div>
    )
  }

  const xp = profileData?.xp ?? 0
  const level = profileData?.level ?? 1

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-1">My Profile</h1>
        <p className="text-slate-400">Manage your personal information and career details</p>
      </motion.div>

      {/* Avatar + XP section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-slate-800 border-2 border-slate-900 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
            disabled={avatarMutation.isPending}
          >
            {avatarMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Camera className="w-4 h-4 text-white" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) avatarMutation.mutate(file)
            }}
          />
        </div>

        {/* Name + XP */}
        <div className="flex-1 w-full">
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <p className="text-slate-500 text-xs mt-1 capitalize">{user?.subscription} plan · {user?.role}</p>
          <div className="mt-4">
            <XpBar xp={xp} level={level} />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/60 border border-white/10 rounded-2xl p-6"
      >
        <Tabs defaultValue="overview">
          <TabsList className="bg-slate-800/60 border border-white/10 rounded-xl p-1 mb-6 flex gap-1 w-full sm:w-auto">
            {['overview', 'education', 'experience', 'skills', 'achievements'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-lg px-3 py-1.5 text-slate-400 text-sm capitalize data-[state=active]:bg-slate-700 data-[state=active]:text-white transition-all"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Full Name *</label>
                  <input {...register('name')} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
                  {errors.name && <p className="text-red-400 text-xs mt-0.5">{errors.name.message}</p>}
                </div>
                {/* Phone */}
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Phone</label>
                  <input {...register('phone')} placeholder="+1 234 567 8901" className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
                </div>
                {/* Location */}
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Location</label>
                  <input {...register('location')} placeholder="San Francisco, CA" className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
                </div>
                {/* Target Role */}
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Target Role</label>
                  <input {...register('targetRole')} placeholder="Software Engineer" className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
                </div>
                {/* Target Company */}
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Target Company</label>
                  <input {...register('targetCompany')} placeholder="Google, Meta, Apple..." className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
                </div>
                {/* Preferred Language */}
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Preferred Language</label>
                  <select {...register('preferredLanguage')} className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500">
                    <option value="">Select...</option>
                    {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                {/* Website */}
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Website</label>
                  <input {...register('website')} placeholder="https://yoursite.com" className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
                  {errors.website && <p className="text-red-400 text-xs mt-0.5">{errors.website.message}</p>}
                </div>
                {/* LinkedIn */}
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">LinkedIn</label>
                  <input {...register('linkedin')} placeholder="https://linkedin.com/in/..." className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
                  {errors.linkedin && <p className="text-red-400 text-xs mt-0.5">{errors.linkedin.message}</p>}
                </div>
                {/* GitHub */}
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">GitHub</label>
                  <input {...register('github')} placeholder="https://github.com/..." className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
                  {errors.github && <p className="text-red-400 text-xs mt-0.5">{errors.github.message}</p>}
                </div>
                {/* Portfolio */}
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Portfolio</label>
                  <input {...register('portfolio')} placeholder="https://portfolio.com" className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
                  {errors.portfolio && <p className="text-red-400 text-xs mt-0.5">{errors.portfolio.message}</p>}
                </div>
              </div>
              {/* Bio */}
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Bio</label>
                <textarea {...register('bio')} rows={3} placeholder="Tell us about yourself..." className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none" />
                {errors.bio && <p className="text-red-400 text-xs mt-0.5">{errors.bio.message}</p>}
              </div>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-medium rounded-xl transition-opacity disabled:opacity-60"
              >
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </form>
          </TabsContent>

          {/* Education */}
          <TabsContent value="education">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" /> Education
                </h3>
                <button
                  onClick={() => setShowAddEdu(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-sm rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {showAddEdu && (
                <AddEducationForm
                  onSave={(data) => addEducationMutation.mutate(data)}
                  onCancel={() => setShowAddEdu(false)}
                />
              )}
              <div className="space-y-3">
                {(profileData?.education ?? []).length === 0 && !showAddEdu ? (
                  <p className="text-slate-500 text-sm text-center py-6">No education entries yet.</p>
                ) : (
                  (profileData?.education ?? []).map((edu, i) => (
                    <EducationEntry
                      key={edu._id ?? i}
                      edu={edu}
                      onDelete={(id) => deleteEducationMutation.mutate(id)}
                    />
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Experience */}
          <TabsContent value="experience">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-400" /> Work Experience
                </h3>
                <button
                  onClick={() => setShowAddExp(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-sm rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {showAddExp && (
                <AddExperienceForm
                  onSave={(data) => addExperienceMutation.mutate(data)}
                  onCancel={() => setShowAddExp(false)}
                />
              )}
              <div className="space-y-3">
                {(profileData?.experience ?? []).length === 0 && !showAddExp ? (
                  <p className="text-slate-500 text-sm text-center py-6">No experience entries yet.</p>
                ) : (
                  (profileData?.experience ?? []).map((exp, i) => (
                    <ExperienceEntry
                      key={exp._id ?? i}
                      exp={exp}
                      onDelete={(id) => deleteExperienceMutation.mutate(id)}
                    />
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Skills */}
          <TabsContent value="skills">
            <div className="space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" /> Skills
              </h3>
              <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-slate-800/40 border border-white/10 rounded-xl">
                {(profileData?.skills ?? []).map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-indigo-300 text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(profileData?.skills ?? []).length === 0 && (
                  <span className="text-slate-500 text-sm">No skills added yet</span>
                )}
              </div>
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Type a skill and press Enter to add..."
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-slate-500 text-xs">Press Enter to add a skill. Changes are saved automatically.</p>
            </div>
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements">
            <div className="space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> Achievements
              </h3>
              {!profileData ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl bg-slate-800/60" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Achievements come from dashboard data, so show a note here */}
                  <div className="col-span-full text-center py-8 text-slate-500">
                    <Award className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>Complete interviews and tasks to earn achievements.</p>
                    <p className="text-xs mt-1">Achievements are displayed on your dashboard.</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
