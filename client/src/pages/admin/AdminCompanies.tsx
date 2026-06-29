import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { Plus, Pencil, Trash2, Building2, Star, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/utils/api"

interface Company {
  _id: string
  name: string
  slug: string
  website?: string
  description?: string
  industry?: string
  location?: string
  difficultyRating: number
  frequentlyAskedQuestions?: any[]
  interviewExperiences?: any[]
  isVerified?: boolean
}

const schema = z.object({
  name: z.string().min(2, "Name required"),
  website: z.string().url("Must be a valid URL").or(z.literal("")),
  description: z.string().min(10, "Description too short"),
  industry: z.string().min(1, "Industry required"),
  location: z.string().min(1, "Location required"),
  size: z.string().min(1, "Size required"),
  difficultyRating: z.number().min(1).max(5),
})
type FormData = z.infer<typeof schema>

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`text-xl transition-colors ${n <= value ? "text-amber-400" : "text-slate-600"} hover:text-amber-300`}>
          ★
        </button>
      ))}
    </div>
  )
}

export default function AdminCompanies() {
  const qc = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Company | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null)
  const [difficultyValue, setDifficultyValue] = useState(3)

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: async () => {
      const res = await api.get("/admin/companies")
      return res.data.data as Company[]
    }
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { difficultyRating: 3 }
  })

  const openCreate = () => {
    setEditTarget(null)
    setDifficultyValue(3)
    reset({ difficultyRating: 3 })
    setDialogOpen(true)
  }

  const openEdit = (company: Company) => {
    setEditTarget(company)
    setDifficultyValue(company.difficultyRating)
    reset({
      name: company.name,
      website: company.website || "",
      description: company.description || "",
      industry: company.industry || "",
      location: company.location || "",
      size: "enterprise",
      difficultyRating: company.difficultyRating
    })
    setDialogOpen(true)
  }

  const createCompany = useMutation({
    mutationFn: (data: FormData) => api.post("/company", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-companies"] })
      toast.success("Company created")
      setDialogOpen(false)
    },
    onError: () => toast.error("Failed to create company")
  })

  const updateCompany = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => api.put(`/company/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-companies"] })
      toast.success("Company updated")
      setDialogOpen(false)
    },
    onError: () => toast.error("Failed to update company")
  })

  const onSubmit = (data: FormData) => {
    const payload = { ...data, difficultyRating: difficultyValue }
    if (editTarget) updateCompany.mutate({ id: editTarget._id, data: payload })
    else createCompany.mutate(payload)
  }

  const INDUSTRIES = ["Technology", "E-commerce", "Food Tech", "Entertainment", "Social Media", "Finance", "Healthcare", "Education", "Logistics", "Consulting"]
  const SIZES = [
    { value: "startup", label: "Startup (1-50)" },
    { value: "small", label: "Small (51-200)" },
    { value: "medium", label: "Medium (201-1000)" },
    { value: "large", label: "Large (1001-10000)" },
    { value: "enterprise", label: "Enterprise (10000+)" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Companies</h1>
          <p className="text-slate-400 text-sm mt-1">Manage the company interview database</p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-2">
          <Plus className="w-4 h-4" /> Add Company
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-slate-900/60 border border-white/10 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map(company => (
            <div key={company._id} className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{company.name}</h3>
                    <p className="text-slate-500 text-xs">{company.industry}</p>
                  </div>
                </div>
                {company.isVerified && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border text-xs">Verified</Badge>}
              </div>

              <p className="text-slate-400 text-xs line-clamp-2">{company.description}</p>

              <div className="flex items-center gap-2">
                <div className="flex text-amber-400 text-xs">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < company.difficultyRating ? "fill-current" : "text-slate-600"}`} />
                  ))}
                </div>
                <span className="text-slate-500 text-xs">{company.location}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-white/5">
                <span>{company.frequentlyAskedQuestions?.length || 0} questions</span>
                <span>{company.interviewExperiences?.length || 0} experiences</span>
                <div className="flex gap-1">
                  <Button onClick={() => openEdit(company)} variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/5">
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button onClick={() => setDeleteTarget(company)} variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Company" : "Add Company"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="text-slate-300 text-sm">Company Name</Label>
              <Input {...register("name")} placeholder="e.g. Google" className="mt-1 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Website</Label>
              <Input {...register("website")} placeholder="https://careers.company.com" className="mt-1 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500" />
              {errors.website && <p className="text-red-400 text-xs mt-1">{errors.website.message}</p>}
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Description</Label>
              <Textarea {...register("description")} placeholder="Brief company description..." rows={3} className="mt-1 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 resize-none" />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-300 text-sm">Industry</Label>
                <Select onValueChange={v => setValue("industry", v)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-white/10 text-white">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {INDUSTRIES.map(i => <SelectItem key={i} value={i} className="text-white">{i}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.industry && <p className="text-red-400 text-xs mt-1">{errors.industry.message}</p>}
              </div>
              <div>
                <Label className="text-slate-300 text-sm">Company Size</Label>
                <Select onValueChange={v => setValue("size", v)}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-white/10 text-white">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {SIZES.map(s => <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Location</Label>
              <Input {...register("location")} placeholder="e.g. Mountain View, CA" className="mt-1 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500" />
            </div>
            <div>
              <Label className="text-slate-300 text-sm mb-2 block">Interview Difficulty</Label>
              <StarPicker value={difficultyValue} onChange={setDifficultyValue} />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
              <Button type="submit" disabled={createCompany.isPending || updateCompany.isPending}
                className="bg-indigo-600 hover:bg-indigo-500 text-white border-0">
                {editTarget ? "Save Changes" : "Create Company"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader><DialogTitle>Delete Company</DialogTitle></DialogHeader>
          <p className="text-slate-400">Delete <strong className="text-white">{deleteTarget?.name}</strong>? This cannot be undone.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
            <Button onClick={() => { toast.error("Delete not implemented — contact DB admin"); setDeleteTarget(null) }}
              className="bg-red-600 hover:bg-red-500 text-white border-0">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
