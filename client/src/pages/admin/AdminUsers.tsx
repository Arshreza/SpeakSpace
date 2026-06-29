import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { Search, MoreHorizontal, Shield, Ban, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import api from "@/utils/api"
import { formatDate } from "@/utils/formatters"
import { useDebounce } from "@/hooks/useDebounce"

interface AdminUser {
  _id: string
  name: string
  email: string
  role: "student" | "recruiter" | "admin"
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  lastLogin?: string
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/20 text-red-400 border-red-500/30",
  recruiter: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  student: "bg-blue-500/20 text-blue-400 border-blue-500/30",
}

export default function AdminUsers() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const debouncedSearch = useDebounce(search, 400)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, debouncedSearch, roleFilter, statusFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 20 }
      if (debouncedSearch) params.search = debouncedSearch
      if (roleFilter !== "all") params.role = roleFilter
      if (statusFilter !== "all") params.isActive = statusFilter === "active" ? "true" : "false"
      const res = await api.get("/admin/users", { params })
      return res.data.data as { users: AdminUser[]; total: number; pages: number }
    }
  })

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => api.put(`/admin/users/${id}`, { role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Role updated") },
    onError: () => toast.error("Failed to update role")
  })

  const toggleStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.put(`/admin/users/${id}`, { isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("User status updated") },
    onError: () => toast.error("Failed to update status")
  })

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success("User deactivated")
      setDeleteTarget(null)
    },
    onError: () => toast.error("Failed to delete user")
  })

  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all platform users</p>
        </div>
        <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 border text-sm px-3 py-1">
          {data?.total ?? "—"} total
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or email..." className="pl-9 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500" />
        </div>
        <Select value={roleFilter} onValueChange={v => { setRoleFilter(v); setPage(1) }}>
          <SelectTrigger className="w-36 bg-slate-800/50 border-white/10 text-white">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10">
            <SelectItem value="all" className="text-white">All Roles</SelectItem>
            <SelectItem value="student" className="text-white">Student</SelectItem>
            <SelectItem value="recruiter" className="text-white">Recruiter</SelectItem>
            <SelectItem value="admin" className="text-white">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-36 bg-slate-800/50 border-white/10 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10">
            <SelectItem value="all" className="text-white">All Status</SelectItem>
            <SelectItem value="active" className="text-white">Active</SelectItem>
            <SelectItem value="inactive" className="text-white">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-slate-400">#</TableHead>
              <TableHead className="text-slate-400">User</TableHead>
              <TableHead className="text-slate-400">Role</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Joined</TableHead>
              <TableHead className="text-slate-400">Verified</TableHead>
              <TableHead className="text-slate-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <TableRow key={i} className="border-white/5">
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-slate-800 rounded animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.users.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-slate-500 py-12">No users found</TableCell></TableRow>
            ) : data?.users.map((user, idx) => (
              <TableRow key={user._id} className="border-white/5 hover:bg-white/[0.02]">
                <TableCell className="text-slate-500 text-sm">{(page - 1) * 20 + idx + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials(user.name)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{user.name}</p>
                      <p className="text-slate-500 text-xs">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${ROLE_COLORS[user.role]} border text-xs`}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={user.isActive ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border" : "bg-red-500/20 text-red-400 border-red-500/30 border"}>
                    {user.isActive ? "Active" : "Suspended"}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-400 text-sm">{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <span className={`text-xs ${user.isEmailVerified ? "text-emerald-400" : "text-slate-500"}`}>
                    {user.isEmailVerified ? "✓ Verified" : "Pending"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white">
                      <DropdownMenuItem className="hover:bg-white/5 gap-2 cursor-pointer">
                        <Eye className="w-4 h-4" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      {["student", "recruiter", "admin"].filter(r => r !== user.role).map(r => (
                        <DropdownMenuItem key={r} onClick={() => updateRole.mutate({ id: user._id, role: r })}
                          className="hover:bg-white/5 gap-2 cursor-pointer capitalize">
                          <Shield className="w-4 h-4" /> Make {r}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={() => toggleStatus.mutate({ id: user._id, isActive: !user.isActive })}
                        className="hover:bg-white/5 gap-2 cursor-pointer">
                        <Ban className="w-4 h-4" /> {user.isActive ? "Suspend" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteTarget(user)}
                        className="hover:bg-red-500/10 text-red-400 gap-2 cursor-pointer">
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">Page {page} of {data.pages} ({data.total} users)</p>
          <div className="flex gap-2">
            <Button onClick={() => setPage(p => p - 1)} disabled={page === 1} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button onClick={() => setPage(p => p + 1)} disabled={page === data.pages} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-slate-400">Are you sure you want to deactivate <strong className="text-white">{deleteTarget?.name}</strong>? They will lose access to the platform.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-white/10 text-white hover:bg-white/5">Cancel</Button>
            <Button onClick={() => deleteTarget && deleteUser.mutate(deleteTarget._id)}
              disabled={deleteUser.isPending} className="bg-red-600 hover:bg-red-500 text-white border-0">
              {deleteUser.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
